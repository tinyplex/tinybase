import type {GetCell, Id, Indexes, SortKey, Store} from 'tinybase/debug';
import {createIndexes, createStore} from 'tinybase/debug';
import {expectChanges, expectNoChanges} from '../common/expect.ts';
import {IndexesListener} from '../common/types.ts';
import {createIndexesListener} from '../common/listeners.ts';
import {getIndexesObject} from '../common/other';
import {jest} from '@jest/globals';

let store: Store;
let indexes: Indexes;
let listener: IndexesListener;

const setCells = () =>
  store
    .setTables({t1: {r1: {c1: 'one', c2: 'odd'}}})
    .setTable('t1', {
      r2: {c1: 'two', c2: 'even'},
      r3: {c1: 'three', c2: 'odd'},
    })
    .setRow('t1', 'r1', {c1: 'one', c2: 'odd'})
    .setCell('t1', 'r4', 'c1', 'four')
    .setCell('t1', 'r4', 'c2', 'even');

const delCells = () =>
  store
    .delCell('t1', 'r4', 'c2')
    .delCell('t1', 'r4', 'c1')
    .delRow('t1', 'r3')
    .delRow('t1', 'r2')
    .delTable('t1')
    .delTables();

const firstOrSecondLetter = (getCell: GetCell) =>
  (getCell('c1') as string)[getCell('c2') === 'odd' ? 0 : 1];

const keyAndValue = (getCell: GetCell, rowId: Id) => getCell('c2') + rowId;

const letters = (getCell: GetCell) => (getCell('c1') + '').split('');

const ascend = (sortKey1: SortKey, sortKey2: SortKey): number =>
  (sortKey1 ?? 0) > (sortKey2 ?? 0) ? 1 : -1;
const descend = (sortKey1: SortKey, sortKey2: SortKey): number =>
  (sortKey1 ?? 0) < (sortKey2 ?? 0) ? 1 : -1;
const oddAscend = (sortKey1: SortKey, sortKey2: SortKey, sliceId: Id) =>
  sliceId == 'odd' ? ((sortKey1 ?? 0) > (sortKey2 ?? 0) ? 1 : -1) : 0;
const oddDescend = (sortKey1: SortKey, sortKey2: SortKey, sliceId: Id) =>
  sliceId == 'odd' ? ((sortKey1 ?? 0) < (sortKey2 ?? 0) ? 1 : -1) : 0;

beforeEach(() => {
  store = createStore();
  indexes = createIndexes(store);
});

