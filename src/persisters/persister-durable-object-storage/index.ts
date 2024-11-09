import type {
  DurableObjectStoragePersister,
  createDurableObjectStoragePersister as createDurableObjectStoragePersisterDecl,
} from '../../@types/persisters/persister-durable-object-storage/index.js';
import type {
  PersistedContent,
  Persists as PersistsType,
} from '../../@types/persisters/index.js';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.js';
import {createCustomPersister} from '../common/create.ts';

const KEY = 'tinybase';

export const createDurableObjectStoragePersister = ((
  store: MergeableStore,
  storage: DurableObjectStorage,
  storagePrefix: string,
  onIgnoredError?: (error: any) => void,
): DurableObjectStoragePersister => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.MergeableStoreOnly>
  > => jsonParseWithUndefined((await storage.get(KEY)) ?? '{}');

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.MergeableStoreOnly>,
  ): Promise<void> =>
    await storage.put(KEY, jsonStringWithUndefined(getContent()));

  const addPersisterListener = (): void => {};

  const delPersisterListener = (): void => {};

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    2, // MergeableStoreOnly,
    {getDurableObjectStorage: () => storage},
  ) as DurableObjectStoragePersister;
}) as typeof createDurableObjectStoragePersisterDecl;
