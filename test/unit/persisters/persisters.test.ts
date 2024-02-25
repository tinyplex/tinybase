/* eslint-disable jest/no-conditional-expect */

import 'fake-indexeddb/auto';
import {GetLocationMethod, Persistable, nextLoop} from './common';
import {Persister, Store, createStore} from 'tinybase/debug';
import {
  mockAutomerge,
  mockChangesListener,
  mockContentListener,
  mockCrSqliteWasm,
  mockElectricSql,
  mockFile,
  mockIndexedDb,
  mockLocalStorage,
  mockMergeableChangesListener,
  mockMergeableContentListener,
  mockMergeableNoContentListener,
  mockNoContentListener,
  mockPowerSync,
  mockRemote,
  mockSessionStorage,
  mockSqlite3,
  mockSqliteWasm,
  mockYjs,
} from './mocks';
import {pause} from '../common/other';

describe.each([
  ['mockChangesListener', mockChangesListener],
  ['mockNoContentListener', mockNoContentListener],
  ['mockContentListener', mockContentListener],
  ['mockMergeableNoContentListener', mockMergeableNoContentListener],
  ['mockMergeableContentListener', mockMergeableContentListener],
  ['mockMergeableChangesListener', mockMergeableChangesListener],
  ['file', mockFile],
  ['localStorage', mockLocalStorage],
  ['sessionStorage', mockSessionStorage],
  ['remote', mockRemote],
  ['indexedDb', mockIndexedDb],
  ['electricSql', mockElectricSql],
  ['powerSync', mockPowerSync],
  ['sqlite3', mockSqlite3],
  ['sqliteWasm', mockSqliteWasm],
  ['crSqliteWasm', mockCrSqliteWasm],
  ['yjs', mockYjs],
  ['automerge', mockAutomerge],
])('Persists to/from %s', (name: string, persistable: Persistable<any>) => {
  let location: string;
  let getLocationMethod: GetLocationMethod<any> | undefined;
  let store: Store;
  let persister: Persister;

  beforeEach(async () => {
    if (persistable.beforeEach != null) {
      persistable.beforeEach();
    }
    store = createStore();
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
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.save();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
  });

  test('autoSaves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.startAutoSave();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
    store.setTables({t1: {r1: {c1: 2}}});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 2}}},
      {v1: 1},
    ]);
    store.setTables({t1: {r1: {c1: 2}}});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 2}}},
      {v1: 1},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{t1: {r1: {c1: 2}}}, {}]);
    }
    store.setValues({v1: 2});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 2}}},
      {v1: 2},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{}, {v1: 2}]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});
  });

  test('autoSaves without race', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      expect(await persistable.get(location)).toEqual([
        {t1: {r1: {c1: 1}}},
        {},
      ]);
      expect(persister.getStats()).toEqual({loads: 0, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      store.setTables({t1: {r1: {c1: 3}}});
      await pause();
      expect(await persistable.get(location)).toEqual([
        {t1: {r1: {c1: 3}}},
        {},
      ]);
      expect(persister.getStats()).toEqual({loads: 0, saves: 3});
    }
  });

  test('loads', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {v1: 1}]);
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('loads backwards compatible', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}] as any);
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
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
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad();
    await nextLoop();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
    await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(persister.getStats()).toEqual({loads: 2, saves: 0});
    await persistable.set(location, [{t1: {r1: {c1: 3}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
    persister.stopAutoLoad();
    await persistable.set(location, [{t1: {r1: {c1: 4}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
  });

  test('autoSave & autoLoad: no load when saving', async () => {
    if (name == 'file') {
      await persister.startAutoLoad({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 1, saves: 2});
    }
  });

  test('autoSave & autoLoad: no save when loading', async () => {
    if (name == 'file') {
      await persister.startAutoLoad({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 2, saves: 1});
    }
  });

  test('does not delete when autoLoaded is deleted', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    await persistable.del(location);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    persistable.write(location, '{');
    await pause(persistable.autoLoadPause);
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
