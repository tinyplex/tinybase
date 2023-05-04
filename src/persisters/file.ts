import {
  Persister,
  PersisterListener,
  createFilePersister as createFilePersisterDecl,
} from '../types/persisters.d';
import {Store, Tables, Values} from '../types/store.d';
import {readFile, writeFile} from 'fs/promises';
import {FSWatcher} from 'fs';
import {UTF8} from '../common/strings';
import {createCustomPersister} from './common';
import {jsonString} from '../common/other';
import {watch} from 'fs';

export const createFilePersister = ((
  store: Store,
  filePath: string,
): Persister => {
  const getPersisted = async (): Promise<string | null | undefined> => {
    try {
      return await readFile(filePath, UTF8);
    } catch {}
  };

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