describe('Sets', () => {
  test('default index', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      '': ['r2', 'r3', 'r1', 'r4'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('string key index', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r2', 'r4'],
      odd: ['r3', 'r1'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('string key index, sort sliceIds', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2', undefined, ascend);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r2', 'r4'],
      odd: ['r3', 'r1'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('string key index, default sortKey sort', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r4', 'r2'],
      odd: ['r1', 'r3'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('string key index, custom sortKey sort', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', undefined, descend);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r2', 'r4'],
      odd: ['r3', 'r1'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('string key index, sorting sliceIds and sortKey sort', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', ascend, oddAscend);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r2', 'r4'],
      odd: ['r1', 'r3'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('custom Id index', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', firstOrSecondLetter);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      w: ['r2'],
      t: ['r3'],
      o: ['r1', 'r4'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('custom Id index with key', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', keyAndValue);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      evenr2: ['r2'],
      oddr3: ['r3'],
      oddr1: ['r1'],
      evenr4: ['r4'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('custom Id index returning array', () => {
    setCells();
    store.setCell('t1', 'r2', 'c1', 'duo');
    indexes.setIndexDefinition('i1', 't1', letters);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      d: ['r2'],
      u: ['r2', 'r4'],
      o: ['r2', 'r1', 'r4'],
      t: ['r3'],
      h: ['r3'],
      r: ['r3', 'r4'],
      e: ['r3', 'r1'],
      n: ['r1'],
      f: ['r4'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('definition before data', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2');
    setCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      odd: ['r3', 'r1'],
      even: ['r2', 'r4'],
    });
  });

  test('change definitions', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      '': ['r2', 'r3', 'r1', 'r4'],
    });
    indexes.setIndexDefinition('i1', 't1', 'c2');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r2', 'r4'],
      odd: ['r3', 'r1'],
    });
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      even: ['r4', 'r2'],
      odd: ['r1', 'r3'],
    });
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', descend, oddDescend);
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      odd: ['r3', 'r1'],
      even: ['r4', 'r2'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('two definitions', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't1', 'c2');
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      '': ['r2', 'r3', 'r1', 'r4'],
    });
    expect(getIndexesObject(indexes)['i2']).toEqualWithOrder({
      even: ['r2', 'r4'],
      odd: ['r3', 'r1'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
    expect(getIndexesObject(indexes)['i2']).toEqualWithOrder({});
  });
});

test('Listens to IndexIds', () => {
  const listener = createIndexesListener(indexes);
  const listenerId = listener.listenToIndexIds('/i');
  indexes.setIndexDefinition('i1', 't1');
  indexes.setIndexDefinition('i2', 't2');
  indexes.delIndexDefinition('i1');
  expectChanges(listener, '/i', ['i1'], ['i1', 'i2'], ['i2']);
  expectNoChanges(listener);
  indexes.delListener(listenerId);
});

describe('Listens to SliceIds when sets', () => {
  beforeEach(() => {
    listener = createIndexesListener(indexes);
    listener.listenToSliceIds('/i1s', 'i1');
    listener.listenToSliceIds('/i*s', null);
  });

  test('and callback with ids', () => {
    expect.assertions(3);
    indexes.setIndexDefinition('i1', 't1');
    const listener = jest.fn((indexes2, indexId) => {
      expect(indexes2).toEqual(indexes);
      expect(indexId).toEqual('i1');
    });
    indexes.addSliceIdsListener('i1', listener);
    store.setTables({t1: {r1: {c1: 'one', c2: 'odd'}}});
    expect(listener).toHaveBeenCalled();
  });

  test('default index', () => {
    indexes.setIndexDefinition('i1', 't1');
    setCells();
    delCells();
    expectChanges(listener, '/i1s', {i1: ['']}, {i1: []});
    expectChanges(listener, '/i*s', {i1: ['']}, {i1: []});
    expectNoChanges(listener);
  });

  test('string key index', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('string key index, sort sliceIds', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', undefined, ascend);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['odd']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['odd']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('string key index, default sortKey sort', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('string key index, custom sortKey sort', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', undefined, descend);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('string key index, sorting sliceIds and sortKey sort', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', ascend, oddAscend);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['odd']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['', 'even', 'odd']},
      {i1: ['even', 'odd']},
      {i1: ['odd']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('custom Id index', () => {
    indexes.setIndexDefinition('i1', 't1', firstOrSecondLetter);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['o']},
      {i1: ['w', 't']},
      {i1: ['w', 't', 'o']},
      {i1: ['w', 'o']},
      {i1: ['o']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['o']},
      {i1: ['w', 't']},
      {i1: ['w', 't', 'o']},
      {i1: ['w', 'o']},
      {i1: ['o']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('custom Id index with key', () => {
    indexes.setIndexDefinition('i1', 't1', keyAndValue);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['oddr1']},
      {i1: ['evenr2', 'oddr3']},
      {i1: ['evenr2', 'oddr3', 'oddr1']},
      {i1: ['evenr2', 'oddr3', 'oddr1', 'undefinedr4']},
      {i1: ['evenr2', 'oddr3', 'oddr1', 'evenr4']},
      {i1: ['evenr2', 'oddr3', 'oddr1', 'undefinedr4']},
      {i1: ['evenr2', 'oddr3', 'oddr1']},
      {i1: ['evenr2', 'oddr1']},
      {i1: ['oddr1']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['oddr1']},
      {i1: ['evenr2', 'oddr3']},
      {i1: ['evenr2', 'oddr3', 'oddr1']},
      {i1: ['evenr2', 'oddr3', 'oddr1', 'undefinedr4']},
      {i1: ['evenr2', 'oddr3', 'oddr1', 'evenr4']},
      {i1: ['evenr2', 'oddr3', 'oddr1', 'undefinedr4']},
      {i1: ['evenr2', 'oddr3', 'oddr1']},
      {i1: ['evenr2', 'oddr1']},
      {i1: ['oddr1']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('custom Id index returning array', () => {
    indexes.setIndexDefinition('i1', 't1', letters);
    setCells();
    store.setCell('t1', 'r2', 'c1', 'duo');
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['o', 'n', 'e']},
      {i1: ['o', 'e', 't', 'w', 'h', 'r']},
      {i1: ['o', 'e', 't', 'w', 'h', 'r', 'n']},
      {i1: ['o', 'e', 't', 'w', 'h', 'r', 'n', 'f', 'u']},
      {i1: ['o', 'e', 't', 'h', 'r', 'n', 'f', 'u', 'd']},
      {i1: ['o', 'e', 't', 'h', 'r', 'n', 'u', 'd']},
      {i1: ['o', 'e', 'n', 'u', 'd']},
      {i1: ['o', 'e', 'n']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['o', 'n', 'e']},
      {i1: ['o', 'e', 't', 'w', 'h', 'r']},
      {i1: ['o', 'e', 't', 'w', 'h', 'r', 'n']},
      {i1: ['o', 'e', 't', 'w', 'h', 'r', 'n', 'f', 'u']},
      {i1: ['o', 'e', 't', 'h', 'r', 'n', 'f', 'u', 'd']},
      {i1: ['o', 'e', 't', 'h', 'r', 'n', 'u', 'd']},
      {i1: ['o', 'e', 'n', 'u', 'd']},
      {i1: ['o', 'e', 'n']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('definition after data', () => {
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2');
    expectChanges(listener, '/i1s', {i1: ['even', 'odd']});
    expectChanges(listener, '/i*s', {i1: ['even', 'odd']});
    expectNoChanges(listener);
  });

  test('change definitions', () => {
    indexes.setIndexDefinition('i1', 't1');
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2');
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1');
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', descend, oddDescend);
    delCells();
    expectChanges(
      listener,
      '/i1s',
      {i1: ['']},
      {i1: ['even', 'odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['']},
      {i1: ['even', 'odd']},
      {i1: ['odd', 'even']},
      {i1: ['odd', 'even', '']},
      {i1: ['odd', 'even']},
      {i1: ['odd']},
      {i1: []},
    );
    expectNoChanges(listener);
  });

  test('two definitions', () => {
    listener.listenToSliceIds('/i2s', 'i2');
    indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't1', 'c2');
    setCells();
    delCells();
    expectChanges(listener, '/i1s', {i1: ['']}, {i1: []});
    expectChanges(
      listener,
      '/i2s',
      {i2: ['odd']},
      {i2: ['odd', 'even']},
      {i2: ['odd', 'even', '']},
      {i2: ['odd', 'even']},
      {i2: ['odd', 'even', '']},
      {i2: ['odd', 'even']},
      {i2: ['odd']},
      {i2: []},
    );
    expectChanges(
      listener,
      '/i*s',
      {i1: ['']},
      {i2: ['odd']},
      {i2: ['odd', 'even']},
      {i2: ['odd', 'even', '']},
      {i2: ['odd', 'even']},
      {i2: ['odd', 'even', '']},
      {i2: ['odd', 'even']},
      {i2: ['odd']},
      {i1: []},
      {i2: []},
    );
    expectNoChanges(listener);
  });

  test('listener stats', () => {
    expect(indexes.getListenerStats().sliceIds).toEqual(2);
  });
});

describe('Listens to SliceRowIds when sets', () => {
  beforeEach(() => {
    listener = createIndexesListener(indexes);
  });

  test('and callback with ids', () => {
    expect.assertions(4);
    indexes.setIndexDefinition('i1', 't1');
    const listener = jest.fn((indexes2, indexId, sliceId) => {
      expect(indexes2).toEqual(indexes);
      expect(indexId).toEqual('i1');
      expect(sliceId).toEqual('');
    });
    indexes.addSliceRowIdsListener('i1', '', listener);
    store.setTables({t1: {r1: {c1: 'one', c2: 'odd'}}});
    expect(listener).toHaveBeenCalled();
  });

  test('default index', () => {
    indexes.setIndexDefinition('i1', 't1');
    listener.listenToSliceRowIds('/i1/_', 'i1', '');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/_', null, '');
    listener.listenToSliceRowIds('/i*/*', null, null);
    expect(indexes.getListenerStats().sliceRowIds).toEqual(4);

    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/_',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i*/_',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectNoChanges(listener);
  });

  test('string key index', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2');
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);

    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i1/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectNoChanges(listener);
  });

  test('string key index, sort sliceIds', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', undefined, ascend);
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i1/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectNoChanges(listener);
  });

  test('string key index, default sortKey sort', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1');
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i1/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectNoChanges(listener);
  });

  test('string key index, custom sortKey sort', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', undefined, descend);
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i1/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectNoChanges(listener);
  });

  test('string key index, sorting sliceIds and sortKey sort', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', ascend, oddAscend);
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i1/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i1: {odd: ['r1']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i1: {even: ['r2']}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {odd: ['r1']}},
      {i1: {even: ['r2']}},
      {i1: {odd: ['r3']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectNoChanges(listener);
  });

  test('custom Id index', () => {
    indexes.setIndexDefinition('i1', 't1', firstOrSecondLetter);
    listener.listenToSliceRowIds('/i1/o', 'i1', 'o');
    listener.listenToSliceRowIds('/i1/t', 'i1', 't');
    listener.listenToSliceRowIds('/i1/w', 'i1', 'w');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/o', null, 'o');
    listener.listenToSliceRowIds('/i*/t', null, 't');
    listener.listenToSliceRowIds('/i*/w', null, 'w');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/o',
      {i1: {o: ['r1']}},
      {i1: {o: []}},
      {i1: {o: ['r1']}},
      {i1: {o: ['r1', 'r4']}},
      {i1: {o: ['r1']}},
      {i1: {o: []}},
    );
    expectChanges(listener, '/i1/t', {i1: {t: ['r3']}}, {i1: {t: []}});
    expectChanges(listener, '/i1/w', {i1: {w: ['r2']}}, {i1: {w: []}});
    expectChanges(
      listener,
      '/i1/*',
      {i1: {o: ['r1']}},
      {i1: {w: ['r2']}},
      {i1: {t: ['r3']}},
      {i1: {o: []}},
      {i1: {o: ['r1']}},
      {i1: {o: ['r1', 'r4']}},
      {i1: {o: ['r1']}},
      {i1: {t: []}},
      {i1: {w: []}},
      {i1: {o: []}},
    );
    expectChanges(
      listener,
      '/i*/o',
      {i1: {o: ['r1']}},
      {i1: {o: []}},
      {i1: {o: ['r1']}},
      {i1: {o: ['r1', 'r4']}},
      {i1: {o: ['r1']}},
      {i1: {o: []}},
    );
    expectChanges(listener, '/i*/t', {i1: {t: ['r3']}}, {i1: {t: []}});
    expectChanges(listener, '/i*/w', {i1: {w: ['r2']}}, {i1: {w: []}});
    expectChanges(
      listener,
      '/i*/*',
      {i1: {o: ['r1']}},
      {i1: {w: ['r2']}},
      {i1: {t: ['r3']}},
      {i1: {o: []}},
      {i1: {o: ['r1']}},
      {i1: {o: ['r1', 'r4']}},
      {i1: {o: ['r1']}},
      {i1: {t: []}},
      {i1: {w: []}},
      {i1: {o: []}},
    );
    expectNoChanges(listener);
  });

  test('custom Id index with key', () => {
    indexes.setIndexDefinition('i1', 't1', keyAndValue);
    listener.listenToSliceRowIds('/i1/oddr1', 'i1', 'oddr1');
    listener.listenToSliceRowIds('/i1/evenr2', 'i1', 'evenr2');
    listener.listenToSliceRowIds('/i1/oddr3', 'i1', 'oddr3');
    listener.listenToSliceRowIds('/i1/undefinedr4', 'i1', 'undefinedr4');
    listener.listenToSliceRowIds('/i1/evenr4', 'i1', 'evenr4');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/oddr1', null, 'oddr1');
    listener.listenToSliceRowIds('/i*/evenr2', null, 'evenr2');
    listener.listenToSliceRowIds('/i*/oddr3', null, 'oddr3');
    listener.listenToSliceRowIds('/i*/undefinedr4', null, 'undefinedr4');
    listener.listenToSliceRowIds('/i*/evenr4', null, 'evenr4');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/oddr1',
      {i1: {oddr1: ['r1']}},
      {i1: {oddr1: []}},
      {i1: {oddr1: ['r1']}},
      {i1: {oddr1: []}},
    );
    expectChanges(
      listener,
      '/i1/evenr2',
      {i1: {evenr2: ['r2']}},
      {i1: {evenr2: []}},
    );
    expectChanges(
      listener,
      '/i1/oddr3',
      {i1: {oddr3: ['r3']}},
      {i1: {oddr3: []}},
    );
    expectChanges(
      listener,
      '/i1/undefinedr4',
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
    );
    expectChanges(
      listener,
      '/i1/evenr4',
      {i1: {evenr4: ['r4']}},
      {i1: {evenr4: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {oddr1: ['r1']}},
      {i1: {evenr2: ['r2']}},
      {i1: {oddr3: ['r3']}},
      {i1: {oddr1: []}},
      {i1: {oddr1: ['r1']}},
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
      {i1: {evenr4: ['r4']}},
      {i1: {evenr4: []}},
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
      {i1: {oddr3: []}},
      {i1: {evenr2: []}},
      {i1: {oddr1: []}},
    );
    expectChanges(
      listener,
      '/i*/oddr1',
      {i1: {oddr1: ['r1']}},
      {i1: {oddr1: []}},
      {i1: {oddr1: ['r1']}},
      {i1: {oddr1: []}},
    );
    expectChanges(
      listener,
      '/i*/evenr2',
      {i1: {evenr2: ['r2']}},
      {i1: {evenr2: []}},
    );
    expectChanges(
      listener,
      '/i*/oddr3',
      {i1: {oddr3: ['r3']}},
      {i1: {oddr3: []}},
    );
    expectChanges(
      listener,
      '/i*/undefinedr4',
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
    );
    expectChanges(
      listener,
      '/i*/evenr4',
      {i1: {evenr4: ['r4']}},
      {i1: {evenr4: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {oddr1: ['r1']}},
      {i1: {evenr2: ['r2']}},
      {i1: {oddr3: ['r3']}},
      {i1: {oddr1: []}},
      {i1: {oddr1: ['r1']}},
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
      {i1: {evenr4: ['r4']}},
      {i1: {evenr4: []}},
      {i1: {undefinedr4: ['r4']}},
      {i1: {undefinedr4: []}},
      {i1: {oddr3: []}},
      {i1: {evenr2: []}},
      {i1: {oddr1: []}},
    );
    expectNoChanges(listener);
  });

  test('custom Id index returning array', () => {
    indexes.setIndexDefinition('i1', 't1', letters);
    listener.listenToSliceRowIds('/i1/o', 'i1', 'o');
    listener.listenToSliceRowIds('/i1/n', 'i1', 'n');
    listener.listenToSliceRowIds('/i1/e', 'i1', 'e');
    listener.listenToSliceRowIds('/i1/t', 'i1', 't');
    listener.listenToSliceRowIds('/i1/w', 'i1', 'w');
    listener.listenToSliceRowIds('/i1/h', 'i1', 'h');
    listener.listenToSliceRowIds('/i1/r', 'i1', 'r');
    listener.listenToSliceRowIds('/i1/f', 'i1', 'f');
    listener.listenToSliceRowIds('/i1/u', 'i1', 'u');
    listener.listenToSliceRowIds('/i1/d', 'i1', 'd');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/o', null, 'o');
    listener.listenToSliceRowIds('/i*/n', null, 'n');
    listener.listenToSliceRowIds('/i*/e', null, 'e');
    listener.listenToSliceRowIds('/i*/t', null, 't');
    listener.listenToSliceRowIds('/i*/w', null, 'w');
    listener.listenToSliceRowIds('/i*/h', null, 'h');
    listener.listenToSliceRowIds('/i*/r', null, 'r');
    listener.listenToSliceRowIds('/i*/f', null, 'f');
    listener.listenToSliceRowIds('/i*/u', null, 'u');
    listener.listenToSliceRowIds('/i*/d', null, 'd');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    store.setCell('t1', 'r2', 'c1', 'duo');
    delCells();
    expectChanges(
      listener,
      '/i1/o',
      {i1: {o: ['r1']}},
      {i1: {o: ['r2']}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {o: ['r2', 'r1', 'r4']}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {o: ['r1']}},
      {i1: {o: []}},
    );
    expectChanges(
      listener,
      '/i1/n',
      {i1: {n: ['r1']}},
      {i1: {n: []}},
      {i1: {n: ['r1']}},
      {i1: {n: []}},
    );
    expectChanges(
      listener,
      '/i1/e',
      {i1: {e: ['r1']}},
      {i1: {e: ['r3']}},
      {i1: {e: ['r3', 'r1']}},
      {i1: {e: ['r1']}},
      {i1: {e: []}},
    );
    expectChanges(
      listener,
      '/i1/t',
      {i1: {t: ['r2', 'r3']}},
      {i1: {t: ['r3']}},
      {i1: {t: []}},
    );
    expectChanges(listener, '/i1/w', {i1: {w: ['r2']}}, {i1: {w: []}});
    expectChanges(listener, '/i1/h', {i1: {h: ['r3']}}, {i1: {h: []}});
    expectChanges(
      listener,
      '/i1/r',
      {i1: {r: ['r3']}},
      {i1: {r: ['r3', 'r4']}},
      {i1: {r: ['r3']}},
      {i1: {r: []}},
    );
    expectChanges(listener, '/i1/f', {i1: {f: ['r4']}}, {i1: {f: []}});
    expectChanges(listener, '/i1/d', {i1: {d: ['r2']}}, {i1: {d: []}});
    expectChanges(
      listener,
      '/i1/u',
      {i1: {u: ['r4']}},
      {i1: {u: ['r4', 'r2']}},
      {i1: {u: ['r2']}},
      {i1: {u: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {o: ['r1']}},
      {i1: {n: ['r1']}},
      {i1: {e: ['r1']}},
      {i1: {t: ['r2', 'r3']}},
      {i1: {w: ['r2']}},
      {i1: {o: ['r2']}},
      {i1: {h: ['r3']}},
      {i1: {r: ['r3']}},
      {i1: {e: ['r3']}},
      {i1: {n: []}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {n: ['r1']}},
      {i1: {e: ['r3', 'r1']}},
      {i1: {f: ['r4']}},
      {i1: {o: ['r2', 'r1', 'r4']}},
      {i1: {u: ['r4']}},
      {i1: {r: ['r3', 'r4']}},
      {i1: {t: ['r3']}},
      {i1: {w: []}},
      {i1: {d: ['r2']}},
      {i1: {u: ['r4', 'r2']}},
      {i1: {f: []}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {u: ['r2']}},
      {i1: {r: ['r3']}},
      {i1: {t: []}},
      {i1: {h: []}},
      {i1: {r: []}},
      {i1: {e: ['r1']}},
      {i1: {d: []}},
      {i1: {u: []}},
      {i1: {o: ['r1']}},
      {i1: {o: []}},
      {i1: {n: []}},
      {i1: {e: []}},
    );
    expectChanges(
      listener,
      '/i*/o',
      {i1: {o: ['r1']}},
      {i1: {o: ['r2']}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {o: ['r2', 'r1', 'r4']}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {o: ['r1']}},
      {i1: {o: []}},
    );
    expectChanges(
      listener,
      '/i*/n',
      {i1: {n: ['r1']}},
      {i1: {n: []}},
      {i1: {n: ['r1']}},
      {i1: {n: []}},
    );
    expectChanges(
      listener,
      '/i*/e',
      {i1: {e: ['r1']}},
      {i1: {e: ['r3']}},
      {i1: {e: ['r3', 'r1']}},
      {i1: {e: ['r1']}},
      {i1: {e: []}},
    );
    expectChanges(
      listener,
      '/i*/t',
      {i1: {t: ['r2', 'r3']}},
      {i1: {t: ['r3']}},
      {i1: {t: []}},
    );
    expectChanges(listener, '/i*/w', {i1: {w: ['r2']}}, {i1: {w: []}});
    expectChanges(listener, '/i*/h', {i1: {h: ['r3']}}, {i1: {h: []}});
    expectChanges(
      listener,
      '/i*/r',
      {i1: {r: ['r3']}},
      {i1: {r: ['r3', 'r4']}},
      {i1: {r: ['r3']}},
      {i1: {r: []}},
    );
    expectChanges(listener, '/i*/f', {i1: {f: ['r4']}}, {i1: {f: []}});
    expectChanges(listener, '/i*/d', {i1: {d: ['r2']}}, {i1: {d: []}});
    expectChanges(
      listener,
      '/i*/u',
      {i1: {u: ['r4']}},
      {i1: {u: ['r4', 'r2']}},
      {i1: {u: ['r2']}},
      {i1: {u: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {o: ['r1']}},
      {i1: {n: ['r1']}},
      {i1: {e: ['r1']}},
      {i1: {t: ['r2', 'r3']}},
      {i1: {w: ['r2']}},
      {i1: {o: ['r2']}},
      {i1: {h: ['r3']}},
      {i1: {r: ['r3']}},
      {i1: {e: ['r3']}},
      {i1: {n: []}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {n: ['r1']}},
      {i1: {e: ['r3', 'r1']}},
      {i1: {f: ['r4']}},
      {i1: {o: ['r2', 'r1', 'r4']}},
      {i1: {u: ['r4']}},
      {i1: {r: ['r3', 'r4']}},
      {i1: {t: ['r3']}},
      {i1: {w: []}},
      {i1: {d: ['r2']}},
      {i1: {u: ['r4', 'r2']}},
      {i1: {f: []}},
      {i1: {o: ['r2', 'r1']}},
      {i1: {u: ['r2']}},
      {i1: {r: ['r3']}},
      {i1: {t: []}},
      {i1: {h: []}},
      {i1: {r: []}},
      {i1: {e: ['r1']}},
      {i1: {d: []}},
      {i1: {u: []}},
      {i1: {o: ['r1']}},
      {i1: {o: []}},
      {i1: {n: []}},
      {i1: {e: []}},
    );
    expectNoChanges(listener);
  });

  test('definition after data', () => {
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2');
    expectChanges(listener, '/i1/even', {i1: {even: ['r2', 'r4']}});
    expectChanges(listener, '/i1/odd', {i1: {odd: ['r3', 'r1']}});
    expectChanges(
      listener,
      '/i1/*',
      {i1: {even: ['r2', 'r4']}},
      {i1: {odd: ['r3', 'r1']}},
    );
    expectChanges(listener, '/i*/even', {i1: {even: ['r2', 'r4']}});
    expectChanges(listener, '/i*/odd', {i1: {odd: ['r3', 'r1']}});
    expectChanges(
      listener,
      '/i*/*',
      {i1: {even: ['r2', 'r4']}},
      {i1: {odd: ['r3', 'r1']}},
    );
    expectNoChanges(listener);
  });

  test('change definitions', () => {
    listener.listenToSliceRowIds('/i1/_', 'i1', '');
    listener.listenToSliceRowIds('/i1/odd', 'i1', 'odd');
    listener.listenToSliceRowIds('/i1/even', 'i1', 'even');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i*/_', null, '');
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    indexes.setIndexDefinition('i1', 't1');
    setCells();
    indexes.setIndexDefinition('i1', 't1', 'c2');
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1');
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c1', descend, oddDescend);
    delCells();
    expectChanges(
      listener,
      '/i1/_',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': []}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i1/odd',
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i1/even',
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/_',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': []}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {odd: ['r1']}},
      {i1: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i1: {even: ['r2', 'r4']}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {even: ['r2']}},
      {i1: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': []}},
      {i1: {even: ['r2', 'r4']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {even: ['r4', 'r2']}},
      {i1: {odd: ['r1', 'r3']}},
      {i1: {odd: ['r3', 'r1']}},
      {i1: {even: ['r2']}},
      {i1: {'': ['r4']}},
      {i1: {'': []}},
      {i1: {odd: ['r1']}},
      {i1: {even: []}},
      {i1: {odd: []}},
    );
    expectNoChanges(listener);
  });

  test('two definitions', () => {
    listener.listenToSliceRowIds('/i1/_', 'i1', '');
    listener.listenToSliceRowIds('/i1/*', 'i1', null);
    listener.listenToSliceRowIds('/i2/odd', 'i2', 'odd');
    listener.listenToSliceRowIds('/i2/even', 'i2', 'even');
    listener.listenToSliceRowIds('/i2/_', 'i2', '');
    listener.listenToSliceRowIds('/i2/*', 'i2', null);
    listener.listenToSliceRowIds('/i*/_', null, '');
    listener.listenToSliceRowIds('/i*/odd', null, 'odd');
    listener.listenToSliceRowIds('/i*/even', null, 'even');
    listener.listenToSliceRowIds('/i*/*', null, null);
    indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't1', 'c2');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/i1/_',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i1/*',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i2/odd',
      {i2: {odd: ['r1']}},
      {i2: {odd: ['r3']}},
      {i2: {odd: ['r3', 'r1']}},
      {i2: {odd: ['r1']}},
      {i2: {odd: []}},
    );
    expectChanges(
      listener,
      '/i2/even',
      {i2: {even: ['r2']}},
      {i2: {even: ['r2', 'r4']}},
      {i2: {even: ['r2']}},
      {i2: {even: []}},
    );
    expectChanges(
      listener,
      '/i2/_',
      {i2: {'': ['r4']}},
      {i2: {'': []}},
      {i2: {'': ['r4']}},
      {i2: {'': []}},
    );
    expectChanges(
      listener,
      '/i2/*',
      {i2: {odd: ['r1']}},
      {i2: {even: ['r2']}},
      {i2: {odd: ['r3']}},
      {i2: {odd: ['r3', 'r1']}},
      {i2: {'': ['r4']}},
      {i2: {'': []}},
      {i2: {even: ['r2', 'r4']}},
      {i2: {even: ['r2']}},
      {i2: {'': ['r4']}},
      {i2: {'': []}},
      {i2: {odd: ['r1']}},
      {i2: {even: []}},
      {i2: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/_',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i2: {'': ['r4']}},
      {i2: {'': []}},
      {i2: {'': ['r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i2: {'': []}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectChanges(
      listener,
      '/i*/odd',
      {i2: {odd: ['r1']}},
      {i2: {odd: ['r3']}},
      {i2: {odd: ['r3', 'r1']}},
      {i2: {odd: ['r1']}},
      {i2: {odd: []}},
    );
    expectChanges(
      listener,
      '/i*/even',
      {i2: {even: ['r2']}},
      {i2: {even: ['r2', 'r4']}},
      {i2: {even: ['r2']}},
      {i2: {even: []}},
    );
    expectChanges(
      listener,
      '/i*/*',
      {i1: {'': ['r1']}},
      {i2: {odd: ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i2: {even: ['r2']}},
      {i2: {odd: ['r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i2: {odd: ['r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i2: {'': ['r4']}},
      {i2: {'': []}},
      {i2: {even: ['r2', 'r4']}},
      {i2: {even: ['r2']}},
      {i2: {'': ['r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i2: {'': []}},
      {i1: {'': ['r2', 'r1']}},
      {i2: {odd: ['r1']}},
      {i1: {'': ['r1']}},
      {i2: {even: []}},
      {i1: {'': []}},
      {i2: {odd: []}},
    );
    expectNoChanges(listener);
  });
});

describe('Miscellaneous', () => {
  test('Listener cannot mutate original store', () => {
    const listener = jest.fn(() => {
      store.setValue('mutated', true);
    });
    indexes.setIndexDefinition('i1', 't1', 'c1');
    indexes.addSliceIdsListener('i1', listener);
    store.setCell('t1', 'r1', 'c1', 1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(indexes.getSliceIds('i1')).toEqual(['1']);
    expect(store.getValues()).toEqual({});
  });

  test('bad sort key', () => {
    indexes.setIndexDefinition('i1', 't1', 'c2', 'c0');
    setCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({
      odd: ['r3', 'r1'],
      even: ['r2', 'r4'],
    });
    delCells();
    expect(getIndexesObject(indexes)['i1']).toEqualWithOrder({});
  });

  test('remove listener', () => {
    listener = createIndexesListener(indexes);
    const id1 = listener.listenToSliceIds('/i1s', 'i1');
    expect(indexes.getListenerStats().sliceIds).toEqual(1);
    expect(id1).toEqual('0');
    const id2 = listener.listenToSliceRowIds('/i1/', 'i1', '');
    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);
    expect(id2).toEqual('1');
    indexes.setIndexDefinition('i1', 't1');
    setCells();
    delCells();
    expectChanges(listener, '/i1s', {i1: ['']}, {i1: []});
    expectChanges(
      listener,
      '/i1/',
      {i1: {'': ['r1']}},
      {i1: {'': ['r2', 'r3']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r3', 'r1', 'r4']}},
      {i1: {'': ['r2', 'r3', 'r1']}},
      {i1: {'': ['r2', 'r1']}},
      {i1: {'': ['r1']}},
      {i1: {'': []}},
    );
    expectNoChanges(listener);
    indexes.delListener(id1);
    expect(indexes.getListenerStats().sliceIds).toEqual(0);
    indexes.delListener(id2);
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
    setCells();
    delCells();
    expectNoChanges(listener);
  });

  describe('forEach', () => {
    test('forEachIndex', () => {
      indexes
        .setIndexDefinition('i1', 't1')
        .setIndexDefinition('i2', 't1', 'c2');
      setCells();
      const eachIndex: any = {};
      indexes.forEachIndex((indexId, forEachSlice) => {
        const eachSlice: any = {};
        forEachSlice((sliceId, forEachRow) => {
          const eachRow: any = {};
          forEachRow((rowId, forEachCell) => {
            const eachCell: any = {};
            forEachCell((cellId, cell) => (eachCell[cellId] = cell));
            eachRow[rowId] = eachCell;
          });
          eachSlice[sliceId] = eachRow;
        });
        eachIndex[indexId] = eachSlice;
      });
      expect(eachIndex).toEqual({
        i1: {
          '': {
            r1: {c1: 'one', c2: 'odd'},
            r2: {c1: 'two', c2: 'even'},
            r3: {c1: 'three', c2: 'odd'},
            r4: {c1: 'four', c2: 'even'},
          },
        },
        i2: {
          even: {r2: {c1: 'two', c2: 'even'}, r4: {c1: 'four', c2: 'even'}},
          odd: {r1: {c1: 'one', c2: 'odd'}, r3: {c1: 'three', c2: 'odd'}},
        },
      });
    });

    test('getIndexIds', () => {
      indexes
        .setIndexDefinition('i1', 't1')
        .setIndexDefinition('i2', 't1', 'c2');
      setCells();
      expect(indexes.getIndexIds()).toEqual(['i1', 'i2']);
    });

    test('forEachSlice', () => {
      indexes.setIndexDefinition('i2', 't1', 'c2');
      setCells();
      const eachSlice: any = {};
      indexes.forEachSlice('i2', (sliceId, forEachRow) => {
        const eachRow: any = {};
        forEachRow((rowId, forEachCell) => {
          const eachCell: any = {};
          forEachCell((cellId, cell) => (eachCell[cellId] = cell));
          eachRow[rowId] = eachCell;
        });
        eachSlice[sliceId] = eachRow;
      });
      expect(eachSlice).toEqual({
        even: {r2: {c1: 'two', c2: 'even'}, r4: {c1: 'four', c2: 'even'}},
        odd: {r1: {c1: 'one', c2: 'odd'}, r3: {c1: 'three', c2: 'odd'}},
      });
    });
  });

  test('getSliceIds', () => {
    indexes.setIndexDefinition('i2', 't1', 'c2');
    setCells();
    expect(indexes.getSliceIds('i2')).toEqual(['odd', 'even']);
  });

  test('are things present', () => {
    expect(indexes.hasIndex('i1')).toEqual(false);
    indexes.setIndexDefinition('i1', 't1', 'c2');
    expect(indexes.hasIndex('i1')).toEqual(true);
    setCells();
    expect(indexes.hasSlice('i1', 'even')).toEqual(true);
    expect(indexes.hasSlice('i1', 'none')).toEqual(false);
  });

  test('get the tables back out', () => {
    indexes.setIndexDefinition('i1', 't1');
    expect(indexes.getTableId('i1')).toEqual('t1');
  });

  test('creates new indexes against different store', () => {
    const store1 = createStore();
    const store2 = createStore();
    const indexes1 = createIndexes(store1);
    const indexes2 = createIndexes(store2);
    expect(indexes1).not.toBe(indexes2);
  });

  test('re-uses indexes against existing store', () => {
    const store = createStore();
    const indexes1 = createIndexes(store);
    const indexes2 = createIndexes(store);
    expect(indexes1).toBe(indexes2);
  });

  test('getStore', () => {
    expect(indexes.getStore()).toEqual(store);
  });

  test('removes index definition', () => {
    expect(indexes.getStore().getListenerStats().table).toEqual(0);
    expect(indexes.getStore().getListenerStats().row).toEqual(0);
    indexes.setIndexDefinition('i1', 't1');
    expect(indexes.getStore().getListenerStats().table).toEqual(1);
    expect(indexes.getStore().getListenerStats().row).toEqual(1);
    indexes.delIndexDefinition('i1');
    expect(indexes.getStore().getListenerStats().table).toEqual(0);
    expect(indexes.getStore().getListenerStats().row).toEqual(0);
    setCells();
    expect(getIndexesObject(indexes)['i1']).toBeUndefined();
  });

  test('destroys', () => {
    expect(indexes.getStore().getListenerStats().table).toEqual(0);
    expect(indexes.getStore().getListenerStats().row).toEqual(0);
    indexes.setIndexDefinition('i1', 't1');
    expect(indexes.getStore().getListenerStats().table).toEqual(1);
    expect(indexes.getStore().getListenerStats().row).toEqual(1);
    indexes.destroy();
    expect(indexes.getStore().getListenerStats().table).toEqual(0);
    expect(indexes.getStore().getListenerStats().row).toEqual(0);
  });
});
