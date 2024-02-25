import {Content, MergeableContent, Persister, Store} from 'tinybase/debug';
import {GetLocationMethod, Persistable} from './common';
import {
  createLocalPersister,
  createSessionPersister,
} from 'tinybase/debug/persisters/persister-browser';
import {createFilePersister} from 'tinybase/debug/persisters/persister-file';
import fs from 'fs';
import tmp from 'tmp';

export const mockFile: Persistable = {
  autoLoadPause: 100,
  getLocation: async (): Promise<string> => {
    tmp.setGracefulCleanup();
    return tmp.fileSync().name;
  },
  getLocationMethod: ['getFilePath', (location) => location],
  getPersister: createFilePersister,
  get: async (location: string): Promise<Content | MergeableContent | void> => {
    try {
      return JSON.parse(fs.readFileSync(location, 'utf-8'));
    } catch {}
  },
  set: async (
    location: string,
    content: Content | MergeableContent,
  ): Promise<void> => await mockFile.write(location, JSON.stringify(content)),
  write: async (location: string, rawContent: any): Promise<void> =>
    fs.writeFileSync(location, rawContent, 'utf-8'),
  del: async (location: string): Promise<void> => fs.unlinkSync(location),
  testMissing: true,
};

const getMockedStorage = (
  storage: Storage,
  getPersister: (store: Store, location: string) => Persister,
): Persistable => {
  const mockStorage = {
    getLocation: async (): Promise<string> => 'test' + Math.random(),
    getLocationMethod: [
      'getStorageName',
      (location) => location,
    ] as GetLocationMethod<string>,
    getPersister,
    get: async (location: string): Promise<Content | void> => {
      try {
        return JSON.parse(storage.getItem(location) ?? '');
      } catch {}
    },
    set: async (
      location: string,
      content: Content | MergeableContent,
    ): Promise<void> =>
      await mockStorage.write(location, JSON.stringify(content)),
    write: async (location: string, rawContent: any): Promise<void> => {
      storage.setItem(location, rawContent);
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: storage,
          key: location,
          newValue: rawContent,
        }),
      );
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: storage,
          key: location + 'another',
        }),
      );
    },
    del: async (location: string): Promise<void> =>
      storage.removeItem(location),
    testMissing: true,
  };
  return mockStorage;
};

export const mockLocalStorage = getMockedStorage(
  window.localStorage,
  createLocalPersister,
);

export const mockSessionStorage = getMockedStorage(
  window.sessionStorage,
  createSessionPersister,
);
