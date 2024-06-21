import {FSWatcher, watch} from 'fs';
import type {
  FilePersister,
  createFilePersister as createFilePersisterDecl,
} from '../../@types/persisters/persister-file/index.d.ts';
import {Persistables, createCustomPersister} from '../index.ts';
import type {
  Persistables as PersistablesType,
  PersistedContent,
  PersisterListener,
} from '../../@types/persisters/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {readFile, writeFile} from 'fs/promises';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {UTF8} from '../../common/strings.ts';

export const createFilePersister = ((
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistablesType.StoreOrMergeableStore>
  > => jsonParseWithUndefined(await readFile(filePath, UTF8));

  const setPersisted = async (
    getContent: () => PersistedContent<PersistablesType.StoreOrMergeableStore>,
  ): Promise<void> =>
    await writeFile(filePath, jsonStringWithUndefined(getContent()), UTF8);

  const addPersisterListener = (
    listener: PersisterListener<PersistablesType.StoreOrMergeableStore>,
  ): FSWatcher => watch(filePath, () => listener());

  const delPersisterListener = (watcher: FSWatcher): void => watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    Persistables.StoreOrMergeableStore,
    {getFilePath: () => filePath},
  ) as FilePersister;
}) as typeof createFilePersisterDecl;
