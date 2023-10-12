import {FSWatcher, watch} from 'fs';
import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {jsonParse, jsonString} from '../common/json';
import {readFile, writeFile} from 'fs/promises';
import {UTF8} from '../common/strings';
import {createCustomPersister} from '../persisters';
import {createFilePersister as createFilePersisterDecl} from '../types/persisters/persister-file';

export const createFilePersister = ((
  store: Store,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): Persister => {
  const getPersisted = async (): Promise<[Tables, Values]> =>
    jsonParse(await readFile(filePath, UTF8));

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => await writeFile(filePath, jsonString(getContent()), UTF8);

  const addPersisterListener = (listener: PersisterListener): FSWatcher =>
    watch(filePath, () => listener());

  const delPersisterListener = (watcher: FSWatcher): void => watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    ['getFilePath', filePath],
  );
}) as typeof createFilePersisterDecl;
