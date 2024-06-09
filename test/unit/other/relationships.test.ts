import type {GetCell, Id, Relationships, Store} from 'tinybase/debug';
import {createRelationships, createStore} from 'tinybase/debug';
import {expectChanges, expectNoChanges} from '../common/expect.ts';
import {RelationshipsListener} from '../common/types.ts';
import {createRelationshipsListener} from '../common/listeners.ts';
import {getRelationshipsObject} from '../common/other.ts';
import {jest} from '@jest/globals';

let store: Store;
let relationships: Relationships;
let listener: RelationshipsListener;

const setCells = () =>
  store
    .setTables({
      t1: {r1: {c1: 'R1', c2: 'R2'}, r2: {c1: 'R1', c2: 'R3'}},
      T1: {R1: {C1: 1}, R2: {C1: 1}, R3: {C1: 1}},
    })
    .setTable('t1', {r1: {c1: 'R1', c2: 'R2'}, r2: {c1: 'R2', c2: 'R2'}})
    .setRow('t1', 'r1', {c1: 'R2', c2: 'R1'})
    .setCell('t1', 'r1', 'c1', 'R3');

const delCells = () =>
  store.delCell('t1', 'r2', 'c2').delRow('t1', 'r1').delTables();

const customLink = (getCell: GetCell, localRowId: Id): Id =>
  'R' +
  Math.abs(
    parseInt((getCell('c1') ?? '_').toString()[1]) - parseInt(localRowId[1]),
  );

beforeEach(() => {
  store = createStore();
  relationships = createRelationships(store);
});

describe('Sets', () => {
  test('simple relationship', () => {
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expect(getRelationshipsObject(relationships)['r1']).toEqual([
      {r1: 'R3', r2: 'R2'},
      {R2: ['r2'], R3: ['r1']},
    ]);
    delCells();
    expect(getRelationshipsObject(relationships)['r1']).toEqual([{}, {}]);
  });

  test('simple relationship, non present', () => {
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c3');
    expect(getRelationshipsObject(relationships)['r1']).toEqual([{}, {}]);
    delCells();
    expect(getRelationshipsObject(relationships)['r1']).toEqual([{}, {}]);
  });

  test('custom relationship', () => {
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', customLink);
    expect(getRelationshipsObject(relationships)['r1']).toEqual([
      {r1: 'R2', r2: 'R0'},
      {R2: ['r1']},
    ]);
    delCells();
    expect(getRelationshipsObject(relationships)['r1']).toEqual([{}, {}]);
  });

  test('definition before data', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    setCells();
    expect(getRelationshipsObject(relationships)['r1']).toEqual([
      {r1: 'R3', r2: 'R2'},
      {R2: ['r2'], R3: ['r1']},
    ]);
  });

  test('change definitions', () => {
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expect(getRelationshipsObject(relationships)['r1']).toEqual([
      {r1: 'R3', r2: 'R2'},
      {R2: ['r2'], R3: ['r1']},
    ]);
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c2');
    expect(getRelationshipsObject(relationships)['r1']).toEqual([
      {r1: 'R1', r2: 'R2'},
      {R1: ['r1'], R2: ['r2']},
    ]);
    delCells();
    expect(getRelationshipsObject(relationships)['r1']).toEqual([{}, {}]);
  });

  test('two definitions', () => {
    setCells();
    relationships
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't1', 'T1', 'c2');
    expect(getRelationshipsObject(relationships)['r1']).toEqual([
      {r1: 'R3', r2: 'R2'},
      {R2: ['r2'], R3: ['r1']},
    ]);
    expect(getRelationshipsObject(relationships)['r2']).toEqual([
      {r1: 'R1', r2: 'R2'},
      {R1: ['r1'], R2: ['r2']},
    ]);
    delCells();
    expect(getRelationshipsObject(relationships)['r1']).toEqual([{}, {}]);
    expect(getRelationshipsObject(relationships)['r2']).toEqual([{}, {}]);
  });
});

