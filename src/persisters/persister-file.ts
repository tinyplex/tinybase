import {FSWatcher, watch} from 'fs';
import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {readFile, writeFile} from 'fs/promises';
import {UTF8} from '../common/strings';
import {createCustomPersister} from '../persisters';
import {createFilePersister as createFilePersisterDecl} from '../types/persisters/persister-file';
import {jsonString} from '../common/other';

export const createFilePersister = ((
  store: Store,
  filePath: string,
): Persister => {
  const getPersisted = async (): Promise<[Tables, Values]> =>
    JSON.parse(await readFile(filePath, UTF8));

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await writeFile(filePath, jsonString(getContent()), UTF8);
    } catch {}
  };

  const addPersisterListener = (listener: PersisterListener): FSWatcher =>
    watch(filePath, () => listener());

  const delPersisterListener = (watcher: FSWatcher): void => watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
}) as typeof createFilePersisterDecl;
