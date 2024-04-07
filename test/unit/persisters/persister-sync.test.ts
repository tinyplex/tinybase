/* eslint-disable jest/no-conditional-expect */

import {Content, MergeableStore, createMergeableStore} from 'tinybase/debug';
import {
  SyncPersister,
  createLocalBus,
  createSyncPersister,
} from 'tinybase/debug/persisters/persister-sync';
import {START_TIME} from '../common/mergeable';
import {pause} from '../common/other';

beforeEach(() => {
  jest.useFakeTimers({now: START_TIME, advanceTimers: true});
});

afterEach(() => {
  jest.useRealTimers();
});

let store1: MergeableStore;
let store2: MergeableStore;
let persister1: SyncPersister;
let persister2: SyncPersister;

const expectEachToHaveContent = async (
  content1: Content,
  content2?: Content,
) => {
  //  await pause(1, true);
  expect(store1.getContent()).toEqual(content1);
  expect(store2.getContent()).toEqual(content2 ?? content1);
  expect(store1.getMergeableContent()).toMatchSnapshot();
  if (content2) {
    expect(store2.getMergeableContent()).toMatchSnapshot();
  } else {
    expect(store2.getMergeableContent()).toEqual(store1.getMergeableContent());
  }
};

beforeEach(() => {
  const bus = createLocalBus();
  store1 = createMergeableStore('s1');
  store2 = createMergeableStore('s2');
  persister1 = createSyncPersister(store1, bus, 0.001);
  persister2 = createSyncPersister(store2, bus, 0.001);
});

describe('Unidirectional', () => {
  test('save1 but not autoLoad2', async () => {
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await persister1.save();
    await expectEachToHaveContent(
      [
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ],
      [{}, {}],
    );
  });

  test('autoSave1 but not autoLoad2', async () => {
    await persister1.startAutoSave();
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent(
      [
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ],
      [{}, {}],
    );
  });

  test('load1 but not autoSave2, defaults', async () => {
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await persister1.load({t0: {r0: {c0: 0}}}, {v0: 0});
    await expectEachToHaveContent(
      [{t0: {r0: {c0: 0}}}, {v0: 0}],
      [
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ],
    );
  });

  test('autoLoad1 but not autoSave2, defaults', async () => {
    await persister1.startAutoLoad({t0: {r0: {c0: 0}}}, {v0: 0});
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent(
      [{t0: {r0: {c0: 0}}}, {v0: 0}],
      [
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ],
    );
  });
});

describe('Bidirectional', () => {
  beforeEach(async () => {
    await persister1.startSync();
    await persister2.startSync();
  });

  afterEach(() => {
    persister1.stopSync();
    persister2.stopSync();
  });

  // ---

  test('Both empty', async () => {
    await expectEachToHaveContent([{}, {}]);
  });

  test('Both match', async () => {
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await pause(1, true);
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store1 empty', async () => {
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store2 empty', async () => {
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store1 missing tables', async () => {
    store1.setValues({v1: 1, v2: 2});
    await pause(1, true);
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store2 missing tables', async () => {
    store2.setValues({v1: 1, v2: 2});
    await pause(1, true);
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('different tables', async () => {
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(1, true);
    store2.setTable('t2', {r2: {c2: 2}});
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('store1 missing table', async () => {
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(1, true);
    store2.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('store2 missing table', async () => {
    store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(1, true);
    store1.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('different table', async () => {
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(1, true);
    store2.setRow('t1', 'r2', {c2: 2});
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('store1 missing row', async () => {
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(1, true);
    store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('store2 missing row', async () => {
    store2.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(1, true);
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('different row', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store2.setCell('t1', 'r1', 'c2', 2);
    await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('store1 missing cell', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store2.setRow('t1', 'r1', {c1: 1, c2: 2});
    await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('store2 missing cell', async () => {
    store2.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('different cell', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store2.setCell('t1', 'r1', 'c1', 2);
    await expectEachToHaveContent([{t1: {r1: {c1: 2}}}, {}]);
  });

  test('store1 missing values', async () => {
    store1.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await pause(1, true);
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store2 missing values', async () => {
    store2.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await pause(1, true);
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('different values', async () => {
    store1.setValue('v1', 1);
    await pause(1, true);
    store2.setValue('v2', 2);
    await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('store1 missing value', async () => {
    store1.setValue('v2', 2);
    await pause(1, true);
    store2.setValues({v1: 1, v2: 2});
    await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('store2 missing value', async () => {
    store2.setValue('v2', 2);
    await pause(1, true);
    store1.setValues({v1: 1, v2: 2});
    await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('different value', async () => {
    store1.setValue('v1', 1);
    await pause(1, true);
    store2.setValue('v1', 2);
    await expectEachToHaveContent([{}, {v1: 2}]);
  });
});
