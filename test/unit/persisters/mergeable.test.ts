import type {
  Changes,
  Content,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from 'tinybase';
import {createMergeableStore, createStore} from 'tinybase';
import type {Persister} from 'tinybase/persisters';
import {createCustomPersister, Persists} from 'tinybase/persisters';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {getTimeFunctions} from '../common/mergeable.ts';
import {noop} from '../common/other.ts';
import {MERGEABLE_VARIANTS} from './common/databases.ts';
import {
  getMockDatabases,
  mockCustomSynchronizer,
  mockDurableObjectStorage,
  mockFile,
  mockLocalStorage,
  mockLocalSynchronizer,
  mockMergeableChangesListener,
  mockMergeableContentListener,
  mockMergeableNoContentListener,
  mockOpfs,
  mockSessionStorage,
} from './common/mocks.ts';
import {asyncNoop, GetLocationMethod, Persistable} from './common/other.ts';

const [reset, getNow, pause] = getTimeFunctions();

beforeEach(() => {
  reset();
});

describe.each([
  ['mockMergeableNoContentListener', mockMergeableNoContentListener],
  ['mockMergeableContentListener', mockMergeableContentListener],
  ['mockMergeableChangesListener', mockMergeableChangesListener],
  ['file', mockFile],
  ['opfs', mockOpfs],
  ['localStorage', mockLocalStorage],
  ['sessionStorage', mockSessionStorage],
  ['durableObjectStorage', mockDurableObjectStorage],
  ['localSynchronizer', mockLocalSynchronizer],
  ['customSynchronizer', mockCustomSynchronizer],
  ...getMockDatabases(MERGEABLE_VARIANTS),
])('Persists to/from %s', (name: string, persistable: Persistable<any>) => {
  let location: string;
  let getLocationMethod: GetLocationMethod<any> | undefined;
  let store: MergeableStore;
  let persister: Persister;

  beforeEach(async () => {
    if (persistable.beforeEach != null) {
      persistable.beforeEach();
    }
    store = createMergeableStore('s1', getNow);
    location = await persistable.getLocation();
    getLocationMethod = persistable.getLocationMethod;
    persister = await persistable.getPersister(store, location);
  });

  afterEach(async () => {
    await persister.destroy();
    if (persistable.afterEach != null) {
      persistable.afterEach(location);
    }
  });

  // ---

  test('gets store', () => {
    expect(persister.getStore()).toEqual(store);
  });

  test('gets second parameter', () => {
    if (getLocationMethod) {
      expect((persister as any)[getLocationMethod[0]]()).toEqual(
        getLocationMethod[1](location),
      );
    }
  });

  test('saves', async () => {
    store.setContent([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toMatchSnapshot();
    await persister.save();
    expect(await persistable.get(location)).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
  });

  test('autoSaves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    expect(persister.isAutoSaving()).toEqual(false);
    await persister.startAutoSave();
    expect(persister.isAutoSaving()).toEqual(true);
    expect(await persistable.get(location)).toMatchSnapshot('initial');
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});

    store.setTables({t1: {r1: {c1: 1, c2: 2}}});
    await pause(persistable.autoLoadPause);
    expect(await persistable.get(location)).toMatchSnapshot('setTables');
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toMatchSnapshot('setTables changes');
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 2});

    store.setValues({v1: 1, v2: 2});
    await pause(persistable.autoLoadPause);
    expect(await persistable.get(location)).toMatchSnapshot('setValues');
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toMatchSnapshot('setValues changes');
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});

    store.delCell('t1', 'r1', 'c2');
    await pause(persistable.autoLoadPause);
    expect(await persistable.get(location)).toMatchSnapshot('delCell');
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toMatchSnapshot('delCell changes');
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 4});

    store.delValue('v2');
    await pause(persistable.autoLoadPause);
    expect(await persistable.get(location)).toMatchSnapshot('delValue');
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toMatchSnapshot('delValue changes');
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 5});

    await persister.stopAutoSave();
    expect(persister.isAutoSaving()).toEqual(false);
  });

  test('autoSaves without race', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      expect(await persistable.get(location)).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 0, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      store.setTables({t1: {r1: {c1: 3}}});
      await pause(50);
      expect(await persistable.get(location)).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 0, saves: 3});
    }
  });

  test('loads', async () => {
    await persistable.set(location, [
      [
        {
          t1: [
            {r1: [{c1: [1, '_', 4065945599]}, '', 1279994494]},
            '',
            1293085726,
          ],
        },
        '',
        4033596827,
      ],
      [{v1: [1, '_', 4065945599]}, '', 2304392760],
    ]);
    await persister.load();
    pause(2);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(store.getMergeableContent()).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('does not load from empty', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('loads default when empty', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.load([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('does not load from corrupt', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    persistable.write(location, '{');
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('autoLoads', async () => {
    if (persistable.testAutoLoad) {
      await persistable.set(location, [
        [
          {
            t1: [
              {r1: [{c1: [1, '1', 4065945599]}, '', 1279994494]},
              '',
              1293085726,
            ],
          },
          '',
          4033596827,
        ],
        [{}, '', 0],
      ]);
      expect(persister.isAutoLoading()).toEqual(false);
      await persister.startAutoLoad();
      expect(persister.isAutoLoading()).toEqual(true);
      await pause(0);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      expect(store.getMergeableContent()).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 1, saves: 0});

      await persistable.set(location, [
        [
          {
            t1: [
              {r1: [{c1: [2, '2', 2669080357]}, '', 274319047]},
              '',
              4089057354,
            ],
          },
          '',
          3386696034,
        ],
        [{}, '', 0],
      ]);

      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
      expect(store.getMergeableContent()).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 2, saves: 0});

      await persistable.set(location, [
        [
          {
            t1: [
              {r1: [{c1: [3, '3', 3252714811]}, '', 1416411412]},
              '',
              3704904231,
            ],
          },
          '',
          4008152259,
        ],
        [{}, '', 0],
      ]);
      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
      expect(store.getMergeableContent()).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 3, saves: 0});
      await persister.stopAutoLoad();
      expect(persister.isAutoLoading()).toEqual(false);

      await persistable.set(location, [
        [
          {
            t1: [
              {r1: [{c1: [3, '4', 3252714811]}, '', 1416411412]},
              '',
              3704904231,
            ],
          },
          '',
          4008152259,
        ],
        [{}, '', 0],
      ]);
      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
      expect(store.getMergeableContent()).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 3, saves: 0});
    }
  });

  test('autoSave & autoLoad: roundtrip', async () => {
    if (persistable.testAutoLoad) {
      await persister.startAutoSave();
      store.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      store.setValues({v1: 1, v2: 2});
      store.delTable('t2');
      store.delRow('t1', 'r2');
      store.delCell('t1', 'r1', 'c2');
      store.delValue('v2');
      await pause();
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      const was = store.getMergeableContent();
      expect(was).toMatchSnapshot();
      expect(await persistable.get(location)).toMatchSnapshot();
      await persister.stopAutoSave();
      store.setMergeableContent([
        [{}, '', 0],
        [{}, '', 0],
      ]);
      await pause();
      expect(store.getContent()).toEqual([{}, {}]);
      expect(await persistable.get(location)).toMatchSnapshot();
      await persister.startAutoLoad();
      await pause(0);
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      expect(store.getMergeableContent()).toEqual(was);
    }
  });

  test('autoSave & autoLoad: no load when saving', async () => {
    if (name == 'file') {
      await persister.startAutoPersisting([{t1: {r1: {c1: 1}}}, {}]);
      await pause(0);
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      await pause(0);
      expect(persister.getStats()).toEqual({loads: 1, saves: 2});
    }
  });

  test('autoSave & autoLoad: no save when loading', async () => {
    if (name == 'file') {
      await persister.startAutoPersisting([{t1: {r1: {c1: 1}}}, {}]);
      await pause(0);
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
      await pause(0);
      expect(persister.getStats()).toEqual({loads: 2, saves: 1});
    }
  });

  test('does not delete when autoLoaded is deleted', async () => {
    if (persistable.testAutoLoad) {
      await persistable.set(location, [
        [
          {
            t1: [
              {r1: [{c1: [1, '_', 4065945599]}, '', 1279994494]},
              '',
              1293085726,
            ],
          },
          '',
          4033596827,
        ],
        [{}, '', 0],
      ]);
      await persister.startAutoLoad();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      await persistable.del(location);
      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    if (persistable.testAutoLoad) {
      await persistable.set(location, [
        [
          {
            t1: [
              {r1: [{c1: [1, '_', 4065945599]}, '', 1279994494]},
              '',
              1293085726,
            ],
          },
          '',
          4033596827,
        ],
        [{}, '', 0],
      ]);
      await persister.startAutoLoad();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      persistable.write(location, '{');
      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not load from non-existent', async () => {
    if (persistable.testMissing) {
      store.setTables({t1: {r1: {c1: 1}}});
      await (await persistable.getPersister(store, '_')).load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not load from possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await (await persistable.getPersister(store, '.')).load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not error on save to possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await (await persistable.getPersister(store, '.')).save();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });
});

test('Supported, Store', async () => {
  const store = createStore();
  let persisted = '';
  const persister = createCustomPersister(
    store,
    async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
    async (getContent: () => any) => {
      persisted = JSON.stringify(getContent());
    },
    noop,
    noop,
    noop,
    3,
  );
  await persister.load();
  await persister.save();
  await persister.destroy();
  expect(persisted).toEqual('[{"t1":{"r1":{"c1":1}}},{"v1":1}]');
});

test('Not supported, MergeableStore', async () => {
  const store = createMergeableStore('s1', getNow);
  let persisted = '';
  const persister = createCustomPersister(
    store,
    async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
    async (getContent: () => any) => {
      persisted = JSON.stringify(getContent());
    },
    noop,
    noop,
  );
  await persister.load();
  await persister.save();
  await persister.destroy();
  expect(persisted).toEqual('[{"t1":{"r1":{"c1":1}}},{"v1":1}]');
});

describe('Supported, MergeableStore', () => {
  test('Content in setPersisted', async () => {
    const store = createMergeableStore('s1', getNow);
    const content: MergeableContent = [
      [
        {
          t1: [
            {r1: [{c1: [1, '_', 4065945599]}, '', 1279994494]},
            '',
            1293085726,
          ],
        },
        '',
        4033596827,
      ],
      [{v1: [1, '_', 4065945599]}, '', 2304392760],
    ];
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => content,
      async (getContent: () => MergeableContent) => {
        persisted = JSON.stringify(getContent());
      },
      noop,
      noop,
      noop,
      Persists.MergeableStoreOnly,
    );
    await persister.load();
    await persister.save();
    await persister.destroy();
    expect(persisted).toMatchSnapshot();
  });

  test('Changes in setPersisted', async () => {
    const store = createMergeableStore('s1', getNow);
    const persisted: string[] = [];
    const persister = createCustomPersister(
      store,
      async () => [{}, {}],
      async (
        _getContent: () => Content | MergeableContent,
        changes?: Changes | MergeableChanges,
      ) => {
        if (changes != undefined) {
          persisted.push(JSON.stringify(changes));
        }
      },
      noop,
      noop,
      noop,
      3,
    );
    await persister.startAutoSave();
    store.setCell('t1', 'r1', 'c1', 1);
    store.setValue('v1', 1);
    await pause(1);
    await persister.destroy();
    expect(persisted).toMatchSnapshot();
  });

  test('loading from legacy', async () => {
    const store = createMergeableStore('s1', getNow);
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
      async (getContent: () => any) => {
        persisted = JSON.stringify(getContent());
      },
      noop,
      noop,
      noop,
      3,
    );
    await persister.load();
    await persister.save();
    await persister.destroy();
    expect(persisted).toMatchSnapshot();
  });
});

test('Not supported, Store', async () => {
  expect(() =>
    createCustomPersister(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      createStore(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
      asyncNoop,
      noop,
      noop,
      noop,
      Persists.MergeableStoreOnly,
    ),
  ).toThrow();
});
