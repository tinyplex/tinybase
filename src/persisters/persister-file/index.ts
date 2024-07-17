import {EMPTY_STRING, UTF8} from '../../common/strings.ts';
import {FSWatcher, existsSync, watch, writeFileSync} from 'fs';
import type {
  FilePersister,
  createFilePersister as createFilePersisterDecl,
} from '../../@types/persisters/persister-file/index.d.ts';
import type {
  PersistedContent,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import {Persists, createCustomPersister} from '../index.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {readFile, writeFile} from 'fs/promises';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';

export const createFilePersister = ((
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.StoreOrMergeableStore>
  > => jsonParseWithUndefined(await readFile(filePath, UTF8));

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.StoreOrMergeableStore>,
  ): Promise<void> =>
    await writeFile(filePath, jsonStringWithUndefined(getContent()), UTF8);

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): FSWatcher => {
    if (!existsSync(filePath)) {
      writeFileSync(filePath, EMPTY_STRING, UTF8);
    }
    return watch(filePath, () => listener());
  };

  const delPersisterListener = (watcher: FSWatcher): void => watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    Persists.StoreOrMergeableStore,
    {getFilePath: () => filePath},
  ) as FilePersister;
}) as typeof createFilePersisterDecl;
