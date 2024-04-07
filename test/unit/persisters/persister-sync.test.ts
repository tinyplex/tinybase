/* eslint-disable jest/no-conditional-expect */

import {
  Content,
  MergeableStore,
  Persister,
  createMergeableStore,
} from 'tinybase/debug';
import {
  createLocalBus,
  createSyncPersister,
} from 'tinybase/debug/persisters/persister-sync';
import {START_TIME} from '../common/mergeable';
import {pause} from '../common/other';

beforeEach(() => {
  jest.useFakeTimers({now: START_TIME});
});

afterEach(() => {
  jest.useRealTimers();
});

let store1: MergeableStore;
let store2: MergeableStore;

const expectBothToHaveContent = async (content: Content) => {
  await pause(1, true);
  expect(store1.getContent()).toEqual(content);
  expect(store2.getContent()).toEqual(content);
  expect(store1.getMergeableContent()).toMatchSnapshot();
  expect(store2.getMergeableContent()).toEqual(store1.getMergeableContent());
};

describe('Bidirectional', () => {
  let persister1: Persister<true>;
  let persister2: Persister<true>;

  beforeEach(async () => {
    const bus = createLocalBus();

    store1 = createMergeableStore('s1');
    persister1 = createSyncPersister(store1, bus);
    await persister1.startAutoLoad();
    await persister1.startAutoSave();

    store2 = createMergeableStore('s2');
    persister2 = createSyncPersister(store2, bus);
    await persister2.startAutoLoad();
    await persister2.startAutoSave();
  });

  afterEach(() => {
    persister1.destroy();
    persister2.destroy();
  });

  // ---

  test('Both empty', async () => {
    await expectBothToHaveContent([{}, {}]);
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
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store1 empty', async () => {
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store2 empty', async () => {
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await expectBothToHaveContent([
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
    await expectBothToHaveContent([
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
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('different tables', async () => {
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(1, true);
    store2.setTable('t2', {r2: {c2: 2}});
    await expectBothToHaveContent([
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
    await expectBothToHaveContent([
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
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('different table', async () => {
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(1, true);
    store2.setRow('t1', 'r2', {c2: 2});
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('store1 missing row', async () => {
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(1, true);
    store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('store2 missing row', async () => {
    store2.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(1, true);
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('different row', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store2.setCell('t1', 'r1', 'c2', 2);
    await expectBothToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('store1 missing cell', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store2.setRow('t1', 'r1', {c1: 1, c2: 2});
    await expectBothToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('store2 missing cell', async () => {
    store2.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await expectBothToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('different cell', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store2.setCell('t1', 'r1', 'c1', 2);
    await expectBothToHaveContent([{t1: {r1: {c1: 2}}}, {}]);
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
    await expectBothToHaveContent([
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
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('different values', async () => {
    store1.setValue('v1', 1);
    await pause(1, true);
    store2.setValue('v2', 2);
    await expectBothToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('store1 missing value', async () => {
    store1.setValue('v2', 2);
    await pause(1, true);
    store2.setValues({v1: 1, v2: 2});
    await expectBothToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('store2 missing value', async () => {
    store2.setValue('v2', 2);
    await pause(1, true);
    store1.setValues({v1: 1, v2: 2});
    await expectBothToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('different value', async () => {
    store1.setValue('v1', 1);
    await pause(1, true);
    store2.setValue('v1', 2);
    await expectBothToHaveContent([{}, {v1: 2}]);
  });
});
