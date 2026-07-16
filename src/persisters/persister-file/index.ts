import {existsSync, unwatchFile, watchFile, writeFileSync} from 'fs';
import {readFile, rename, unlink, writeFile} from 'fs/promises';
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
  let lastContent: string | null | undefined;

  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.StoreOrMergeableStore>
  > => jsonParseWithUndefined(await readFile(filePath, UTF8));

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.StoreOrMergeableStore>,
  ): Promise<void> => {
    const tempFilePath = filePath + '.' + getUniqueId() + '.tmp';
    const content = jsonStringWithUndefined(getContent());
    const lastContentWas = lastContent;
    lastContent = content;
    try {
      await writeFile(tempFilePath, content, UTF8);
      await rename(tempFilePath, filePath);
    } catch (error) {
      lastContent = lastContentWas;
      throw error;
    } finally {
      await tryCatch(() => unlink(tempFilePath));
    }
  };

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): (() => void) => {
    if (!existsSync(filePath)) {
      writeFileSync(filePath, EMPTY_STRING, UTF8);
    }
    const notify = async () =>
      await tryCatch(
        async () => {
          const content = await readFile(filePath, UTF8);
          if (content != lastContent) {
            lastContent = content;
            listener();
          }
        },
        () => {
          if (lastContent !== null) {
            lastContent = null;
            listener();
          }
        },
      );
    const watchListener = () => notify();
    watchFile(filePath, {interval: 50}, watchListener);
    return watchListener;
  };

  const delPersisterListener = (watchListener: () => void): void =>
    unwatchFile(filePath, watchListener);

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
