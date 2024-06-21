import type {
  LocalPersister,
  SessionPersister,
  createLocalPersister as createLocalPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
} from '../../@types/persisters/persister-browser/index.d.ts';
import {Persistables, createCustomPersister} from '../index.ts';
import type {
  Persistables as PersistablesType,
  PersistedContent,
  Persister,
  PersisterListener,
} from '../../@types/persisters/index.d.ts';
import {
  jsonParse,
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {WINDOW} from '../../common/other.ts';

type StorageListener = (event: StorageEvent) => void;
const STORAGE = 'storage';

const createStoragePersister = (
  store: Store | MergeableStore,
  storageName: string,
  storage: Storage,
  onIgnoredError?: (error: any) => void,
): Persister<PersistablesType.StoreOrMergeableStore> => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistablesType.StoreOrMergeableStore>
  > => jsonParseWithUndefined(storage.getItem(storageName) as string);

  const setPersisted = async (
    getContent: () => PersistedContent<PersistablesType.StoreOrMergeableStore>,
  ): Promise<void> =>
    storage.setItem(storageName, jsonStringWithUndefined(getContent()));

  const addPersisterListener = (
    listener: PersisterListener<PersistablesType.StoreOrMergeableStore>,
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
    Persistables.StoreOrMergeableStore,
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
