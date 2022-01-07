import {Callback, Json} from '../common.d';
import {
  Persister,
  createLocalPersister as createLocalPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
} from '../persisters.d';
import {Store} from '../store.d';
import {createCustomPersister} from './common';

const STORAGE = 'storage';
const WINDOW = globalThis.window;

const getStoragePersister = (
  store: Store,
  storageName: string,
  storage: Storage,
): Persister => {
  let listener: ((event: StorageEvent) => void) | undefined;

  const getPersisted = async (): Promise<string | null | undefined> =>
    storage.getItem(storageName);

  const setPersisted = async (json: Json): Promise<void> =>
    storage.setItem(storageName, json);

  const startListeningToPersisted = (didChange: Callback): void => {
    listener = (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        didChange();
      }
    };
    WINDOW.addEventListener(STORAGE, listener);
  };

  const stopListeningToPersisted = (): void => {
    WINDOW.removeEventListener(
      STORAGE,
      listener as (event: StorageEvent) => void,
    );
    listener = undefined;
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
};

export const createLocalPersister: typeof createLocalPersisterDecl = (
  store: Store,
  storageName: string,
): Persister => getStoragePersister(store, storageName, localStorage);

export const createSessionPersister: typeof createSessionPersisterDecl = (
  store: Store,
  storageName: string,
): Persister => getStoragePersister(store, storageName, sessionStorage);
