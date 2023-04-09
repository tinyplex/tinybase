/* eslint-disable jest/no-conditional-expect */

import {
  Persister,
  Store,
  createFilePersister,
  createLocalPersister,
  createRemotePersister,
  createSessionPersister,
  createStore,
} from 'tinybase/debug';
import crypto from 'crypto';
import fetchMock from 'jest-fetch-mock';
import fs from 'fs';
import {pause} from './common';
import tmp from 'tmp';

const GET_HOST = 'http://get.com';
const SET_HOST = 'http://set.com';

type Persistable = {
  beforeEach?: () => void;
  autoLoadPause?: number;
  getLocation: () => string;
  getPersister: (store: Store, location: string) => Persister;
  get: (location: string) => string | null;
  set: (location: string, value: any) => void;
  write: (location: string, value: string) => void;
  delete: (location: string) => void;
};

const nextLoop = async (): Promise<void> => await pause(0);
// fs.watch misses changes made in the same loop, seemingly

const mockFile: Persistable = {
  autoLoadPause: 100,
  getLocation: (): string => {
    tmp.setGracefulCleanup();
    return tmp.fileSync().name;
  },
  getPersister: createFilePersister,
  get: (location: string): string | null => {
    try {
      return JSON.parse(fs.readFileSync(location, 'utf-8'));
    } catch (e) {
      return null;
    }
  },
  set: (location: string, value: any): void =>
    mockFile.write(location, JSON.stringify(value)),
  write: (location: string, value: any): void =>
    fs.writeFileSync(location, value, 'utf-8'),
  delete: (location: string): void => fs.unlinkSync(location),
};

const mockRemote: Persistable = {
  beforeEach: (): void => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
    fetchMock.doMock(async (req) => {
      if (req.url.startsWith(GET_HOST)) {
        const rawBody = mockRemote.get(req.url.substr(GET_HOST.length));
        if (rawBody != null) {
          const body = JSON.stringify(rawBody);
          return {
            headers: {
              ETag: crypto.createHash('md5').update(body).digest('hex'),
            },
            body: req.method == 'GET' ? body : '',
          };
        }
      }
      if (req.url.startsWith(SET_HOST) && req.method == 'POST') {
        const body = await req.text();
        mockRemote.write(req.url.substr(SET_HOST.length), body);
      }
      return '';
    });
  },
  autoLoadPause: 500,
  getLocation: (): string => {
    tmp.setGracefulCleanup();
    return tmp.fileSync().name;
  },
  getPersister: (store, location) =>
    createRemotePersister(store, GET_HOST + location, SET_HOST + location, 0.1),
  get: (location: string): string | null => {
    try {
      return JSON.parse(fs.readFileSync(location, 'utf-8'));
    } catch (e) {
      return null;
    }
  },
  set: (location: string, value: any): void =>
    mockRemote.write(location, JSON.stringify(value)),
  write: (location: string, value: any): void =>
    fs.writeFileSync(location, value, 'utf-8'),
  delete: (location: string): void => fs.unlinkSync(location),
};

const getMockedStorage = (
  storage: Storage,
  getPersister: (store: Store, location: string) => Persister,
): Persistable => {
  const mockStorage = {
    getLocation: (): string => 'test' + Math.random(),
    getPersister,
    get: (location: string): string | null => {
      try {
        return JSON.parse(storage.getItem(location) ?? '');
      } catch (e) {
        return null;
      }
    },
    set: (location: string, value: any): void =>
      mockStorage.write(location, JSON.stringify(value)),
    write: (location: string, value: any): void => {
      storage.setItem(location, value);
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: storage,
          key: location,
        }),
      );
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: storage,
          key: location + 'another',
        }),
      );
    },
    delete: (location: string): void => storage.removeItem(location),
  };
  return mockStorage;
};

const mockLocalStorage = getMockedStorage(
  window.localStorage,
  createLocalPersister,
);
const mockSessionStorage = getMockedStorage(
  window.sessionStorage,
  createSessionPersister,
);

describe.each([
  ['file', mockFile],
  ['remote', mockRemote],
  ['localStorage', mockLocalStorage],
  ['sessionStorage', mockSessionStorage],
])('Persists to/from %s', (name: string, persistable: Persistable) => {
  let location: string;
  let store: Store;
  let persister: Persister;

  beforeEach(() => {
    if (persistable.beforeEach != null) {
      persistable.beforeEach();
    }
    store = createStore();
    location = persistable.getLocation();
    persister = persistable.getPersister(store, location);
  });

  afterEach(() => {
    persister.destroy();
  });

  // ---

  test('gets store', () => {
    expect(persister.getStore()).toEqual(store);
  });

  test('saves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.save();
    expect(persistable.get(location)).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
  });

  test('autoSaves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.startAutoSave();
    expect(persistable.get(location)).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
    store.setTables({t1: {r1: {c1: 2}}});
    await pause();
    expect(persistable.get(location)).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store.setValues({v1: 2});
    await pause();
    expect(persistable.get(location)).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});
  });

  test('autoSaves without race', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      expect(persistable.get(location)).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      expect(persister.getStats()).toEqual({loads: 0, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      store.setTables({t1: {r1: {c1: 3}}});
      await pause();
      expect(persistable.get(location)).toEqual([{t1: {r1: {c1: 3}}}, {}]);
      expect(persister.getStats()).toEqual({loads: 0, saves: 3});
    }
  });

  test('loads', async () => {
    persistable.set(location, [{t1: {r1: {c1: 1}}}, {v1: 1}]);
    await persister.load({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('loads backwards compatible', async () => {
    persistable.set(location, {t1: {r1: {c1: 1}}});
    await persister.load({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('does not load from empty', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.load({});
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
    await persister.load({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('autoLoads', async () => {
    persistable.set(location, {t1: {r1: {c1: 1}}});
    await persister.startAutoLoad({});
    await nextLoop();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
    persistable.set(location, {t1: {r1: {c1: 2}}});
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(persister.getStats()).toEqual({loads: 2, saves: 0});
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
      persistable.set(location, {t1: {r1: {c1: 2}}});
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 2, saves: 1});
    }
  });

  test('does not delete when autoLoaded is deleted', async () => {
    persistable.set(location, {t1: {r1: {c1: 1}}});
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    persistable.delete(location);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    persistable.set(location, {t1: {r1: {c1: 1}}});
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    persistable.write(location, '{');
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not load from non-existent', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persistable.getPersister(store, '_').load({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not load from possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '.').load({});
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
