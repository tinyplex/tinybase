/* eslint-disable jest/no-conditional-expect */

import {
  Changes,
  Content,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Persister,
  createCustomPersister,
  createMergeableStore,
  createStore,
} from 'tinybase/debug';
import {GetLocationMethod, Persistable, nextLoop} from './common';
import {START_TIME, nullStamped, stamped} from '../common/mergeable';
import {
  mockFile,
  mockLocalStorage,
  mockMergeableChangesListener,
  mockMergeableContentListener,
  mockMergeableNoContentListener,
  mockSessionStorage,
  mockSync,
} from './mocks';
import {pause} from '../common/other';

beforeEach(() => {
  jest.useFakeTimers({now: START_TIME});
});

afterEach(() => {
  jest.useRealTimers();
});

describe.each([
  ['mockMergeableNoContentListener', mockMergeableNoContentListener],
  ['mockMergeableContentListener', mockMergeableContentListener],
  ['mockMergeableChangesListener', mockMergeableChangesListener],
  ['file', mockFile],
  ['localStorage', mockLocalStorage],
  ['sessionStorage', mockSessionStorage],
  ['sync', mockSync],
])('Persists to/from %s', (name: string, persistable: Persistable<any>) => {
  let location: string;
  let getLocationMethod: GetLocationMethod<any> | undefined;
  let store: MergeableStore;
  let persister: Persister;

  beforeEach(async () => {
    if (persistable.beforeEach != null) {
      persistable.beforeEach();
    }
    store = createMergeableStore('s1');
    location = await persistable.getLocation();
    getLocationMethod = persistable.getLocationMethod;
    persister = persistable.getPersister(store, location);
  });

  afterEach(() => {
    persister.destroy();
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
    await persister.startAutoSave();
    expect(await persistable.get(location)).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
    store.setTables({t1: {r1: {c1: 2}}});
    await pause(1, true);
    expect(await persistable.get(location)).toMatchSnapshot();
    store.setTables({t1: {r1: {c1: 2}}});
    await pause(1, true);
    expect(await persistable.get(location)).toMatchSnapshot();
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual(
        stamped(0, 2, [
          stamped(0, 2, {
            t1: stamped(0, 2, {r1: stamped(0, 2, {c1: stamped(0, 2, 2)})}),
          }),
          nullStamped({}),
          1,
        ]),
      );
    }
    store.setValues({v1: 2});
    await pause(1, true);
    expect(await persistable.get(location)).toMatchSnapshot();
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual(
        stamped(2, 0, [
          nullStamped({}),
          stamped(2, 0, {v1: stamped(2, 0, 2)}),
          1,
        ]),
      );
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});
  });

  test('autoSaves without race', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      expect(await persistable.get(location)).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 0, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      store.setTables({t1: {r1: {c1: 3}}});
      await pause(50, true);
      expect(await persistable.get(location)).toMatchSnapshot();
      expect(persister.getStats()).toEqual({loads: 0, saves: 3});
    }
  });

  test('loads', async () => {
    await persistable.set(location, [
      'Hc2DO@000008DKS9',
      [
        [
          'Hc2DO@000008DKS9',
          {
            t1: [
              'Hc2DO@000008DKS9',
              {
                r1: [
                  'Hc2DO@000008DKS9',
                  {c1: ['Hc2DO@000008DKS9', 1, 4065945599]},
                  1279994494,
                ],
              },
              1293085726,
            ],
          },
          4033596827,
        ],
        [
          'Hc2DO@000008DKS9',
          {v1: ['Hc2DO@000008DKS9', 1, 4065945599]},
          2304392760,
        ],
      ],
      2033316771,
    ]);
    await persister.load();
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
    await persister.load({t1: {r1: {c1: 2}}}, {v1: 1});
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
    await persistable.set(location, [
      'Hc2DO@000008DKS9',
      [
        [
          'Hc2DO@000008DKS9',
          {
            t1: [
              'Hc2DO@000008DKS9',
              {
                r1: [
                  'Hc2DO@000008DKS9',
                  {c1: ['Hc2DO@000008DKS9', 1, 4065945599]},
                  1279994494,
                ],
              },
              1293085726,
            ],
          },
          4033596827,
        ],
        ['', {}, 0],
      ],
      4033596827,
    ]);
    await persister.startAutoLoad();
    await nextLoop(true);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getMergeableContent()).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
    await persistable.set(location, [
      'Hc2DO@000018DKS9',
      [
        [
          'Hc2DO@000018DKS9',
          {
            t1: [
              'Hc2DO@000018DKS9',
              {
                r1: [
                  'Hc2DO@000018DKS9',
                  {c1: ['Hc2DO@000018DKS9', 2, 2669080357]},
                  274319047,
                ],
              },
              4089057354,
            ],
          },
          3386696034,
        ],
        ['', {}, 0],
      ],
      3386696034,
    ]);

    await pause(persistable.autoLoadPause, true);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(store.getMergeableContent()).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 2, saves: 0});
    await persistable.set(location, [
      'Hc2DO@000028DKS9',
      [
        [
          'Hc2DO@000028DKS9',
          {
            t1: [
              'Hc2DO@000028DKS9',
              {
                r1: [
                  'Hc2DO@000028DKS9',
                  {c1: ['Hc2DO@000028DKS9', 3, 3252714811]},
                  1416411412,
                ],
              },
              3704904231,
            ],
          },
          4008152259,
        ],
        ['', {}, 0],
      ],
      4008152259,
    ]);
    await pause(persistable.autoLoadPause, true);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(store.getMergeableContent()).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
    persister.stopAutoLoad();
    await persistable.set(location, [
      'Hc2DO@000028DKS9',
      [
        [
          'Hc2DO@000028DKS9',
          {
            t1: [
              'Hc2DO@000028DKS9',
              {
                r1: [
                  'Hc2DO@000028DKS9',
                  {c1: ['Hc2DO@000028DKS9', 3, 3252714811]},
                  1416411412,
                ],
              },
              3704904231,
            ],
          },
          4008152259,
        ],
        ['', {}, 0],
      ],
      4008152259,
    ]);
    await pause(persistable.autoLoadPause, true);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(store.getMergeableContent()).toMatchSnapshot();
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
  });

  test('autoSave & autoLoad: no load when saving', async () => {
    if (name == 'file') {
      await persister.startAutoLoad({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      await nextLoop(true);
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      await nextLoop(true);
      expect(persister.getStats()).toEqual({loads: 1, saves: 2});
    }
  });

  test('autoSave & autoLoad: no save when loading', async () => {
    if (name == 'file') {
      await persister.startAutoLoad({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      await nextLoop(true);
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
      await nextLoop(true);
      expect(persister.getStats()).toEqual({loads: 2, saves: 1});
    }
  });

  test('does not delete when autoLoaded is deleted', async () => {
    await persistable.set(location, [
      'Hc2DO@000008DKS9',
      [
        [
          'Hc2DO@000008DKS9',
          {
            t1: [
              'Hc2DO@000008DKS9',
              {
                r1: [
                  'Hc2DO@000008DKS9',
                  {c1: ['Hc2DO@000008DKS9', 1, 4065945599]},
                  1279994494,
                ],
              },
              1293085726,
            ],
          },
          4033596827,
        ],
        ['', {}, 0],
      ],
      4033596827,
    ]);
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    await persistable.del(location);
    await pause(persistable.autoLoadPause, true);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    await persistable.set(location, [
      'Hc2DO@000008DKS9',
      [
        [
          'Hc2DO@000008DKS9',
          {
            t1: [
              'Hc2DO@000008DKS9',
              {
                r1: [
                  'Hc2DO@000008DKS9',
                  {c1: ['Hc2DO@000008DKS9', 1, 4065945599]},
                  1279994494,
                ],
              },
              1293085726,
            ],
          },
          4033596827,
        ],
        ['', {}, 0],
      ],
      4033596827,
    ]);
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    persistable.write(location, '{');
    await pause(persistable.autoLoadPause, true);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not load from non-existent', async () => {
    if (persistable.testMissing) {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '_').load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not load from possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '.').load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not error on save to possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '.').save();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });
});

