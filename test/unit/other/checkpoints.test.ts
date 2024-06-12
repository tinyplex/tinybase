import type {Checkpoints, Id, Store, Tables, Values} from 'tinybase';
import {createCheckpoints, createStore} from 'tinybase';
import {expectChanges, expectNoChanges} from '../common/expect.ts';
import {CheckpointsListener} from '../common/types.ts';
import {createCheckpointsListener} from '../common/listeners.ts';

let store: Store;
let checkpoints: Checkpoints;

const setContent = () => {
  const getState = (first?: boolean): [Id, Tables, Values] => [
    first
      ? (checkpoints.getCheckpointIds()[1] as Id)
      : checkpoints.addCheckpoint(),
    store.getTables(),
    store.getValues(),
  ];
  const listener = createCheckpointsListener(checkpoints);
  const listenerId = listener.listenToCheckpoints('setContent');
  const c0 = getState(true);

  store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
  expect(checkpoints.getCheckpointIds()).toEqual([[c0[0]], undefined, []]);
  expectChanges(listener, 'setContent', [[c0[0]], undefined, []]);
  store.setCell('t1', 'r1', 'c2', 2);
  store.delCell('t1', 'r1', 'c1');
  store.setCell('t1', 'r1', 'c2', '2');
  store.setValue('v2', 2);
  store.delValue('v1');
  store.setValue('v2', '2');
  const c1 = getState();

  expectChanges(listener, 'setContent', [[c0[0]], c1[0], []]);
  store.setRow('t1', 'r1', {c1: '1'});
  expectChanges(listener, 'setContent', [[c0[0], c1[0]], undefined, []]);
  store.delRow('t1', 'r1');
  store.setRow('t1', 'r1', {c2: 2});
  store.setRow('t1', 'r1', {c1: 1});
  store.setPartialRow('t1', 'r1', {c2: 2});
  store.addRow('t2', {c2: 2});
  store.delValues();
  store.setValues({v3: 3});
  store.setPartialValues({v4: 4});
  const c2 = getState();

  expectChanges(listener, 'setContent', [[c0[0], c1[0]], c2[0], []]);
  store.setTable('t1', {r1: {c1: 1}});
  expectChanges(listener, 'setContent', [[c0[0], c1[0], c2[0]], undefined, []]);
  store.delTable('t1');
  store.setTable('t1', {r1: {c1: 1}});
  store.setTable('t1', {r2: {c2: 1}});
  store.setTable('t2', {r2: {c2: 2}});
  const c3 = getState();

  expectChanges(listener, 'setContent', [[c0[0], c1[0], c2[0]], c3[0], []]);
  store.setTables({t1: {r1: {c1: 1}}});
  expectChanges(listener, 'setContent', [
    [c0[0], c1[0], c2[0], c3[0]],
    undefined,
    [],
  ]);
  store.delTables();
  store.setTables({t1: {r1: {c1: 1}}});
  store.setTables({t2: {r2: {c2: 2}}});
  const c4 = getState();

  expectChanges(listener, 'setContent', [
    [c0[0], c1[0], c2[0], c3[0]],
    c4[0],
    [],
  ]);
  expect(store.getTables()).toEqual(c4[1]);
  expect(checkpoints.getCheckpointIds()).toEqual([
    [c0[0], c1[0], c2[0], c3[0]],
    c4[0],
    [],
  ]);
  expectNoChanges(listener);
  checkpoints.delListener(listenerId);
  return [c0, c1, c2, c3, c4];
};

beforeEach(() => {
  store = createStore();
  checkpoints = createCheckpoints(store);
});