test('Listens to RelationshipIds', () => {
  const listener = createRelationshipsListener(relationships);
  const listenerId = listener.listenToRelationshipIds('/r');
  relationships.setRelationshipDefinition('r1', 't1', 't2', 'c1');
  relationships.setRelationshipDefinition('r2', 't2', 't2', 'c1');
  relationships.delRelationshipDefinition('r1');
  expectChanges(listener, '/r', ['r1'], ['r1', 'r2'], ['r2']);
  expectNoChanges(listener);
  relationships.delListener(listenerId);
});

describe('Listens to RemoteRowIds when sets', () => {
  beforeEach(() => {
    listener = createRelationshipsListener(relationships);
    listener.listenToRemoteRowId('/r1/r1', 'r1', 'r1');
    listener.listenToRemoteRowId('/r1/r*', 'r1', null);
    listener.listenToRemoteRowId('/r*/r1', null, 'r1');
    listener.listenToRemoteRowId('/r*/r*', null, null);
  });

  test('and callback with ids', () => {
    expect.assertions(4);
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    const listener = jest.fn((relationships2, relationshipId, localRowId) => {
      expect(relationships2).toEqual(relationships);
      expect(relationshipId).toEqual('r1');
      expect(localRowId).toEqual('r1');
    });
    relationships.addRemoteRowIdListener('r1', 'r1', listener);
    store.setTables({t1: {r1: {c1: 'r1'}}});
    expect(listener).toHaveBeenCalled();
  });

  test('simple relationship', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/r1',
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r1/r*',
      {r1: {r1: 'R1'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R2'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r1',
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r*',
      {r1: {r1: 'R1'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R2'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectNoChanges(listener);
  });

  test('simple relationship, non present', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c3');
    setCells();
    delCells();
    expectNoChanges(listener);
  });

  test('custom relationship', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', customLink);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/r1',
      {r1: {r1: 'R0'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r1/r*',
      {r1: {r1: 'R0'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R0'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r1',
      {r1: {r1: 'R0'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r*',
      {r1: {r1: 'R0'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R0'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectNoChanges(listener);
  });

  test('definition after data', () => {
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expectChanges(listener, '/r1/r1', {r1: {r1: 'R3'}});
    expectChanges(listener, '/r1/r*', {r1: {r1: 'R3'}}, {r1: {r2: 'R2'}});
    expectChanges(listener, '/r*/r1', {r1: {r1: 'R3'}});
    expectChanges(listener, '/r*/r*', {r1: {r1: 'R3'}}, {r1: {r2: 'R2'}});
    expectNoChanges(listener);
  });

  test('change definitions', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c2');
    delCells();
    expectChanges(
      listener,
      '/r1/r1',
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r1/r*',
      {r1: {r1: 'R1'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R2'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r1',
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r*',
      {r1: {r1: 'R1'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R2'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: 'R1'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectNoChanges(listener);
  });

  test('two definitions', () => {
    listener.listenToRemoteRowId('/r2/r1', 'r2', 'r1');
    listener.listenToRemoteRowId('/r2/r*', 'r2', null);
    relationships
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't1', 'T1', 'c2');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/r1',
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r1/r*',
      {r1: {r1: 'R1'}},
      {r1: {r2: 'R1'}},
      {r1: {r2: 'R2'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectChanges(
      listener,
      '/r2/r1',
      {r2: {r1: 'R2'}},
      {r2: {r1: 'R1'}},
      {r2: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r2/r*',
      {r2: {r1: 'R2'}},
      {r2: {r2: 'R3'}},
      {r2: {r2: 'R2'}},
      {r2: {r1: 'R1'}},
      {r2: {r2: undefined}},
      {r2: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r1',
      {r1: {r1: 'R1'}},
      {r2: {r1: 'R2'}},
      {r1: {r1: 'R2'}},
      {r2: {r1: 'R1'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
      {r2: {r1: undefined}},
    );
    expectChanges(
      listener,
      '/r*/r*',
      {r1: {r1: 'R1'}},
      {r1: {r2: 'R1'}},
      {r2: {r1: 'R2'}},
      {r2: {r2: 'R3'}},
      {r1: {r2: 'R2'}},
      {r2: {r2: 'R2'}},
      {r1: {r1: 'R2'}},
      {r2: {r1: 'R1'}},
      {r1: {r1: 'R3'}},
      {r2: {r2: undefined}},
      {r1: {r1: undefined}},
      {r2: {r1: undefined}},
      {r1: {r2: undefined}},
    );
    expectNoChanges(listener);
  });

  test('listener stats', () => {
    expect(relationships.getListenerStats().remoteRowId).toEqual(4);
  });
});

describe('Listens to LocalRowIds when sets', () => {
  beforeEach(() => {
    listener = createRelationshipsListener(relationships);
    listener.listenToLocalRowIds('/r1/R1', 'r1', 'R1');
    listener.listenToLocalRowIds('/r1/R2', 'r1', 'R2');
    listener.listenToLocalRowIds('/r1/R*', 'r1', null);
    listener.listenToLocalRowIds('/r*/R1', null, 'R1');
    listener.listenToLocalRowIds('/r*/R*', null, null);
  });

  test('and callback with ids', () => {
    expect.assertions(4);
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    const listener = jest.fn((relationships2, relationshipId, remoteRowId) => {
      expect(relationships2).toEqual(relationships);
      expect(relationshipId).toEqual('r1');
      expect(remoteRowId).toEqual('R1');
    });
    relationships.addLocalRowIdsListener('r1', 'R1', listener);
    store.setTables({t1: {r1: {c1: 'R1'}}});
    expect(listener).toHaveBeenCalled();
  });

  test('simple relationship', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/R1',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r1/R2',
      {r1: {R2: ['r2']}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R2: []}},
    );
    expectChanges(
      listener,
      '/r1/R*',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R1: []}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R3: ['r1']}},
      {r1: {R3: []}},
      {r1: {R2: []}},
    );
    expectChanges(
      listener,
      '/r*/R1',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r*/R*',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R1: []}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R3: ['r1']}},
      {r1: {R3: []}},
      {r1: {R2: []}},
    );
    expectNoChanges(listener);
  });

  test('simple relationship, non present', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c3');
    setCells();
    delCells();
    expectNoChanges(listener);
  });

  test('custom relationship', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', customLink);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/R1',
      {r1: {R1: ['r2']}},
      {r1: {R1: []}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(listener, '/r1/R2', {r1: {R2: ['r1']}}, {r1: {R2: []}});
    expectChanges(
      listener,
      '/r1/R*',
      {r1: {R0: ['r1']}},
      {r1: {R1: ['r2']}},
      {r1: {R1: []}},
      {r1: {R0: ['r1', 'r2']}},
      {r1: {R0: ['r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
      {r1: {R2: ['r1']}},
      {r1: {R2: []}},
      {r1: {R0: []}},
    );
    expectChanges(
      listener,
      '/r*/R1',
      {r1: {R1: ['r2']}},
      {r1: {R1: []}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r*/R*',
      {r1: {R0: ['r1']}},
      {r1: {R1: ['r2']}},
      {r1: {R1: []}},
      {r1: {R0: ['r1', 'r2']}},
      {r1: {R0: ['r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
      {r1: {R2: ['r1']}},
      {r1: {R2: []}},
      {r1: {R0: []}},
    );
    expectNoChanges(listener);
  });

  test('definition after data', () => {
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expectChanges(listener, '/r1/R2', {r1: {R2: ['r2']}});
    expectChanges(listener, '/r1/R*', {r1: {R3: ['r1']}}, {r1: {R2: ['r2']}});
    expectChanges(listener, '/r*/R*', {r1: {R3: ['r1']}}, {r1: {R2: ['r2']}});
    expectNoChanges(listener);
  });

  test('change definitions', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    setCells();
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c2');
    delCells();
    expectChanges(
      listener,
      '/r1/R1',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r1/R2',
      {r1: {R2: ['r2']}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R2: []}},
    );
    expectChanges(
      listener,
      '/r1/R*',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R1: []}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R3: ['r1']}},
      {r1: {R3: []}},
      {r1: {R1: ['r1']}},
      {r1: {R2: []}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r*/R1',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r*/R*',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R1: []}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R3: ['r1']}},
      {r1: {R3: []}},
      {r1: {R1: ['r1']}},
      {r1: {R2: []}},
      {r1: {R1: []}},
    );
    expectNoChanges(listener);
  });

  test('two definitions', () => {
    relationships
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't1', 'T1', 'c2');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/R1',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
    );
    expectChanges(
      listener,
      '/r1/R2',
      {r1: {R2: ['r2']}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R2: []}},
    );
    expectChanges(
      listener,
      '/r1/R*',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R1: []}},
      {r1: {R2: ['r2', 'r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R3: ['r1']}},
      {r1: {R3: []}},
      {r1: {R2: []}},
    );
    expectChanges(
      listener,
      '/r*/R1',
      {r1: {R1: ['r1', 'r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R1: []}},
      {r2: {R1: ['r1']}},
      {r2: {R1: []}},
    );
    expectChanges(
      listener,
      '/r*/R*',
      {r1: {R1: ['r1', 'r2']}},
      {r2: {R2: ['r1']}},
      {r2: {R3: ['r2']}},
      {r1: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r2: {R3: []}},
      {r2: {R2: ['r1', 'r2']}},
      {r1: {R1: []}},
      {r1: {R2: ['r2', 'r1']}},
      {r2: {R2: ['r2']}},
      {r2: {R1: ['r1']}},
      {r1: {R2: ['r2']}},
      {r1: {R3: ['r1']}},
      {r2: {R2: []}},
      {r1: {R3: []}},
      {r2: {R1: []}},
      {r1: {R2: []}},
    );
    expectNoChanges(listener);
  });

  test('listener stats', () => {
    expect(relationships.getListenerStats().localRowIds).toEqual(5);
  });
});

describe('Linked lists', () => {
  const setLinkedCells = (): void => {
    store.setTables({
      t1: {r1: {c1: 'r2'}, r2: {c1: ''}},
    });
    store.setTable('t1', {r1: {c1: 'r2'}, r2: {c1: ''}, r3: {c1: ''}});
    store.setRow('t1', 'r2', {c1: 'r3'});
    store.setCell('t1', 'r3', 'c1', 'r4');
  };

  const delLinkedCells = (): void => {
    store.delCell('t1', 'r3', 'c2');
    store.delRow('t1', 'r2');
    store.delTables();
  };

  test('Get linked list', () => {
    relationships.setRelationshipDefinition('r1', 't1', 't1', 'c1');
    setLinkedCells();
    expect(relationships.getLinkedRowIds('r1', 'r1')).toEqual([
      'r1',
      'r2',
      'r3',
      'r4',
    ]);
    expect(relationships.getLinkedRowIds('r1', 'r2')).toEqual([
      'r2',
      'r3',
      'r4',
    ]);
    delLinkedCells();
    expect(relationships.getLinkedRowIds('r1', 'r1')).toEqual(['r1']);
    expect(relationships.getLinkedRowIds('r1', 'r2')).toEqual(['r2']);
  });

  test('Listen to linked lists', () => {
    const listener = createRelationshipsListener(relationships);
    listener.listenToLinkedRowIds('/r1/r1', 'r1', 'r1');
    listener.listenToLinkedRowIds('/r1/r2', 'r1', 'r2');
    expect(relationships.getListenerStats().linkedRowIds).toEqual(2);

    relationships.setRelationshipDefinition('r1', 't1', 't1', 'c1');
    setLinkedCells();
    delLinkedCells();
    expectChanges(
      listener,
      '/r1/r1',
      {r1: {r1: ['r1', 'r2', '']}},
      {r1: {r1: ['r1', 'r2', 'r3', '']}},
      {r1: {r1: ['r1', 'r2', 'r3', 'r4']}},
      {r1: {r1: ['r1', 'r2']}},
      {r1: {r1: ['r1']}},
    );
    expectChanges(
      listener,
      '/r1/r2',
      {r1: {r2: ['r2', '']}},
      {r1: {r2: ['r2', 'r3', '']}},
      {r1: {r2: ['r2', 'r3', 'r4']}},
      {r1: {r2: ['r2']}},
    );
    expectNoChanges(listener);
  });
});

describe('Miscellaneous', () => {
  test('Listener cannot mutate original store', () => {
    const listener = jest.fn(() => {
      store.setValue('mutated', true);
    });
    relationships.setRelationshipDefinition('r1', 't1', 't1', 'c1');
    relationships.addRemoteRowIdListener('r1', 'r1', listener);
    store.setCell('t1', 'r1', 'c1', 'r1');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 'r1'}}});
    expect(relationships.getRemoteRowId('r1', 'r1')).toEqual('r1');
    expect(store.getValues()).toEqual({});
  });

  test('remove listener', () => {
    listener = createRelationshipsListener(relationships);
    const listenerId = listener.listenToRemoteRowId('/r1/r1', 'r1', 'r1');
    expect(relationships.getListenerStats().remoteRowId).toEqual(1);
    expect(listenerId).toEqual('0');
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/r1/r1',
      {r1: {r1: 'R1'}},
      {r1: {r1: 'R2'}},
      {r1: {r1: 'R3'}},
      {r1: {r1: undefined}},
    );
    expectNoChanges(listener);
    relationships.delListener(listenerId);
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);
    setCells();
    delCells();
    expectNoChanges(listener);
  });

  test('forEachRelationship', () => {
    relationships
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't1', 'T1', 'c2');
    setCells();
    const eachRelationship: any = {};
    relationships.forEachRelationship((relationshipsId, forEachRow) => {
      const eachRow: any = {};
      forEachRow((rowId, forEachCell) => {
        const eachCell: any = {};
        forEachCell((cellId, cell) => (eachCell[cellId] = cell));
        eachRow[rowId] = eachCell;
      });
      eachRelationship[relationshipsId] = eachRow;
    });
    expect(eachRelationship).toEqual({
      r1: {r1: {c1: 'R3', c2: 'R1'}, r2: {c1: 'R2', c2: 'R2'}},
      r2: {r1: {c1: 'R3', c2: 'R1'}, r2: {c1: 'R2', c2: 'R2'}},
    });
  });

  test('getRelationshipIds', () => {
    relationships
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't1', 'T1', 'c2');
    setCells();
    expect(relationships.getRelationshipIds()).toEqual(['r1', 'r2']);
  });

  test('are things present', () => {
    expect(relationships.hasRelationship('r1')).toEqual(false);
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expect(relationships.hasRelationship('r1')).toEqual(true);
  });

  test('get the tables back out', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expect(relationships.getLocalTableId('r1')).toEqual('t1');
    expect(relationships.getRemoteTableId('r1')).toEqual('T1');
  });

  test('creates new relationships against different store', () => {
    const store1 = createStore();
    const store2 = createStore();
    const relationships1 = createRelationships(store1);
    const relationships2 = createRelationships(store2);
    expect(relationships1).not.toBe(relationships2);
  });

  test('re-uses relationships against existing store', () => {
    const store = createStore();
    const relationships1 = createRelationships(store);
    const relationships2 = createRelationships(store);
    expect(relationships1).toBe(relationships2);
  });

  test('removes index definition and destroys', () => {
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    relationships.delRelationshipDefinition('r1');
    setCells();
    expect(getRelationshipsObject(relationships)['r1']).toBeUndefined();
    relationships.destroy();
  });

  test('getStore', () => {
    expect(relationships.getStore()).toEqual(store);
  });

  test('removes relationship definition', () => {
    expect(relationships.getStore().getListenerStats().table).toEqual(0);
    expect(relationships.getStore().getListenerStats().row).toEqual(0);
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expect(relationships.getStore().getListenerStats().table).toEqual(1);
    expect(relationships.getStore().getListenerStats().row).toEqual(1);
    relationships.delRelationshipDefinition('r1');
    expect(relationships.getStore().getListenerStats().table).toEqual(0);
    expect(relationships.getStore().getListenerStats().row).toEqual(0);
    setCells();
    expect(getRelationshipsObject(relationships)['r1']).toBeUndefined();
  });

  test('destroys', () => {
    expect(relationships.getStore().getListenerStats().table).toEqual(0);
    expect(relationships.getStore().getListenerStats().row).toEqual(0);
    relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    expect(relationships.getStore().getListenerStats().table).toEqual(1);
    expect(relationships.getStore().getListenerStats().row).toEqual(1);
    relationships.destroy();
    expect(relationships.getStore().getListenerStats().table).toEqual(0);
    expect(relationships.getStore().getListenerStats().row).toEqual(0);
  });
});
