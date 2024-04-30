import {FSWatcher, watch} from 'fs';
import {
  FilePersister,
  createFilePersister as createFilePersisterDecl,
} from '../types/persisters/persister-file';
import {PersistedContent, PersisterListener} from '../types/persisters';
import {jsonParseWithUndefined, jsonStringWithUndefined} from '../common/json';
import {readFile, writeFile} from 'fs/promises';
import {MergeableStore} from '../types/mergeable-store';
import {Store} from '../types/store';
import {UTF8} from '../common/strings';
import {createCustomPersister} from '../persisters';

export const createFilePersister = ((
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister => {
  const getPersisted = async (): Promise<PersistedContent<3>> =>
    jsonParseWithUndefined(await readFile(filePath, UTF8));

  const setPersisted = async (
    getContent: () => PersistedContent<3>,
  ): Promise<void> =>
    await writeFile(filePath, jsonStringWithUndefined(getContent()), UTF8);

  const addPersisterListener = (listener: PersisterListener<3>): FSWatcher =>
    watch(filePath, () => listener());

  const delPersisterListener = (watcher: FSWatcher): void => watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    3,
    {getFilePath: () => filePath},
  ) as FilePersister;
}) as typeof createFilePersisterDecl;
