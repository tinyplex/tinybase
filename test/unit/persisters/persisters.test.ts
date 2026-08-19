import 'fake-indexeddb/auto';
import {join} from 'path';
import type {Content, Store} from 'tinybase';
import {createStore} from 'tinybase';
import type {Persister, PersisterListener} from 'tinybase/persisters';
import {createCustomPersister, Status} from 'tinybase/persisters';
import {createLocalPersister} from 'tinybase/persisters/persister-browser';
import tmp from 'tmp';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {createStatusListener} from '../common/listeners.ts';
import {noop, pause, waitFor} from '../common/other.ts';
import {ALL_VARIANTS} from './common/databases.ts';
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
  mockOpfs,
  mockRemote,
  mockSessionStorage,
  mockYjs,
} from './common/mocks.ts';
import {
  asyncNoop,
  GetLocationMethod,
  getPersistedContentWaiter,
  Persistable,
} from './common/other.ts';

tmp.setGracefulCleanup();

describe.each([
  ['mockChangesListener', mockChangesListener],
  ['mockNoContentListener', mockNoContentListener],
  ['mockContentListener', mockContentListener],
  ['mockMergeableNoContentListener', mockMergeableNoContentListener],
  ['mockMergeableContentListener', mockMergeableContentListener],
  ['mockMergeableChangesListener', mockMergeableChangesListener],
  ['file', mockFile],
  ['opfs', mockOpfs],
  ['localStorage', mockLocalStorage],
  ['sessionStorage', mockSessionStorage],
  ['remote', mockRemote],
  ['indexedDb', mockIndexedDb],
  ['yjs', mockYjs],
  ['automerge', mockAutomerge],
  ...getMockDatabases(ALL_VARIANTS),
])('Persists to/from %s', (name: string, persistable: Persistable<any>) => {
  const expectPersistedContent = getPersistedContentWaiter(persistable);
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
    await persister.destroy();
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

  test('saves and loads objects and arrays', async () => {
    store
      .setTables({t1: {r1: {c1: {k1: 'v'}, c2: [1, 2, 3]}}})
      .setValues({v1: {x: 1}, v2: [4, 5]});
    await persister.save();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: '�{"k1":"v"}', c2: '�[1,2,3]'}}},
      {v1: '�{"x":1}', v2: '�[4,5]'},
    ]);
    store.delTables().delValues();
    await persister.load();
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: {k1: 'v'}, c2: [1, 2, 3]}},
    });
    expect(store.getValues()).toEqual({v1: {x: 1}, v2: [4, 5]});
    expect(persister.getStats()).toEqual({loads: 1, saves: 1});
  });

  test('saving status', () =>
    new Promise((done: any) => {
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
    }));

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
    await expectPersistedContent(location, [
      {t1: {r1: {c1: 1, c2: 2}}},
      {v1: 1},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{t1: {r1: {c2: 2}}}, {}, 1]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 2});

    store.setValues({v1: 1, v2: 2});
    await expectPersistedContent(location, [
      {t1: {r1: {c1: 1, c2: 2}}},
      {v1: 1, v2: 2},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{}, {v2: 2}, 1]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});

    store.delCell('t1', 'r1', 'c2');
    await expectPersistedContent(location, [
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
    await expectPersistedContent(location, [{t1: {r1: {c1: 1}}}, {v1: 1}]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{}, {v2: undefined}, 1]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 5});

    await persister.stopAutoSave();
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
      await expectPersistedContent(location, [{t1: {r1: {c1: 3}}}, {}]);
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

  test('loading status', () =>
    new Promise((done: any) => {
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
    }));

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
    if (persistable.testAutoLoad) {
      await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
      expect(persister.isAutoLoading()).toEqual(false);
      await persister.startAutoLoad();
      expect(persister.isAutoLoading()).toEqual(true);
      await pause(0);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      expect(persister.getStats()).toEqual({loads: 1, saves: 0});

      await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
      await waitFor(() =>
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}}),
      );
      // A single change can be observed in transient states by a polling
      // persister, so an exact load count cannot be guaranteed.
      expect(persister.getStats().loads).toBeGreaterThanOrEqual(2);
      expect(persister.getStats().saves).toEqual(0);

      await persistable.set(location, [{t1: {r1: {c1: 3}}}, {}]);
      await waitFor(() =>
        expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}}),
      );
      expect(persister.getStats().loads).toBeGreaterThanOrEqual(3);
      expect(persister.getStats().saves).toEqual(0);
      await persister.stopAutoLoad();
      expect(persister.isAutoLoading()).toEqual(false);
      const loadsWhenStopped = persister.getStats().loads;

      await persistable.set(location, [{t1: {r1: {c1: 4}}}, {}]);
      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
      expect(persister.getStats()).toEqual({loads: loadsWhenStopped, saves: 0});
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
      await expectPersistedContent(location, [{t1: {r1: {c1: 1}}}, {v1: 1}]);
      await persister.stopAutoSave();
      await persister.save();
      store.delTables().delValues();
      await pause();
      expect(store.getContent()).toEqual([{}, {}]);
      expect(await persistable.get(location)).toEqual([
        {t1: {r1: {c1: 1}}},
        {v1: 1},
      ]);
      await persister.startAutoLoad();
      await pause(0);
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    }
  });

  test('autoSave & autoLoad: no load when saving', async () => {
    if (name == 'file') {
      await persister.startAutoPersisting([{t1: {r1: {c1: 1}}}, {}]);
      await pause(persistable.autoLoadPause);
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      await waitFor(() =>
        expect(persister.getStats()).toEqual({loads: 1, saves: 2}),
      );
    }
  });

  test('autoSave & autoLoad: no save when loading', async () => {
    if (name == 'file') {
      await persister.startAutoPersisting([{t1: {r1: {c1: 1}}}, {}]);
      await pause(persistable.autoLoadPause);
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
      await waitFor(() =>
        expect(persister.getStats()).toEqual({loads: 2, saves: 1}),
      );
    }
  });

  test('does not delete when autoLoaded is deleted', async () => {
    if (persistable.testAutoLoad) {
      await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
      await persister.startAutoLoad();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      await persistable.del(location);
      await pause(persistable.autoLoadPause);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    if (persistable.testAutoLoad) {
      await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
      await persister.startAutoLoad();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      await persistable.write(location, '{');
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

  test('does not autoLoad from non-existent', async () => {
    if (persistable.testMissing && persistable.testAutoLoad) {
      store.setTables({t1: {r1: {c1: 1}}});
      const persister = await (
        await persistable.getPersister(store, join(tmp.dirSync().name, '_'))
      ).startAutoLoad();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      await persister.destroy();
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

test('does not error when custom persister has no content', async () => {
  const ignoredErrors: any[] = [];
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    asyncNoop,
    asyncNoop,
    noop,
    noop,
    (error) => ignoredErrors.push(error),
  );
  await persister.load();
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  expect(ignoredErrors).toEqual([]);
});

test('loads initial content when custom persister has no content', async () => {
  const ignoredErrors: any[] = [];
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    asyncNoop,
    asyncNoop,
    noop,
    noop,
    (error) => ignoredErrors.push(error),
  );
  await persister.load([{t2: {r2: {c2: 2}}}, {v2: 2}]);
  expect(store.getContent()).toEqual([{t2: {r2: {c2: 2}}}, {v2: 2}]);
  expect(ignoredErrors).toEqual([]);
});

test('errors when custom persister returns invalid content', async () => {
  const ignoredErrors: any[] = [];
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    async () => 1 as any,
    asyncNoop,
    noop,
    noop,
    (error) => ignoredErrors.push(error),
  );
  await persister.load();
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  expect(ignoredErrors.map((error) => error.message)).toEqual(['tinybase:1:1']);
});

test('does not error on persister listener returning undefined', async () => {
  let triggerListener = (_listener: any) => {};
  const ignoredErrors: any[] = [];
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    asyncNoop,
    asyncNoop,
    (listener) => (triggerListener = listener),
    noop,
    (error) => ignoredErrors.push(error),
  );
  await persister.startAutoLoad();
  triggerListener(undefined);
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  expect(ignoredErrors).toEqual([]);
});

test('does not error on persister listener returning invalid', async () => {
  let triggerListener = (_listener: any) => {};
  const store = createStore();
  store.setTables({t1: {r1: {c1: 1}}});
  const persister = createCustomPersister(
    store,
    asyncNoop,
    asyncNoop,
    (listener) => (triggerListener = listener),
    noop,
  );
  await persister.startAutoLoad();
  triggerListener(1);
  expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
});

test('supports the undefined marker except as a complete string', async () => {
  const storageName = 'reserved-undefined-marker';
  const undefinedMarker = '\uFFFC';
  const ignoredError = vi.fn();
  const store = createStore().setValues({
    longer: 'a' + undefinedMarker + 'b',
    nested: {value: undefinedMarker},
  });
  const persister = createLocalPersister(store, storageName, ignoredError);

  try {
    await persister.save();
    store.delValues();
    await persister.load();
    expect(store.getValues()).toEqual({
      longer: 'a' + undefinedMarker + 'b',
      nested: {value: undefinedMarker},
    });
    expect(ignoredError).not.toHaveBeenCalled();

    const invalidValue = vi.fn();
    store.addInvalidValueListener('reserved', invalidValue);
    store.setValue('reserved', undefinedMarker);
    await persister.save();
    expect(store.hasValue('reserved')).toEqual(false);
    expect(invalidValue).toHaveBeenCalledWith(store, 'reserved', [
      undefinedMarker,
    ]);
    expect(ignoredError).not.toHaveBeenCalled();
  } finally {
    await persister.destroy();
    localStorage.removeItem(storageName);
  }
});

test('awaits queued scheduled actions', async () => {
  let releaseFirstAction: () => void = noop;
  let secondActionRan = false;
  let secondScheduleResolved = false;
  const firstActionGate = new Promise<void>(
    (resolve) => (releaseFirstAction = resolve),
  );
  const persister = createCustomPersister(
    createStore(),
    asyncNoop,
    asyncNoop,
    noop,
    noop,
  );

  const firstSchedule = persister.schedule(() => firstActionGate);
  const secondSchedule = persister
    .schedule(async () => {
      secondActionRan = true;
    })
    .then(() => (secondScheduleResolved = true));
  await pause(0);
  expect(secondActionRan).toBe(false);
  expect(secondScheduleResolved).toBe(false);

  releaseFirstAction();
  await firstSchedule;
  await secondSchedule;
  expect(secondActionRan).toBe(true);
  expect(secondScheduleResolved).toBe(true);
});

test('keeps scheduling after an ignored-error handler throws', async () => {
  const handlerError = new Error('handler error');
  let markSecondActionStarted: () => void = noop;
  let releaseFirstAction: () => void = noop;
  let releaseSecondAction: () => void = noop;
  let secondActionRan = false;
  const firstActionGate = new Promise<void>(
    (resolve) => (releaseFirstAction = resolve),
  );
  const secondActionGate = new Promise<void>(
    (resolve) => (releaseSecondAction = resolve),
  );
  const secondActionStarted = new Promise<void>(
    (resolve) => (markSecondActionStarted = resolve),
  );
  const persister = createCustomPersister(
    createStore(),
    asyncNoop,
    asyncNoop,
    noop,
    noop,
    () => {
      throw handlerError;
    },
  );

  const failedSchedule = expect(
    persister.schedule(async () => {
      await firstActionGate;
      throw new Error('action error');
    }),
  ).rejects.toBe(handlerError);
  const secondSchedule = persister.schedule(async () => {
    secondActionRan = true;
    markSecondActionStarted();
    await secondActionGate;
  });
  releaseFirstAction();
  await secondActionStarted;
  await pause(0);
  releaseSecondAction();

  await failedSchedule;
  await secondSchedule;
  expect(secondActionRan).toBe(true);
  await persister.destroy();
});

test.each(['load', 'save'] as const)(
  'restores idle status when %s error handling throws',
  async (method) => {
    const operationError = new Error('operation error');
    const handlerError = new Error('handler error');
    const persister = createCustomPersister(
      createStore(),
      async () => {
        if (method == 'load') {
          throw operationError;
        }
      },
      async () => {
        if (method == 'save') {
          throw operationError;
        }
      },
      noop,
      noop,
      () => {
        throw handlerError;
      },
    );

    await expect(persister[method]()).rejects.toBe(handlerError);
    expect(persister.getStatus()).toBe(Status.Idle);
    await persister.destroy();
  },
);

test.each([
  ['load', Status.Loading],
  ['save', Status.Saving],
] as const)(
  'restores idle status when %s status listeners throw',
  async (method, activeStatus) => {
    const listenerError = new Error('listener error');
    const persister = createCustomPersister(
      createStore(),
      asyncNoop,
      asyncNoop,
      noop,
      noop,
    );
    persister.addStatusListener((_persister, status) => {
      if (status == activeStatus) {
        throw listenerError;
      }
    });

    await expect(persister[method]()).rejects.toBe(listenerError);
    expect(persister.getStatus()).toBe(Status.Idle);
    await persister.destroy();
  },
);

test('contains automatic save status listener errors', async () => {
  const listenerError = new Error('listener error');
  const store = createStore();
  const persister = createCustomPersister(
    store,
    asyncNoop,
    asyncNoop,
    noop,
    noop,
  );
  await persister.startAutoSave();
  persister.addStatusListener((_persister, status) => {
    if (status == Status.Saving) {
      throw listenerError;
    }
  });

  store.setValue('value', 1);
  await pause(0);
  expect(persister.getStatus()).toBe(Status.Idle);
  await persister.destroy();
});

test('uses the scheduling owner error handler', async () => {
  let releaseFirstAction: () => void = noop;
  const firstActionGate = new Promise<void>(
    (resolve) => (releaseFirstAction = resolve),
  );
  const firstIgnoredError = vi.fn();
  const secondIgnoredError = vi.fn();
  const scheduleId = {};
  const createPersister = (onIgnoredError: (error: any) => void) =>
    (createCustomPersister as any)(
      createStore(),
      asyncNoop,
      asyncNoop,
      noop,
      noop,
      onIgnoredError,
      undefined,
      {},
      0,
      scheduleId,
    ) as Persister;
  const persister1 = createPersister(firstIgnoredError);
  const persister2 = createPersister(secondIgnoredError);
  const error = new Error('second action error');

  const firstSchedule = persister1.schedule(() => firstActionGate);
  const secondSchedule = persister2.schedule(async () => {
    throw error;
  });
  releaseFirstAction();
  await firstSchedule;
  await secondSchedule;

  expect(firstIgnoredError).not.toHaveBeenCalled();
  expect(secondIgnoredError).toHaveBeenCalledWith(error);
  await persister1.destroy();
  await persister2.destroy();
});

test('awaits only its running action on destroy', async () => {
  let markSecondActionStarted: () => void = noop;
  let releaseFirstAction: () => void = noop;
  let releaseSecondAction: () => void = noop;
  const firstActionGate = new Promise<void>(
    (resolve) => (releaseFirstAction = resolve),
  );
  const secondActionGate = new Promise<void>(
    (resolve) => (releaseSecondAction = resolve),
  );
  const secondActionStarted = new Promise<void>(
    (resolve) => (markSecondActionStarted = resolve),
  );
  const scheduleId = {};
  const createPersister = () =>
    (createCustomPersister as any)(
      createStore(),
      asyncNoop,
      asyncNoop,
      noop,
      noop,
      undefined,
      undefined,
      {},
      0,
      scheduleId,
    ) as Persister;
  const persister1 = createPersister();
  const persister2 = createPersister();
  const firstSchedule = persister1.schedule(() => firstActionGate);
  const secondSchedule = persister2.schedule(async () => {
    markSecondActionStarted();
    await secondActionGate;
  });
  let destroyResolved = false;
  const destroying = persister1.destroy().then(() => (destroyResolved = true));

  try {
    await pause(0);
    expect(destroyResolved).toBe(false);

    releaseFirstAction();
    await secondActionStarted;
    await pause(0);
    expect(destroyResolved).toBe(true);
  } finally {
    releaseFirstAction();
    releaseSecondAction();
    await destroying;
    await firstSchedule;
    await secondSchedule;
    await persister2.destroy();
  }
});

test('waits for old auto-load cleanup before restarting', async () => {
  let addCount = 0;
  let releaseCleanup: () => void = noop;
  const cleanupGate = new Promise<void>(
    (resolve) => (releaseCleanup = resolve),
  );
  const persister = createCustomPersister(
    createStore(),
    asyncNoop,
    asyncNoop,
    () => ++addCount,
    async () => await cleanupGate,
  );
  await persister.startAutoLoad();

  const restarting = persister.startAutoLoad();
  await pause(0);
  expect(addCount).toBe(1);

  releaseCleanup();
  await restarting;
  expect(addCount).toBe(2);
  expect(persister.isAutoLoading()).toBe(true);
});

test('observes changes during the initial auto-load', async () => {
  let listener = (_content: any) => {};
  let releaseInitialLoad: () => void = noop;
  const initialLoadGate = new Promise<void>(
    (resolve) => (releaseInitialLoad = resolve),
  );
  const store = createStore();
  const persister = createCustomPersister(
    store,
    async () => {
      await initialLoadGate;
      return [{pets: {fido: {species: 'dog'}}}, {}];
    },
    asyncNoop,
    (newListener) => (listener = newListener),
    noop,
  );

  const starting = persister.startAutoLoad();
  await pause(0);
  listener([{pets: {fido: {species: 'cat'}}}, {}]);
  releaseInitialLoad();
  await starting;

  expect(store.getCell('pets', 'fido', 'species')).toBe('cat');
  expect(persister.getStats()).toEqual({loads: 2, saves: 0});
});

test('defers no-content auto-load until after saving', async () => {
  let listener: PersisterListener = noop;
  let persisted: Content = [{}, {}];
  let markSaveStarted: () => void = noop;
  let releaseSave: () => void = noop;
  const saveStarted = new Promise<void>(
    (resolve) => (markSaveStarted = resolve),
  );
  const saveGate = new Promise<void>((resolve) => (releaseSave = resolve));
  const getPersisted = vi.fn(async () => persisted);
  const store = createStore();
  const persister = createCustomPersister(
    store,
    getPersisted,
    async (getContent) => {
      persisted = getContent();
      await listener();
      markSaveStarted();
      await saveGate;
    },
    (newListener) => {
      listener = newListener;
      return 1;
    },
    noop,
  );
  await persister.startAutoLoad();
  store.setValue('value', 'local');

  const saving = persister.save();
  await saveStarted;
  persisted = [{}, {value: 'external'}];
  await listener();
  releaseSave();
  await saving;

  expect(store.getContent()).toEqual([{}, {value: 'external'}]);
  expect(getPersisted).toHaveBeenCalledTimes(2);
  expect(persister.getStats()).toEqual({loads: 2, saves: 1});
  await persister.destroy();
});

test('cancels deferred auto-load notifications when stopped', async () => {
  let listener: PersisterListener = noop;
  let persisted: Content = [{}, {}];
  let markSaveStarted: () => void = noop;
  let releaseSave: () => void = noop;
  const saveStarted = new Promise<void>(
    (resolve) => (markSaveStarted = resolve),
  );
  const saveGate = new Promise<void>((resolve) => (releaseSave = resolve));
  const getPersisted = vi.fn(async () => persisted);
  const store = createStore();
  const persister = createCustomPersister(
    store,
    getPersisted,
    async (getContent) => {
      persisted = getContent();
      markSaveStarted();
      await saveGate;
    },
    (newListener) => {
      listener = newListener;
      return 1;
    },
    noop,
  );
  await persister.startAutoLoad();
  store.setValue('value', 'local');

  const saving = persister.save();
  await saveStarted;
  persisted = [{}, {value: 'external'}];
  await listener();
  await persister.stopAutoLoad();
  releaseSave();
  await saving;

  expect(store.getContent()).toEqual([{}, {value: 'local'}]);
  expect(getPersisted).toHaveBeenCalledOnce();
  expect(persister.getStats()).toEqual({loads: 1, saves: 1});
  await persister.destroy();
});

test('retains a deferred auto-load through a reentrant save', async () => {
  let listener: PersisterListener = noop;
  let persisted: Content = [{}, {}];
  let markSecondSaveStarted: () => void = noop;
  let releaseSecondSave: () => void = noop;
  const secondSaveStarted = new Promise<void>(
    (resolve) => (markSecondSaveStarted = resolve),
  );
  const secondSaveGate = new Promise<void>(
    (resolve) => (releaseSecondSave = resolve),
  );
  const store = createStore();
  let saveCount = 0;
  const persister = createCustomPersister(
    store,
    async () => persisted,
    async () => {
      if (++saveCount == 1) {
        persisted = [{}, {value: 'external'}];
        await listener();
      } else {
        markSecondSaveStarted();
        await secondSaveGate;
      }
    },
    (newListener) => {
      listener = newListener;
      return 1;
    },
    noop,
  );
  await persister.startAutoLoad();
  store.setValue('value', 'local');
  let secondSaving: Promise<Persister> | undefined;
  let startSecondSave = true;
  persister.addStatusListener((_persister, status) => {
    if (status == Status.Idle && startSecondSave) {
      startSecondSave = false;
      secondSaving = persister.save();
    }
  });

  await persister.save();
  await secondSaveStarted;
  releaseSecondSave();
  await secondSaving;

  expect(store.getContent()).toEqual([{}, {value: 'external'}]);
  expect(persister.getStats()).toEqual({loads: 2, saves: 2});
  await persister.destroy();
});

test('releases shared scheduler state on destroy', async () => {
  let releaseFirstAction: () => void = noop;
  let secondActionRan = false;
  const firstActionGate = new Promise<void>(
    (resolve) => (releaseFirstAction = resolve),
  );
  const scheduleId = {};
  const createPersister = () =>
    (createCustomPersister as any)(
      createStore(),
      asyncNoop,
      asyncNoop,
      noop,
      noop,
      undefined,
      undefined,
      {},
      0,
      scheduleId,
    ) as Persister;
  const persister1 = createPersister();
  const persister2 = createPersister();

  const firstSchedule = persister1.schedule(() => firstActionGate);
  const secondSchedule = persister2.schedule(async () => {
    secondActionRan = true;
  });
  const destroying = persister1.destroy();
  releaseFirstAction();
  await destroying;
  await firstSchedule;
  await secondSchedule;
  expect(secondActionRan).toBe(true);

  await persister2.destroy();
  const persister3 = createPersister();
  await persister3.schedule(asyncNoop);
  await persister3.destroy();
});

test('stops auto-persistence before extra destruction', async () => {
  const delPersisterListener = vi.fn();
  const extraDestroy = vi.fn();
  const store = createStore();
  const persister = (createCustomPersister as any)(
    store,
    asyncNoop,
    asyncNoop,
    () => 1,
    delPersisterListener,
    undefined,
    undefined,
    {destroy: extraDestroy},
  ) as Persister;

  await persister.startAutoPersisting();
  await persister.destroy();

  expect(persister.isAutoLoading()).toBe(false);
  expect(persister.isAutoSaving()).toBe(false);
  expect(delPersisterListener).toHaveBeenCalledWith(1);
  expect(extraDestroy).toHaveBeenCalledOnce();
  expect(store.getListenerStats().transaction).toBe(0);
});

test('shares concurrent destruction', async () => {
  let releaseDestroy: () => void = noop;
  const destroyGate = new Promise<void>(
    (resolve) => (releaseDestroy = resolve),
  );
  const persister = (createCustomPersister as any)(
    createStore(),
    asyncNoop,
    asyncNoop,
    noop,
    noop,
    undefined,
    undefined,
    {destroy: () => destroyGate},
  ) as Persister;
  let destroyed1 = false;
  let destroyed2 = false;

  const destroying1 = persister.destroy().then(() => (destroyed1 = true));
  const destroying2 = persister.destroy().then(() => (destroyed2 = true));
  await pause(0);

  expect(destroyed1).toBe(false);
  expect(destroyed2).toBe(false);
  releaseDestroy();
  await Promise.all([destroying1, destroying2]);
  expect(destroyed1).toBe(true);
  expect(destroyed2).toBe(true);
});

test('supports falsey auto-load handles', async () => {
  let listener: PersisterListener = noop;
  const delPersisterListener = vi.fn();
  const store = createStore();
  const persister = createCustomPersister(
    store,
    asyncNoop,
    asyncNoop,
    (newListener) => {
      listener = newListener;
      return 0;
    },
    delPersisterListener,
  );

  await persister.startAutoLoad();
  expect(persister.isAutoLoading()).toBe(true);
  await persister.stopAutoLoad();

  expect(persister.isAutoLoading()).toBe(false);
  expect(delPersisterListener).toHaveBeenCalledWith(0);
  await listener([{table: {row: {cell: 1}}}, {}]);
  expect(store.getTables()).toEqual({});
  expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  await persister.destroy();
});

test('cancels pending auto-load registration on destroy', async () => {
  let markListenerStarted: () => void = noop;
  let releaseListener: () => void = noop;
  const listenerStarted = new Promise<void>(
    (resolve) => (markListenerStarted = resolve),
  );
  const listenerGate = new Promise<void>(
    (resolve) => (releaseListener = resolve),
  );
  const delPersisterListener = vi.fn();
  const persister = createCustomPersister(
    createStore(),
    asyncNoop,
    asyncNoop,
    async () => {
      markListenerStarted();
      await listenerGate;
      return 1;
    },
    delPersisterListener,
  );
  const starting = persister.startAutoLoad();
  await listenerStarted;
  let destroyResolved = false;
  const destroying = persister.destroy().then(() => (destroyResolved = true));

  await pause(0);
  expect(destroyResolved).toBe(false);
  releaseListener();
  await starting;
  await destroying;

  expect(persister.isAutoLoading()).toBe(false);
  expect(delPersisterListener).toHaveBeenCalledWith(1);
  expect(persister.getStats()).toEqual({loads: 0, saves: 0});
});

test('serializes pending auto-load registrations', async () => {
  let addCount = 0;
  let releaseFirstListener: () => void = noop;
  const firstListenerGate = new Promise<void>(
    (resolve) => (releaseFirstListener = resolve),
  );
  const delPersisterListener = vi.fn();
  const persister = createCustomPersister(
    createStore(),
    asyncNoop,
    asyncNoop,
    async () => {
      const handle = ++addCount;
      if (handle == 1) {
        await firstListenerGate;
      }
      return handle;
    },
    delPersisterListener,
  );
  const firstStart = persister.startAutoLoad();
  await pause(0);
  const secondStart = persister.startAutoLoad();

  await pause(0);
  expect(addCount).toBe(1);
  releaseFirstListener();
  await firstStart;
  await secondStart;

  expect(addCount).toBe(2);
  expect(delPersisterListener).toHaveBeenCalledWith(1);
  expect(persister.isAutoLoading()).toBe(true);
  await persister.destroy();
  expect(delPersisterListener).toHaveBeenLastCalledWith(2);
});

test('awaits in-flight auto-load cleanup on destroy', async () => {
  let markCleanupStarted: () => void = noop;
  let releaseCleanup: () => void = noop;
  const cleanupStarted = new Promise<void>(
    (resolve) => (markCleanupStarted = resolve),
  );
  const cleanupGate = new Promise<void>(
    (resolve) => (releaseCleanup = resolve),
  );
  const persister = createCustomPersister(
    createStore(),
    asyncNoop,
    asyncNoop,
    () => 1,
    async () => {
      markCleanupStarted();
      await cleanupGate;
    },
  );
  await persister.startAutoLoad();
  const stopping = persister.stopAutoLoad();
  await cleanupStarted;
  let destroyResolved = false;
  const destroying = persister.destroy().then(() => (destroyResolved = true));

  await pause(0);
  expect(destroyResolved).toBe(false);
  releaseCleanup();
  await stopping;
  await destroying;

  expect(persister.isAutoLoading()).toBe(false);
});

test('does not finish starting auto-save after destruction', async () => {
  let markSaveStarted: () => void = noop;
  let releaseSave: () => void = noop;
  const saveStarted = new Promise<void>(
    (resolve) => (markSaveStarted = resolve),
  );
  const saveGate = new Promise<void>((resolve) => (releaseSave = resolve));
  const setPersisted = vi.fn(async () => {
    markSaveStarted();
    await saveGate;
  });
  const store = createStore();
  const persister = createCustomPersister(
    store,
    asyncNoop,
    setPersisted,
    noop,
    noop,
  );
  const starting = persister.startAutoSave();
  await saveStarted;
  const destroying = persister.destroy();

  releaseSave();
  await starting;
  await destroying;
  store.setValue('value', 1);
  await pause(0);

  expect(persister.isAutoSaving()).toBe(false);
  expect(store.getListenerStats().transaction).toBe(0);
  expect(setPersisted).toHaveBeenCalledOnce();
});

test('only completes the latest concurrent auto-save start', async () => {
  const setPersisted = vi.fn(asyncNoop);
  const store = createStore();
  const persister = createCustomPersister(
    store,
    asyncNoop,
    setPersisted,
    noop,
    noop,
  );
  const firstStart = persister.startAutoSave();
  const secondStart = persister.startAutoSave();

  await firstStart;
  await secondStart;

  expect(persister.isAutoSaving()).toBe(true);
  expect(store.getListenerStats().transaction).toBe(1);
  expect(setPersisted).toHaveBeenCalledOnce();
  await persister.destroy();
});

test.each([false, true])(
  'stops the first auto-persistence half when the second fails, save first %s',
  async (startSaveFirst) => {
    const startupError = new Error('startup');
    const cleanupError = new Error('cleanup');
    const store = createStore();
    const delPersisterListener = vi.fn(async () => {
      throw cleanupError;
    });
    const ignoredError = vi.fn((error) => {
      throw error;
    });
    const persister = createCustomPersister(
      store,
      asyncNoop,
      async () => {
        if (!startSaveFirst) {
          throw startupError;
        }
      },
      async () => {
        if (startSaveFirst) {
          throw startupError;
        }
        return 1;
      },
      delPersisterListener,
      ignoredError,
    );

    await expect(
      persister.startAutoPersisting(undefined, startSaveFirst),
    ).rejects.toBe(startupError);

    expect(persister.isAutoLoading()).toBe(false);
    expect(persister.isAutoSaving()).toBe(false);
    expect(store.getListenerStats().transaction).toBe(0);
    expect(delPersisterListener).toHaveBeenCalledTimes(startSaveFirst ? 0 : 1);
    expect(
      ignoredError.mock.calls.filter(([error]) => error === cleanupError),
    ).toHaveLength(startSaveFirst ? 0 : 1);
    await persister.destroy();
  },
);

test('stops a partially started second auto-persistence half', async () => {
  const startupError = new Error('startup');
  const delPersisterListener = vi.fn(asyncNoop);
  const store = createStore();
  const persister = createCustomPersister(
    store,
    async () => {
      throw startupError;
    },
    asyncNoop,
    async () => 1,
    delPersisterListener,
    (error) => {
      throw error;
    },
  );

  await expect(persister.startAutoPersisting(undefined, true)).rejects.toBe(
    startupError,
  );

  expect(persister.isAutoLoading()).toBe(false);
  expect(persister.isAutoSaving()).toBe(false);
  expect(store.getListenerStats().transaction).toBe(0);
  expect(delPersisterListener).toHaveBeenCalledOnce();
  await persister.destroy();
});

test.each([false, true])(
  'does not stop a newer auto-persistence half, save first %s',
  async (startSaveFirst) => {
    const startupError = new Error('startup');
    let markSecondStarted: () => void = noop;
    let releaseSecond: () => void = noop;
    let addCount = 0;
    let saveCount = 0;
    const secondStarted = new Promise<void>(
      (resolve) => (markSecondStarted = resolve),
    );
    const secondGate = new Promise<void>(
      (resolve) => (releaseSecond = resolve),
    );
    const store = createStore();
    const persister = createCustomPersister(
      store,
      asyncNoop,
      async () => {
        if (!startSaveFirst && ++saveCount == 1) {
          markSecondStarted();
          await secondGate;
          throw startupError;
        }
      },
      async () => {
        const handle = ++addCount;
        if (startSaveFirst && handle == 1) {
          markSecondStarted();
          await secondGate;
          throw startupError;
        }
        return handle;
      },
      noop,
      (error) => {
        throw error;
      },
    );
    const starting = persister.startAutoPersisting(undefined, startSaveFirst);
    await secondStarted;

    await (startSaveFirst
      ? persister.startAutoSave()
      : persister.startAutoLoad());
    releaseSecond();
    await expect(starting).rejects.toBe(startupError);

    expect(persister.isAutoLoading()).toBe(!startSaveFirst);
    expect(persister.isAutoSaving()).toBe(startSaveFirst);
    expect(store.getListenerStats().transaction).toBe(startSaveFirst ? 1 : 0);
    await persister.destroy();
  },
);

test.each([false, true])(
  'does not stop a newer second auto-persistence half, save first %s',
  async (startSaveFirst) => {
    const startupError = new Error('startup');
    let markSecondStarted: () => void = noop;
    let releaseSecond: () => void = noop;
    let loadCount = 0;
    let saveCount = 0;
    let listenerHandle = 0;
    const secondStarted = new Promise<void>(
      (resolve) => (markSecondStarted = resolve),
    );
    const secondGate = new Promise<void>(
      (resolve) => (releaseSecond = resolve),
    );
    const persister = createCustomPersister(
      createStore(),
      async () => {
        if (startSaveFirst && ++loadCount == 1) {
          markSecondStarted();
          await secondGate;
          throw startupError;
        }
      },
      async () => {
        if (!startSaveFirst && ++saveCount == 1) {
          markSecondStarted();
          await secondGate;
          throw startupError;
        }
      },
      async () => ++listenerHandle,
      asyncNoop,
      (error) => {
        throw error;
      },
    );
    const starting = persister.startAutoPersisting(undefined, startSaveFirst);
    await secondStarted;

    const newerSecondStart = startSaveFirst
      ? persister.startAutoLoad()
      : persister.startAutoSave();
    releaseSecond();
    await expect(starting).rejects.toBe(startupError);
    await newerSecondStart;

    expect(persister.isAutoLoading()).toBe(startSaveFirst);
    expect(persister.isAutoSaving()).toBe(!startSaveFirst);
    await persister.destroy();
  },
);

test('stops both auto-persistence halves when cleanup throws', async () => {
  const cleanupError = new Error('cleanup');
  const setPersisted = vi.fn(asyncNoop);
  const store = createStore();
  const persister = createCustomPersister(
    store,
    asyncNoop,
    setPersisted,
    () => 1,
    () => {
      throw cleanupError;
    },
    (error) => {
      throw error;
    },
  );
  await persister.startAutoPersisting();

  await expect(persister.stopAutoPersisting()).rejects.toBe(cleanupError);
  store.setValue('value', 1);
  await pause(0);

  expect(persister.isAutoLoading()).toBe(false);
  expect(persister.isAutoSaving()).toBe(false);
  expect(store.getListenerStats().transaction).toBe(0);
  expect(setPersisted).toHaveBeenCalledOnce();
  await persister.destroy();
});
