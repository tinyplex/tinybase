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
import {tryCatch, tryFinallyAsync} from '../../common/error.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {addEventListener, WINDOW} from '../../common/other.ts';
import {STORAGE} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

type FileSystemObserver = {
  observe: (handle: FileSystemFileHandle) => Promise<void>;
  disconnect: () => void;
};

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
  ): (() => void) =>
    addEventListener(WINDOW, STORAGE, (event: StorageEvent): void => {
      if (event.storageArea === storage && event.key === storageName) {
        tryCatch(
          () => listener(jsonParseWithUndefined(event.newValue as string)),
          listener,
        );
      }
    });

  const delPersisterListener = (removeListener: () => void): void =>
    removeListener();

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
    let written = 0;
    await tryFinallyAsync(
      async () => {
        await writable.write(jsonStringWithUndefined(getContent()));
        written = 1;
      },
      async () => {
        if (written) {
          await writable.close();
        } else {
          await tryCatch(() => writable.abort());
        }
      },
    );
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
