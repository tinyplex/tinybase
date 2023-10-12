import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {
  createLocalPersister as createLocalPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
} from '../types/persisters/persister-browser';
import {jsonParse, jsonString} from '../common/json';
import {createCustomPersister} from '../persisters';

type StorageListener = (event: StorageEvent) => void;
const STORAGE = 'storage';
const WINDOW = globalThis.window;

const createStoragePersister = (
  store: Store,
  storageName: string,
  storage: Storage,
  onIgnoredError?: (error: any) => void,
): Persister => {
  const getPersisted = async (): Promise<[Tables, Values]> =>
    jsonParse(storage.getItem(storageName) as string);

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => storage.setItem(storageName, jsonString(getContent()));

  const addPersisterListener = (
    listener: PersisterListener,
  ): StorageListener => {
    const storageListener = (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        listener(() => jsonParse(event.newValue as string));
      }
    };
    WINDOW.addEventListener(STORAGE, storageListener);
    return storageListener;
  };

  const delPersisterListener = (storageListener: StorageListener): void =>
    WINDOW.removeEventListener(STORAGE, storageListener);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    ['getStorageName', storageName],
  );
};

export const createLocalPersister = ((
  store: Store,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): Persister =>
  createStoragePersister(
    store,
    storageName,
    localStorage,
    onIgnoredError,
  )) as typeof createLocalPersisterDecl;

export const createSessionPersister = ((
  store: Store,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): Persister =>
  createStoragePersister(
    store,
    storageName,
    sessionStorage,
    onIgnoredError,
  )) as typeof createSessionPersisterDecl;
