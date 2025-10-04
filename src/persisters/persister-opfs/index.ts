import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedContent,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {
  OpfsPersister,
  createOpfsPersister as createOpfsPersisterDecl,
} from '../../@types/persisters/persister-opfs/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {createCustomPersister} from '../common/create.ts';

type FileSystemObserver = {
  observe: (handle: FileSystemFileHandle) => Promise<void>;
  disconnect: () => void;
};

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
