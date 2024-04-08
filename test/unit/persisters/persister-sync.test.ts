/* eslint-disable jest/no-conditional-expect */

import {
  Bus,
  SyncPersister,
  createLocalBus,
  createSyncPersister,
} from 'tinybase/debug/persisters/persister-sync';
import {Content, MergeableStore, createMergeableStore} from 'tinybase/debug';
import {pause} from '../common/other';
import {resetHlc} from '../common/mergeable';

beforeEach(() => {
  resetHlc();
});

let bus: Bus;
let store1: MergeableStore;
let store2: MergeableStore;
let persister1: SyncPersister;
let persister2: SyncPersister;

const expectEachToHaveContent = async (
  content1: Content,
  content2?: Content,
) => {
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
  bus = createLocalBus();
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
    await pause(2, true);
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
    await pause(2, true);
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
    await pause(2, true);
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
    await pause(2, true);
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
    await pause(2, true);
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
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await pause(2, true);
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
    await pause(2, true);
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
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store1 missing tables', async () => {
    store1.setValues({v1: 1, v2: 2});
    await pause(2, true);
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('store2 missing tables', async () => {
    store2.setValues({v1: 1, v2: 2});
    await pause(2, true);
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('different tables', async () => {
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(2, true);
    store2.setTable('t2', {r2: {c2: 2}});
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('store1 missing table', async () => {
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(2, true);
    store2.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('store2 missing table', async () => {
    store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(2, true);
    store1.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {},
    ]);
  });

  test('different table', async () => {
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(2, true);
    store2.setRow('t1', 'r2', {c2: 2});
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('store1 missing row', async () => {
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(2, true);
    store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('store2 missing row', async () => {
    store2.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(2, true);
    store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
      {},
    ]);
  });

  test('different row', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(2, true);
    store2.setCell('t1', 'r1', 'c2', 2);
    await pause(2, true);
    await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('store1 missing cell', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(2, true);
    store2.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(2, true);
    await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('store2 missing cell', async () => {
    store2.setCell('t1', 'r1', 'c1', 1);
    await pause(2, true);
    store1.setRow('t1', 'r1', {c1: 1, c2: 2});
    await pause(2, true);
    await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
  });

  test('different cell', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await pause(2, true);
    store2.setCell('t1', 'r1', 'c1', 2);
    await pause(2, true);
    await expectEachToHaveContent([{t1: {r1: {c1: 2}}}, {}]);
  });

  test('store1 missing values', async () => {
    store1.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await pause(2, true);
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await pause(2, true);
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
    await pause(2, true);
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    await pause(2, true);
    await expectEachToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 1, v2: 2},
    ]);
  });

  test('different values', async () => {
    store1.setValue('v1', 1);
    await pause(2, true);
    store2.setValue('v2', 2);
    await pause(2, true);
    await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('store1 missing value', async () => {
    store1.setValue('v2', 2);
    await pause(2, true);
    store2.setValues({v1: 1, v2: 2});
    await pause(2, true);
    await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('store2 missing value', async () => {
    store2.setValue('v2', 2);
    await pause(2, true);
    store1.setValues({v1: 1, v2: 2});
    await pause(2, true);
    await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
  });

  test('different value', async () => {
    store1.setValue('v1', 1);
    await pause(2, true);
    store2.setValue('v1', 2);
    await pause(2, true);
    await expectEachToHaveContent([{}, {v1: 2}]);
  });
});

describe('bus getStats', () => {
  test('2 stores', async () => {
    await persister1.startSync();
    await persister2.startSync();
    await pause(2, true);

    store1.setTable('t1', {r1: {c1: 1}});
    await pause(2, true);
    store2.setTable('t2', {r2: {c2: 2}});
    await pause(2, true);

    const [, getBusStats] = bus;
    expect(getBusStats()).toEqual({sends: 25, receives: 25});

    expect(store1.getContent()).toEqual(store2.getContent());
  });

  test('3 stores', async () => {
    const store3 = createMergeableStore('s3');
    const persister3 = createSyncPersister(store3, bus, 0.001);

    await persister1.startSync();
    await persister2.startSync();
    await persister3.startSync();
    await pause(2, true);

    store1.setTable('t1', {r1: {c1: 1}});
    await pause(2, true);
    store2.setTable('t2', {r2: {c2: 2}});
    await pause(2, true);
    store3.setTable('t3', {r3: {c3: 3}});
    await pause(2, true);

    const [, getBusStats] = bus;
    expect(getBusStats()).toEqual({sends: 66, receives: 75});

    expect(store1.getContent()).toEqual(store2.getContent());
    expect(store2.getContent()).toEqual(store3.getContent());
  });

  test('4 stores', async () => {
    const store3 = createMergeableStore('s3');
    const persister3 = createSyncPersister(store3, bus, 0.001);
    const store4 = createMergeableStore('s4');
    const persister4 = createSyncPersister(store4, bus, 0.001);

    await persister1.startSync();
    await persister2.startSync();
    await persister3.startSync();
    await persister4.startSync();
    await pause(2, true);

    store1.setTable('t1', {r1: {c1: 1}});
    await pause(2, true);
    store2.setTable('t2', {r2: {c2: 2}});
    await pause(2, true);
    store3.setTable('t3', {r3: {c3: 3}});
    await pause(2, true);
    store4.setTable('t4', {r4: {c4: 4}});
    await pause(2, true);

    const [, getBusStats] = bus;
    expect(getBusStats()).toEqual({sends: 126, receives: 150});

    expect(store1.getContent()).toEqual(store2.getContent());
    expect(store2.getContent()).toEqual(store3.getContent());
    expect(store3.getContent()).toEqual(store4.getContent());
  });
});