describe('Basics', () => {
  let listener: CheckpointsListener;

  beforeEach(() => {
    listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
  });

  test('initial state', () => {
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    expect(checkpoints.getCheckpoint('0')).toEqual('');
    expect(checkpoints.getCheckpoint('1')).toBeUndefined();
    expectNoChanges(listener);
  });

  test('set checkpoint, tabular', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint('checkpoint 1');
    expectChanges(listener, '/', [[id0], id1, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expect(checkpoints.getCheckpoint(id1)).toEqual('checkpoint 1');
    expectNoChanges(listener);
  });

  test('set checkpoint, keyed values', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setValue('v1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint('checkpoint 1');
    expectChanges(listener, '/', [[id0], id1, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expect(checkpoints.getCheckpoint(id1)).toEqual('checkpoint 1');
    expectNoChanges(listener);
  });

  test('set checkpoint without changes', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    const id1 = checkpoints.addCheckpoint();
    expect(id0).toEqual(id1);
    expect(checkpoints.getCheckpointIds()).toEqual([[], id0, []]);
    expectNoChanges(listener);
  });

  test('set two labelled checkpoints without changes, tabular', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint('label1');
    const id2 = checkpoints.addCheckpoint('label2');
    expect(id1).toEqual(id2);
    expect(checkpoints.getCheckpoint(id1)).toEqual('label1');
    expect(checkpoints.getCheckpoint(id2)).toEqual('label1');
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expectChanges(listener, '/', [[id0], id1, []]);
    expectNoChanges(listener);
  });

  test('set two labelled checkpoints without changes, keyed value', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setValue('v1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint('label1');
    const id2 = checkpoints.addCheckpoint('label2');
    expect(id1).toEqual(id2);
    expect(checkpoints.getCheckpoint(id1)).toEqual('label1');
    expect(checkpoints.getCheckpoint(id2)).toEqual('label1');
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expectChanges(listener, '/', [[id0], id1, []]);
    expectNoChanges(listener);
  });

  test('set second checkpoint without changes, tabular', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    const id2 = checkpoints.addCheckpoint();
    expect(id0).not.toEqual(id1);
    expect(id1).toEqual(id2);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expectNoChanges(listener);
  });

  test('set second checkpoint without changes, keyed value', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setValue('v1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    const id2 = checkpoints.addCheckpoint();
    expect(id0).not.toEqual(id1);
    expect(id1).toEqual(id2);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expectNoChanges(listener);
  });

  test('make changes after a checkpoint, tabular', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    store.setCell('t1', 'r1', 'c1', 2);
    expectChanges(listener, '/', [[id0, id1], undefined, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0, id1], undefined, []]);
    expectNoChanges(listener);
  });

  test('make changes after a checkpoint, keyed value', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setValue('v1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    store.setValue('v1', 2);
    expectChanges(listener, '/', [[id0, id1], undefined, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0, id1], undefined, []]);
    expectNoChanges(listener);
  });

  test('make net-no changes after a checkpoint, tabular', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    store.setTable('t1', {r1: {c1: 1}, r2: {c2: 2}});
    expectChanges(listener, '/', [[id0, id1], undefined, []]);
    store.setRow('t2', 'r2', {c1: 1});
    store.setCell('t3', 'r3', 'c3', 3);
    store.delTable('t2');
    store.delRow('t3', 'r3');
    store.delCell('t1', 'r2', 'c2');
    expectChanges(listener, '/', [[id0], id1, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expectNoChanges(listener);
  });

  test('make net-no changes after a checkpoint, keyed values', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setValue('v1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    store.setValues({v1: 1, v2: 2});
    expectChanges(listener, '/', [[id0, id1], undefined, []]);
    store.setValue('v3', 3);
    store.delValue('v3');
    store.delValue('v2');
    expectChanges(listener, '/', [[id0], id1, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([[id0], id1, []]);
    expectNoChanges(listener);
  });

  test('listener stats', () => {
    listener.listenToCheckpoint('/c0', '0');
    expect(checkpoints.getListenerStats()).toEqual({
      checkpointIds: 1,
      checkpoint: 1,
    });
  });
});

describe('Moving around', () => {
  test('in initial state', () => {
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    checkpoints.goForward();
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    checkpoints.goBackward();
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    expectNoChanges(listener);
  });

  test('goBackward', () => {
    const [
      [id0, t0, v0],
      [id1, t1, v1],
      [id2, t2, v2],
      [id3, t3, v3],
      [id4, t4, v4],
    ] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    store.setCell('t1', 'r1', 'c1', 2);
    expectChanges(listener, '/', [[id0, id1, id2, id3, id4], undefined, []]);
    checkpoints.goBackward();
    const [, , [id5]] = checkpoints.getCheckpointIds();
    expectChanges(listener, '/', [[id0, id1, id2, id3], id4, [id5]]);
    expect(store.getTables()).toEqual(t4);
    expect(store.getValues()).toEqual(v4);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[id0, id1, id2], id3, [id4, id5]]);
    expect(store.getTables()).toEqual(t3);
    expect(store.getValues()).toEqual(v3);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2],
      id3,
      [id4, id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4, id5]]);
    expect(store.getTables()).toEqual(t2);
    expect(store.getValues()).toEqual(v2);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4, id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[id0], id1, [id2, id3, id4, id5]]);
    expect(store.getTables()).toEqual(t1);
    expect(store.getValues()).toEqual(v1);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0],
      id1,
      [id2, id3, id4, id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[], id0, [id1, id2, id3, id4, id5]]);
    expect(store.getTables()).toEqual(t0);
    expect(store.getValues()).toEqual(v0);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [],
      id0,
      [id1, id2, id3, id4, id5],
    ]);
    checkpoints.goBackward();
    expect(store.getTables()).toEqual(t0);
    expect(store.getValues()).toEqual(v0);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [],
      id0,
      [id1, id2, id3, id4, id5],
    ]);
    expectNoChanges(listener);
  });

  test('goTo', () => {
    const [[id0], [id1], [id2, t2, v2], [id3], [id4, t4, v4]] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id2);
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    expect(store.getTables()).toEqual(t2);
    expect(store.getValues()).toEqual(v2);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    checkpoints.goTo(id4);
    expectChanges(listener, '/', [[id0, id1, id2, id3], id4, []]);
    expect(store.getTables()).toEqual(t4);
    expect(store.getValues()).toEqual(v4);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
    expectNoChanges(listener);
  });

  test('goForward', () => {
    const [
      [id0, t0, v0],
      [id1, t1, v1],
      [id2, t2, v2],
      [id3, t3, v3],
      [id4, t4, v4],
    ] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id0);
    expectChanges(listener, '/', [[], id0, [id1, id2, id3, id4]]);
    expect(store.getTables()).toEqual(t0);
    expect(store.getValues()).toEqual(v0);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [],
      id0,
      [id1, id2, id3, id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0], id1, [id2, id3, id4]]);
    expect(store.getTables()).toEqual(t1);
    expect(store.getValues()).toEqual(v1);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0],
      id1,
      [id2, id3, id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    expect(store.getTables()).toEqual(t2);
    expect(store.getValues()).toEqual(v2);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0, id1, id2], id3, [id4]]);
    expect(store.getTables()).toEqual(t3);
    expect(store.getValues()).toEqual(v3);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2],
      id3,
      [id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0, id1, id2, id3], id4, []]);
    expect(store.getTables()).toEqual(t4);
    expect(store.getValues()).toEqual(v4);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
    checkpoints.goForward();
    expect(store.getTables()).toEqual(t4);
    expect(store.getValues()).toEqual(v4);

    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
    expectNoChanges(listener);
  });

  test('changes prevent going forward again', () => {
    const [[id0], [id1], [id2], [id3], [id4]] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id2);
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    expect(checkpoints.getCheckpointIds()[1]).toEqual(id2);
    store.setRow('t1', 'r1', {c3: 3});
    expectChanges(listener, '/', [[id0, id1, id2], undefined, []]);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2],
      undefined,
      [],
    ]);
    expectNoChanges(listener);
  });

  test('cannot go to non-existent checkpoints', () => {
    const [[id0], [id1], [id2, t2], [id3], [id4]] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id2);
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    checkpoints.goTo('');
    expect(store.getTables()).toEqual(t2);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    expectNoChanges(listener);
  });
});