test('Not supported, MergeableStore', async () => {
  const store = createMergeableStore('s1');
  let persisted = '';
  const persister = createCustomPersister(
    store,
    async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
    async (getContent: () => any) => {
      persisted = JSON.stringify(getContent());
    },
    () => null,
    () => null,
  );
  await persister.load();
  await persister.save();
  persister.destroy();
  expect(persisted).toEqual('[{"t1":{"r1":{"c1":1}}},{"v1":1}]');
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
    () => null,
    () => null,
    () => null,
    true,
  );
  await persister.load();
  await persister.save();
  persister.destroy();
  expect(persisted).toEqual('[{"t1":{"r1":{"c1":1}}},{"v1":1}]');
});

describe('Supported, MergeableStore', () => {
  test('Content in setPersisted', async () => {
    const store = createMergeableStore('s1');
    const content: MergeableContent = [
      'Hc2DO@000008DKS9',
      [
        [
          'Hc2DO@000008DKS9',
          {
            t1: [
              'Hc2DO@000008DKS9',
              {
                r1: [
                  'Hc2DO@000008DKS9',
                  {c1: ['Hc2DO@000008DKS9', 1, 4065945599]},
                  1279994494,
                ],
              },
              1293085726,
            ],
          },
          4033596827,
        ],
        [
          'Hc2DO@000008DKS9',
          {v1: ['Hc2DO@000008DKS9', 1, 4065945599]},
          2304392760,
        ],
      ],
      2033316771,
    ];
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => content,
      async (getContent: () => Content | MergeableContent) => {
        persisted = JSON.stringify(getContent());
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.load();
    await persister.save();
    persister.destroy();
    expect(persisted).toMatchSnapshot();
  });

  test('Changes in setPersisted', async () => {
    const store = createMergeableStore('s1');
    const persisted: string[] = [];
    const persister = createCustomPersister(
      store,
      async () => [{}, {}],
      async (
        _getContent: () => Content | MergeableContent,
        getChanges?: () => Changes | MergeableChanges,
      ) => {
        const changes = getChanges?.();
        if (changes != undefined) {
          persisted.push(JSON.stringify(changes));
        }
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.startAutoSave();
    store.setCell('t1', 'r1', 'c1', 1);
    store.setValue('v1', 1);
    await pause(1, true);
    persister.destroy();
    expect(persisted).toMatchSnapshot();
  });

  test('loading from legacy', async () => {
    const store = createMergeableStore('s1');
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
      async (getContent: () => any) => {
        persisted = JSON.stringify(getContent());
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.load();
    await persister.save();
    persister.destroy();
    expect(persisted).toMatchSnapshot();
  });
});
