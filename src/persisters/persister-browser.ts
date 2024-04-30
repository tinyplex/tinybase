import {
  LocalPersister,
  SessionPersister,
  createLocalPersister as createLocalPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
} from '../types/persisters/persister-browser';
import {
  PersistedContent,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {
  jsonParse,
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json';
import {MergeableStore} from '../types/mergeable-store';
import {Store} from '../types/store';
import {createCustomPersister} from '../persisters';

type StorageListener = (event: StorageEvent) => void;
const STORAGE = 'storage';
const WINDOW = globalThis.window;

const createStoragePersister = (
  store: Store | MergeableStore,
  storageName: string,
  storage: Storage,
  onIgnoredError?: (error: any) => void,
): Persister<3> => {
  const getPersisted = async (): Promise<PersistedContent<3>> =>
    jsonParseWithUndefined(storage.getItem(storageName) as string);

  const setPersisted = async (
    getContent: () => PersistedContent<3>,
  ): Promise<void> =>
    storage.setItem(storageName, jsonStringWithUndefined(getContent()));

  const addPersisterListener = (
    listener: PersisterListener<3>,
  ): StorageListener => {
    const storageListener = (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        try {
          listener(jsonParse(event.newValue as string));
        } catch {
          listener();
        }
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
    3,
    {getStorageName: () => storageName},
  );
};

export const createLocalPersister = ((
  store: Store | MergeableStore,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): LocalPersister =>
  createStoragePersister(
    store,
    storageName,
    localStorage,
    onIgnoredError,
  ) as LocalPersister) as typeof createLocalPersisterDecl;

export const createSessionPersister = ((
  store: Store | MergeableStore,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): SessionPersister =>
  createStoragePersister(
    store,
    storageName,
    sessionStorage,
    onIgnoredError,
  ) as SessionPersister) as typeof createSessionPersisterDecl;