describe('Miscellaneous', () => {
  test('clear', () => {
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    const [[id0], [id1], [id2], [id3], [id4]] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    const listenerId = listener.listenToCheckpoints('/');
    checkpoints.goBackward().goBackward();
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    expectChanges(
      listener,
      '/',
      [[id0, id1, id2], id3, [id4]],
      [[id0, id1], id2, [id3, id4]],
    );
    checkpoints.clear();
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    expectChanges(listener, '/', [[], '0', []]);
    expectNoChanges(listener);
    checkpoints.delListener(listenerId);
    setContent();
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
  });

  test('clearForward', () => {
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    const [[id0], [id1], [id2], [id3], [id4]] = setContent();
    const listener = createCheckpointsListener(checkpoints);
    const listenerId = listener.listenToCheckpoints('/');
    checkpoints.goBackward().goBackward();
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    expectChanges(
      listener,
      '/',
      [[id0, id1, id2], id3, [id4]],
      [[id0, id1], id2, [id3, id4]],
    );
    checkpoints.clearForward();
    expect(checkpoints.getCheckpointIds()).toEqual([[id0, id1], id2, []]);
    expectChanges(listener, '/', [[id0, id1], id2, []]);
    expectNoChanges(listener);
    checkpoints.clearForward();
    expect(checkpoints.getCheckpointIds()).toEqual([[id0, id1], id2, []]);
    expectNoChanges(listener);
    checkpoints.delListener(listenerId);
  });

  test('listen to and change labels', () => {
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoint('/c1', '1');
    listener.listenToCheckpoint('/c*', null);
    store.setTables({t1: {r1: {c1: 1}}});
    checkpoints.addCheckpoint();
    store.setTables({t1: {r1: {c1: 2}}});
    checkpoints.addCheckpoint('two');
    expectChanges(listener, '/c1', {'1': ''});
    expectChanges(listener, '/c*', {'1': ''}, {'2': 'two'});
    checkpoints.setCheckpoint('1', 'ONE');
    expectChanges(listener, '/c1', {'1': 'ONE'});
    expectChanges(listener, '/c*', {'1': 'ONE'});
    checkpoints.goTo('0');
    store.setTables({t1: {r1: {c1: 3}}});
    expectChanges(listener, '/c1', {'1': undefined});
    expectChanges(listener, '/c*', {'1': undefined}, {'2': undefined});
    expectNoChanges(listener);
    checkpoints.setCheckpoint('none', 'NONE');
    expectNoChanges(listener);
  });

  test('set more checkpoints than default size', () => {
    const checkpoints = createCheckpoints(store);
    for (let i = 0; i < 200; i++) {
      store.setCell('t1', 'r1', 'c1', i);
      checkpoints.addCheckpoint();
    }
    const backwardIds = checkpoints.getCheckpointIds()[0];
    expect(backwardIds).toHaveLength(100);
    expect(backwardIds[0]).toEqual('100');
    expect(backwardIds[99]).toEqual('199');
  });

  test('set more checkpoints than custom size', () => {
    const checkpoints = createCheckpoints(store).setSize(10);
    for (let i = 0; i < 20; i++) {
      store.setCell('t1', 'r1', 'c1', i);
      checkpoints.addCheckpoint();
    }
    const backwardIds = checkpoints.getCheckpointIds()[0];
    expect(backwardIds).toHaveLength(10);
    expect(backwardIds[0]).toEqual('10');
    expect(backwardIds[9]).toEqual('19');
  });

  test('change size after setting checkpoints', () => {
    const checkpoints = createCheckpoints(store);
    for (let i = 0; i < 20; i++) {
      store.setCell('t1', 'r1', 'c1', i);
      checkpoints.addCheckpoint();
    }
    let backwardIds = checkpoints.getCheckpointIds()[0];
    expect(backwardIds).toHaveLength(20);
    expect(backwardIds[0]).toEqual('0');
    expect(backwardIds[19]).toEqual('19');
    checkpoints.setSize(10);
    backwardIds = checkpoints.getCheckpointIds()[0];
    expect(backwardIds).toHaveLength(10);
    expect(backwardIds[0]).toEqual('10');
    expect(backwardIds[9]).toEqual('19');
  });

  test('with schema defaults', () => {
    store = createStore();
    store.setTablesSchema({
      t1: {
        c0: {type: 'number', default: 0},
        c1: {type: 'number'},
      },
    });
    store.addCellListener(
      't1',
      null,
      'c1',
      (store, tableId, rowId, cellId, newCell) => {
        if (newCell != null) {
          store.setCell(tableId, rowId, cellId, 1);
        }
      },
      true,
    );
    checkpoints = createCheckpoints(store);
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', []]);
    expect(store.getTables()).toEqual({});
    store.setCell('t1', 'r1', 'c1', 2);
    checkpoints.addCheckpoint();
    expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', []]);
    expect(store.getTables()).toEqual({t1: {r1: {c0: 0, c1: 1}}});
    checkpoints.goTo('0');
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1']]);
    expect(store.getTables()).toEqual({});
  });

  test('remove listener', () => {
    const listener = createCheckpointsListener(checkpoints);
    const listenerId = listener.listenToCheckpoints('/');
    expect(listenerId).toEqual('0');
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
    expectChanges(listener, '/', [[id0], undefined, []]);
    const id1 = checkpoints.addCheckpoint();
    expectChanges(listener, '/', [[id0], id1, []]);
    expectNoChanges(listener);
    checkpoints.delListener(listenerId);
    store.setCell('t1', 'r1', 'c1', 2);
    checkpoints.addCheckpoint();
    expectNoChanges(listener);
  });

  test('forEachCheckpoint', () => {
    setContent();
    checkpoints.setCheckpoint('2', 'two');
    checkpoints.setCheckpoint('3', 'three');
    const eachCheckpoint: any = {};
    checkpoints.forEachCheckpoint(
      (checkpointId, label) => (eachCheckpoint[checkpointId] = label),
    );
    expect(eachCheckpoint).toEqual({
      '0': '',
      '1': '',
      '2': 'two',
      '3': 'three',
      '4': '',
    });
  });

  test('getStore', () => {
    expect(checkpoints.getStore()).toEqual(store);
  });

  test('destroys', () => {
    expect(checkpoints.getStore().getListenerStats().cell).toEqual(1);
    checkpoints.destroy();
    expect(checkpoints.getStore().getListenerStats().cell).toEqual(0);
  });
});
