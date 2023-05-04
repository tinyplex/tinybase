import {Persister, PersisterListener} from './types/persisters';
import {Store, Tables, Values} from './types/store';
import {
  createLocalPersister as createLocalPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
} from './types/persister-browser';
import {createCustomPersister} from './persisters';
import {jsonString} from './common/other';

type StoreListener = (event: StorageEvent) => void;
const STORAGE = 'storage';
const WINDOW = globalThis.window;

const getStoragePersister = (
  store: Store,
  storageName: string,
  storage: Storage,
): Persister => {
  const getPersisted = async (): Promise<string | null | undefined> =>
    storage.getItem(storageName);

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => storage.setItem(storageName, jsonString(getContent()));

  const addPersisterListener = (listener: PersisterListener): StoreListener => {
    const storeListener = (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        let newValue;
        try {
          newValue = JSON.parse(event.newValue as string);
        } catch {}
        listener(newValue);
      }
    };
    WINDOW.addEventListener(STORAGE, storeListener);
    return storeListener;
  };

  const delPersisterListener = (storeListener: StoreListener): void =>
    WINDOW.removeEventListener(STORAGE, storeListener);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};

export const createLocalPersister = ((
  store: Store,
  storageName: string,
): Persister =>
  getStoragePersister(
    store,
    storageName,
    localStorage,
  )) as typeof createLocalPersisterDecl;

export const createSessionPersister = ((
  store: Store,
  storageName: string,
): Persister =>
  getStoragePersister(
    store,
    storageName,
    sessionStorage,
  )) as typeof createSessionPersisterDecl;
