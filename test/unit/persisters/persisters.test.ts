/* eslint-disable jest/no-conditional-expect */

import 'fake-indexeddb/auto';
import {GetLocationMethod, Persistable, nextLoop} from './common/other.ts';
import {Status, createCustomPersister} from 'tinybase/persisters';
import {
  getMockDatabases,
  mockAutomerge,
  mockChangesListener,
  mockContentListener,
  mockFile,
  mockIndexedDb,
  mockLocalStorage,
  mockMergeableChangesListener,
  mockMergeableContentListener,
  mockMergeableNoContentListener,
  mockNoContentListener,
  mockRemote,
  mockSessionStorage,
  mockYjs,
} from './common/mocks.ts';
import {ALL_VARIANTS} from './common/databases.ts';
import type {Persister} from 'tinybase/persisters';
import type {Store} from 'tinybase';
import {createStatusListener} from '../common/listeners.ts';
import {createStore} from 'tinybase';
import {join} from 'path';
import {pause} from '../common/other.ts';
import tmp from 'tmp';

tmp.setGracefulCleanup();

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
  ['yjs', mockYjs],
  ['automerge', mockAutomerge],
  ...getMockDatabases(ALL_VARIANTS),
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
    persister = await persistable.getPersister(store, location);
  });

  afterEach(async () => {
    persister.destroy();
    if (persistable.afterEach != null) {
      await persistable.afterEach(location);
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

  // eslint-disable-next-line jest/no-done-callback
  test('saving status', (done) => {
    expect.assertions(3);
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    expect(persister.getStatus()).toEqual(Status.Idle);
    persister
      .save()
      .then(() => {
        expect(persister.getStatus()).toEqual(Status.Idle);
        done();
      })
      .catch(done);
    expect(persister.getStatus()).toEqual(Status.Saving);
  });

  test('saving status listener', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    const listener = createStatusListener(persister);
    listener.listenToStatus('');
    await persister.save();
    expect(listener.logs).toEqual({'': [2, 0]});
  });

  test('autoSaves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    expect(persister.isAutoSaving()).toEqual(false);
    await persister.startAutoSave();
    expect(persister.isAutoSaving()).toEqual(true);
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});

    store.setTables({t1: {r1: {c1: 1, c2: 2}}});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1, c2: 2}}},
      {v1: 1},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{t1: {r1: {c2: 2}}}, {}, 1]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 2});

    store.setValues({v1: 1, v2: 2});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1, c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{}, {v2: 2}, 1]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});

    store.delCell('t1', 'r1', 'c2');
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([
        {t1: {r1: {c2: undefined}}},
        {},
        1,
      ]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 4});

    store.delValue('v2');
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{}, {v2: undefined}, 1]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 5});

    persister.stopAutoSave();
    expect(persister.isAutoSaving()).toEqual(false);
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

  // eslint-disable-next-line jest/no-done-callback
  test('loading status', (done) => {
    expect.assertions(3);
    persistable.set(location, [{t1: {r1: {c1: 1}}}, {v1: 1}]).then(() => {
      expect(persister.getStatus()).toEqual(Status.Idle);
      persister
        .load()
        .then(() => {
          expect(persister.getStatus()).toEqual(Status.Idle);
          done();
        })
        .catch(done);
      expect(persister.getStatus()).toEqual(Status.Loading);
    });
  });

  test('loading status listener', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    const listener = createStatusListener(persister);
    listener.listenToStatus('');
    await persister.load();
    expect(listener.logs).toEqual({'': [1, 0]});
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
    await persister.load([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('does not load from corrupt', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persistable.write(location, '{');
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('autoLoads', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    expect(persister.isAutoLoading()).toEqual(false);
    await persister.startAutoLoad();
    expect(persister.isAutoLoading()).toEqual(true);
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
    expect(persister.isAutoLoading()).toEqual(false);

    await persistable.set(location, [{t1: {r1: {c1: 4}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
  });

  test('autoSave & autoLoad: roundtrip', async () => {
    await persister.startAutoSave();
    store.setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}});
    store.setValues({v1: 1, v2: 2});
    store.delTable('t2');
    store.delRow('t1', 'r2');
    store.delCell('t1', 'r1', 'c2');
    store.delValue('v2');
    await pause();
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    persister.stopAutoSave();
    store.delTables().delValues();
    await pause();
    expect(store.getContent()).toEqual([{}, {}]);
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    await persister.startAutoLoad();
    await nextLoop();
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave & autoLoad: no load when saving', async () => {
    if (name == 'file') {
      await persister.startAutoLoad([{t1: {r1: {c1: 1}}}, {}]);
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
      await persister.startAutoLoad([{t1: {r1: {c1: 1}}}, {}]);
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
    await persister.startAutoLoad();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    await persistable.del(location);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    await persistable.write(location, '{');
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not load from non-existent', async () => {
    if (persistable.testMissing) {
      store.setTables({t1: {r1: {c1: 1}}});
      await (await persistable.getPersister(store, '_')).load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not autoLoad from non-existent', async () => {
    if (persistable.testMissing) {
      store.setTables({t1: {r1: {c1: 1}}});
      const persister = await (
        await persistable.getPersister(store, join(tmp.dirSync().name, '_'))
      ).startAutoLoad();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      persister.destroy();
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

test('does not error on getPersister returning undefined', async () => {
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    async () => undefined,
    async () => {},
    () => 0,
    () => 0,
  );
  await persister.load();
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
});

test('does not error on getPersister returning invalid', async () => {
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    async () => 1 as any,
    async () => {},
    () => 0,
    () => 0,
  );
  await persister.load();
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
});

test('does not error on persister listener returning undefined', async () => {
  let triggerListener = (_listener: any) => {};
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    async () => undefined,
    async () => {},
    (listener) => (triggerListener = listener),
    () => 0,
  );
  await persister.startAutoLoad();
  triggerListener(undefined);
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
});

test('does not error on persister listener returning invalid', async () => {
  let triggerListener = (_listener: any) => {};
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    async () => 1 as any,
    async () => {},
    (listener) => (triggerListener = listener),
    () => 0,
  );
  await persister.startAutoLoad();
  triggerListener(1);
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
});
