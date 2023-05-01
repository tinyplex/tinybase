import {Callback, Json} from '../types/common.d';
import {
  Persister,
  createLocalPersister as createLocalPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
} from '../types/persisters.d';
import {Store} from '../types/store.d';
import {createCustomPersister} from './common';

type Listener = (event: StorageEvent) => void;
const STORAGE = 'storage';
const WINDOW = globalThis.window;

const getStoragePersister = (
  store: Store,
  storageName: string,
  storage: Storage,
): Persister => {
  const getPersisted = async (): Promise<string | null | undefined> =>
    storage.getItem(storageName);

  const setPersisted = async (json: Json): Promise<void> =>
    storage.setItem(storageName, json);

  const startListeningToPersisted = (didChange: Callback): Listener => {
    const listener = (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        didChange();
      }
    };
    WINDOW.addEventListener(STORAGE, listener);
    return listener;
  };

  const stopListeningToPersisted = (listener: Listener): void =>
    WINDOW.removeEventListener(STORAGE, listener);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
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
