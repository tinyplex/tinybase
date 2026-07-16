import {FSWatcher, existsSync, watch, writeFileSync} from 'fs';
import {readFile, rename, unlink, writeFile} from 'fs/promises';
import {basename, dirname} from 'path';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedContent,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {
  FilePersister,
  createFilePersister as createFilePersisterDecl,
} from '../../@types/persisters/persister-file/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {getUniqueId} from '../../common/codec.ts';
import {tryCatch} from '../../common/error.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {EMPTY_STRING, UTF8} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

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
  ): Promise<void> => {
    const tempFilePath = filePath + '.' + getUniqueId() + '.tmp';
    try {
      await writeFile(
        tempFilePath,
        jsonStringWithUndefined(getContent()),
        UTF8,
      );
      await rename(tempFilePath, filePath);
    } finally {
      await tryCatch(() => unlink(tempFilePath));
    }
  };

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): FSWatcher => {
    if (!existsSync(filePath)) {
      writeFileSync(filePath, EMPTY_STRING, UTF8);
    }
    return watch(dirname(filePath), (_, filename) => {
      if (filename?.toString() == basename(filePath)) {
        listener();
      }
    });
  };

  const delPersisterListener = (watcher: FSWatcher): void => watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    3, // StoreOrMergeableStore,
    {getFilePath: () => filePath},
  ) as FilePersister;
}) as typeof createFilePersisterDecl;
