/* eslint-disable jest/no-conditional-expect */

import {
  Bus,
  BusStats,
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

type BusConfig = {
  createEnvironment?: () => any;
  destroyEnvironment?: (environment: any) => Promise<void>;
  getBus: (environment: any) => Bus;
  getStats: (environment: any) => BusStats;
  requestTimeoutSeconds: number;
  pauseMilliseconds: number;
};

const localBus: BusConfig = {
  createEnvironment: createLocalBus,
  getBus: (bus: Bus) => bus,
  getStats: (bus: Bus) => bus.getStats(),
  requestTimeoutSeconds: 0.001,
  pauseMilliseconds: 2,
};


describe.each([
  ['localBus', localBus],
])('Syncs to/from %s', (_name: string, busConfig: BusConfig) => {
  let environment: any;
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
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    }
    expect(busConfig.getStats(environment)).toMatchSnapshot();
  };

  beforeEach(() => {
    environment = busConfig.createEnvironment?.();

    bus = busConfig.getBus(environment);
    store1 = createMergeableStore('s1');
    store2 = createMergeableStore('s2');
    persister1 = createSyncPersister(
      store1,
      bus,
      busConfig.requestTimeoutSeconds,
    );
    persister2 = createSyncPersister(
      store2,
      bus,
      busConfig.requestTimeoutSeconds,
    );
  });

  afterEach(async () => {
    persister1.destroy();
    persister2.destroy();
    await busConfig.destroyEnvironment?.(environment);
  });

  describe('Unidirectional', () => {
    test('save1 but not autoLoad2', async () => {
      store1.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await persister1.save();
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('store1 missing tables', async () => {
      store1.setValues({v1: 1, v2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      store2.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('store2 missing tables', async () => {
      store2.setValues({v1: 1, v2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      store1.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('different tables', async () => {
      store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
      await pause(busConfig.pauseMilliseconds, true);
      store2.setTable('t2', {r2: {c2: 2}});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {},
      ]);
    });

    test('store1 missing table', async () => {
      store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
      await pause(busConfig.pauseMilliseconds, true);
      store2.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {},
      ]);
    });

    test('store2 missing table', async () => {
      store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
      await pause(busConfig.pauseMilliseconds, true);
      store1.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {},
      ]);
    });

    test('different table', async () => {
      store1.setRow('t1', 'r1', {c1: 1, c2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      store2.setRow('t1', 'r2', {c2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
        {},
      ]);
    });

    test('store1 missing row', async () => {
      store1.setRow('t1', 'r1', {c1: 1, c2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
        {},
      ]);
    });

    test('store2 missing row', async () => {
      store2.setRow('t1', 'r1', {c1: 1, c2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
        {},
      ]);
    });

    test('different row', async () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      await pause(busConfig.pauseMilliseconds, true);
      store2.setCell('t1', 'r1', 'c2', 2);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
    });

    test('store1 missing cell', async () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      await pause(busConfig.pauseMilliseconds, true);
      store2.setRow('t1', 'r1', {c1: 1, c2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
    });

    test('store2 missing cell', async () => {
      store2.setCell('t1', 'r1', 'c1', 1);
      await pause(busConfig.pauseMilliseconds, true);
      store1.setRow('t1', 'r1', {c1: 1, c2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
    });

    test('different cell', async () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      await pause(busConfig.pauseMilliseconds, true);
      store2.setCell('t1', 'r1', 'c1', 2);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{t1: {r1: {c1: 2}}}, {}]);
    });

    test('store1 missing values', async () => {
      store1.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      await pause(busConfig.pauseMilliseconds, true);
      store2.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await pause(busConfig.pauseMilliseconds, true);
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
      await pause(busConfig.pauseMilliseconds, true);
      store1.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('different values', async () => {
      store1.setValue('v1', 1);
      await pause(busConfig.pauseMilliseconds, true);
      store2.setValue('v2', 2);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
    });

    test('store1 missing value', async () => {
      store1.setValue('v2', 2);
      await pause(busConfig.pauseMilliseconds, true);
      store2.setValues({v1: 1, v2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
    });

    test('store2 missing value', async () => {
      store2.setValue('v2', 2);
      await pause(busConfig.pauseMilliseconds, true);
      store1.setValues({v1: 1, v2: 2});
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
    });

    test('different value', async () => {
      store1.setValue('v1', 1);
      await pause(busConfig.pauseMilliseconds, true);
      store2.setValue('v1', 2);
      await pause(busConfig.pauseMilliseconds, true);
      await expectEachToHaveContent([{}, {v1: 2}]);
    });
  });

  describe('Multidirectional', () => {
    let bus: Bus;
    const stores = new Array(10);
    const persisters = new Array(10);

    const expectAllToHaveContent = async (content: Content) => {
      const mergeableContent = stores[0].getMergeableContent();
      expect(mergeableContent).toMatchSnapshot();
      stores.forEach((store, s) => {
        expect(store.getContent()).toEqual(content);
        if (s > 0) {
          expect(store.getMergeableContent()).toEqual(mergeableContent);
        }
      });
      expect(bus.getStats()).toMatchSnapshot();
    };

    beforeEach(async () => {
      bus = createLocalBus();
      stores.fill(null).map(async (_, s) => {
        stores[s] = createMergeableStore('s' + (s + 1));
        persisters[s] = createSyncPersister(
          stores[s],
          bus,
          busConfig.requestTimeoutSeconds,
        );
      });
      await Promise.all(
        persisters.map(async (persister) => await persister.startSync()),
      );
      await pause(busConfig.pauseMilliseconds, true);
    });

    afterEach(() => {
      persisters.forEach((persister) => persister.destroy());
    });

    // ---

    test('All empty', async () => {
      await expectAllToHaveContent([{}, {}]);
    });

    test('All match', async () => {
      stores.forEach((store) =>
        store.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]),
      );
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('All but first empty', async () => {
      stores[0].setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('All but last empty', async () => {
      stores[9].setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('half tables, half values', async () => {
      stores.forEach((store, s) => {
        if (s > 4) {
          store.setTables({
            t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
            t2: {r2: {c2: 2}},
          });
        } else {
          store.setValues({v1: 1, v2: 2});
        }
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
    });

    test('all different tables', async () => {
      stores.forEach((store, s) => {
        store.setTable('t' + (s + 1), {r1: {c1: 1}});
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {
          t1: {r1: {c1: 1}},
          t2: {r1: {c1: 1}},
          t3: {r1: {c1: 1}},
          t4: {r1: {c1: 1}},
          t5: {r1: {c1: 1}},
          t6: {r1: {c1: 1}},
          t7: {r1: {c1: 1}},
          t8: {r1: {c1: 1}},
          t9: {r1: {c1: 1}},
          t10: {r1: {c1: 1}},
        },
        {},
      ]);
    });

    test('all different rows', async () => {
      stores.forEach((store, s) => {
        store.setRow('t1', 'r' + (s + 1), {c1: 1});
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {
          t1: {
            r1: {c1: 1},
            r2: {c1: 1},
            r3: {c1: 1},
            r4: {c1: 1},
            r5: {c1: 1},
            r6: {c1: 1},
            r7: {c1: 1},
            r8: {c1: 1},
            r9: {c1: 1},
            r10: {c1: 1},
          },
        },
        {},
      ]);
    });

    test('all different cells', async () => {
      stores.forEach((store, s) => {
        store.setCell('t1', 'r1', 'c' + (s + 1), 1);
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {
          t1: {
            r1: {
              c1: 1,
              c2: 1,
              c3: 1,
              c4: 1,
              c5: 1,
              c6: 1,
              c7: 1,
              c8: 1,
              c9: 1,
              c10: 1,
            },
          },
        },
        {},
      ]);
    });

    test('all conflicting cells', async () => {
      stores.forEach((store, s) => {
        store.setCell('t1', 'r1', 'c1', s + 1);
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([{t1: {r1: {c1: 10}}}, {}]);
      stores[5].setCell('t1', 'r1', 'c1', 42);
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([{t1: {r1: {c1: 42}}}, {}]);
    });

    test('all different values', async () => {
      stores.forEach((store, s) => {
        store.setValue('v' + (s + 1), 1);
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([
        {},
        {
          v1: 1,
          v2: 1,
          v3: 1,
          v4: 1,
          v5: 1,
          v6: 1,
          v7: 1,
          v8: 1,
          v9: 1,
          v10: 1,
        },
      ]);
    });

    test('all conflicting values', async () => {
      stores.forEach((store, s) => {
        store.setValue('v1', s + 1);
      });
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([{}, {v1: 10}]);
      stores[5].setValue('v1', 42);
      await pause(busConfig.pauseMilliseconds, true);
      await expectAllToHaveContent([{}, {v1: 42}]);
    });
  });
});
