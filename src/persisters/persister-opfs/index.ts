import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedContent,
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

  const addPersisterListener = () => {};

  const delPersisterListener = () => {};

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
