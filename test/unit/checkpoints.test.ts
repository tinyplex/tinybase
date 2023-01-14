import {
  Checkpoints,
  Id,
  Store,
  Tables,
  createCheckpoints,
  createStore,
} from '../../lib/debug/tinybase';
import {
  CheckpointsListener,
  createCheckpointsListener,
  expectChanges,
  expectNoChanges,
} from './common';

let store: Store;
let checkpoints: Checkpoints;

const setCells = () => {
  const listener = createCheckpointsListener(checkpoints);
  const listenerId = listener.listenToCheckpoints('setCells');
  const c0: [Id, Tables] = [
    checkpoints.getCheckpointIds()[1] as Id,
    store.getTables(),
  ];
  store.setTables({t1: {r1: {c1: 1}}});
  expect(checkpoints.getCheckpointIds()).toEqual([[c0[0]], undefined, []]);
  expectChanges(listener, 'setCells', [[c0[0]], undefined, []]);
  store.setCell('t1', 'r1', 'c2', 2);
  store.delCell('t1', 'r1', 'c1');
  store.setCell('t1', 'r1', 'c2', '2');
  const c1: [Id, Tables] = [checkpoints.addCheckpoint(), store.getTables()];
  expectChanges(listener, 'setCells', [[c0[0]], c1[0], []]);
  store.setRow('t1', 'r1', {c1: '1'});
  expectChanges(listener, 'setCells', [[c0[0], c1[0]], undefined, []]);
  store.delRow('t1', 'r1');
  store.setRow('t1', 'r1', {c2: 2});
  store.setRow('t1', 'r1', {c1: 1});
  store.setPartialRow('t1', 'r1', {c2: 2});
  store.addRow('t2', {c2: 2});
  const c2: [Id, Tables] = [checkpoints.addCheckpoint(), store.getTables()];
  expectChanges(listener, 'setCells', [[c0[0], c1[0]], c2[0], []]);
  store.setTable('t1', {r1: {c1: 1}});
  expectChanges(listener, 'setCells', [[c0[0], c1[0], c2[0]], undefined, []]);
  store.delTable('t1');
  store.setTable('t1', {r1: {c1: 1}});
  store.setTable('t1', {r2: {c2: 1}});
  store.setTable('t2', {r2: {c2: 2}});
  const c3: [Id, Tables] = [checkpoints.addCheckpoint(), store.getTables()];
  expectChanges(listener, 'setCells', [[c0[0], c1[0], c2[0]], c3[0], []]);
  store.setTables({t1: {r1: {c1: 1}}});
  expectChanges(listener, 'setCells', [
    [c0[0], c1[0], c2[0], c3[0]],
    undefined,
    [],
  ]);
  store.delTables();
  store.setTables({t1: {r1: {c1: 1}}});
  store.setTables({t2: {r2: {c2: 2}}});
  const c4: [Id, Tables] = [checkpoints.addCheckpoint(), store.getTables()];
  expectChanges(listener, 'setCells', [
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

  test('set checkpoint', () => {
    const id0 = checkpoints.getCheckpointIds()[1];
    store.setCell('t1', 'r1', 'c1', 1);
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

  test('set two labelled checkpoints without changes', () => {
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

  test('set second checkpoint without changes', () => {
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

  test('make changes after a checkpoint', () => {
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

  test('make net-no changes after a checkpoint', () => {
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
    const [[id0, s0], [id1, s1], [id2, s2], [id3, s3], [id4, s4]] = setCells();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    store.setCell('t1', 'r1', 'c1', 2);
    expectChanges(listener, '/', [[id0, id1, id2, id3, id4], undefined, []]);
    checkpoints.goBackward();
    const [, , [id5]] = checkpoints.getCheckpointIds();
    expectChanges(listener, '/', [[id0, id1, id2, id3], id4, [id5]]);
    expect(store.getTables()).toEqual(s4);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[id0, id1, id2], id3, [id4, id5]]);
    expect(store.getTables()).toEqual(s3);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2],
      id3,
      [id4, id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4, id5]]);
    expect(store.getTables()).toEqual(s2);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4, id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[id0], id1, [id2, id3, id4, id5]]);
    expect(store.getTables()).toEqual(s1);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0],
      id1,
      [id2, id3, id4, id5],
    ]);
    checkpoints.goBackward();
    expectChanges(listener, '/', [[], id0, [id1, id2, id3, id4, id5]]);
    expect(store.getTables()).toEqual(s0);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [],
      id0,
      [id1, id2, id3, id4, id5],
    ]);
    checkpoints.goBackward();
    expect(store.getTables()).toEqual(s0);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [],
      id0,
      [id1, id2, id3, id4, id5],
    ]);
    expectNoChanges(listener);
  });

  test('goTo', () => {
    const [[id0], [id1], [id2, s2], [id3], [id4, s4]] = setCells();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id2);
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    expect(store.getTables()).toEqual(s2);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    checkpoints.goTo(id4);
    expectChanges(listener, '/', [[id0, id1, id2, id3], id4, []]);
    expect(store.getTables()).toEqual(s4);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
    expectNoChanges(listener);
  });

  test('goForward', () => {
    const [[id0, s0], [id1, s1], [id2, s2], [id3, s3], [id4, s4]] = setCells();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id0);
    expectChanges(listener, '/', [[], id0, [id1, id2, id3, id4]]);
    expect(store.getTables()).toEqual(s0);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [],
      id0,
      [id1, id2, id3, id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0], id1, [id2, id3, id4]]);
    expect(store.getTables()).toEqual(s1);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0],
      id1,
      [id2, id3, id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    expect(store.getTables()).toEqual(s2);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1],
      id2,
      [id3, id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0, id1, id2], id3, [id4]]);
    expect(store.getTables()).toEqual(s3);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2],
      id3,
      [id4],
    ]);
    checkpoints.goForward();
    expectChanges(listener, '/', [[id0, id1, id2, id3], id4, []]);
    expect(store.getTables()).toEqual(s4);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
    checkpoints.goForward();
    expect(store.getTables()).toEqual(s4);
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
    expectNoChanges(listener);
  });

  test('changes prevent going forward again', () => {
    const [[id0], [id1], [id2], [id3], [id4]] = setCells();
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
    const [[id0], [id1], [id2, s2], [id3], [id4]] = setCells();
    const listener = createCheckpointsListener(checkpoints);
    listener.listenToCheckpoints('/');
    checkpoints.goTo(id2);
    expectChanges(listener, '/', [[id0, id1], id2, [id3, id4]]);
    checkpoints.goTo('');
    expect(store.getTables()).toEqual(s2);
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
    const [[id0], [id1], [id2], [id3], [id4]] = setCells();
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
    setCells();
    expect(checkpoints.getCheckpointIds()).toEqual([
      [id0, id1, id2, id3],
      id4,
      [],
    ]);
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
    store = createStore().setTablesSchema({
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
    setCells();
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
