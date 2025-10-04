import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedContent,
  Persister,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {
  createLocalPersister as createLocalPersisterDecl,
  createOpfsPersister as createOpfsPersisterDecl,
  createSessionPersister as createSessionPersisterDecl,
  LocalPersister,
  OpfsPersister,
  SessionPersister,
} from '../../@types/persisters/persister-browser/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {tryCatch, WINDOW} from '../../common/other.ts';
import {createCustomPersister} from '../common/create.ts';

type StorageListener = (event: StorageEvent) => void;
type FileSystemObserver = {
  observe: (handle: FileSystemFileHandle) => Promise<void>;
  disconnect: () => void;
};

const STORAGE = 'storage';

const createStoragePersister = (
  store: Store | MergeableStore,
  storageName: string,
  storage: Storage,
  onIgnoredError?: (error: any) => void,
): Persister<PersistsType.StoreOrMergeableStore> => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.StoreOrMergeableStore>
  > => jsonParseWithUndefined(storage.getItem(storageName) as string);

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.StoreOrMergeableStore>,
  ): Promise<void> =>
    storage.setItem(storageName, jsonStringWithUndefined(getContent()));

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): StorageListener => {
    const storageListener = (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        tryCatch(
          () => listener(jsonParseWithUndefined(event.newValue as string)),
          listener,
        );
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
    3, // StoreOrMergeableStore,
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

export const createOpfsPersister = ((
  store: Store | MergeableStore,
  handle: FileSystemFileHandle,
  onIgnoredError?: (error: any) => void,
): OpfsPersister => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.StoreOrMergeableStore>
  > => jsonParseWithUndefined(await (await handle.getFile()).text());

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.StoreOrMergeableStore>,
  ): Promise<void> => {
    const writable = await handle.createWritable();
    await writable.write(jsonStringWithUndefined(getContent()));
    await writable.close();
  };

  const addPersisterListener = async (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): Promise<FileSystemObserver> => {
    // @ts-expect-error FileSystemObserver is not yet typed
    const observer = new FileSystemObserver(() => listener());
    await observer.observe(handle);
    return observer;
  };

  const delPersisterListener = (observer: FileSystemObserver) =>
    observer?.disconnect();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    3, // StoreOrMergeableStore,
    {getHandle: () => handle},
  ) as OpfsPersister;
}) as typeof createOpfsPersisterDecl;
