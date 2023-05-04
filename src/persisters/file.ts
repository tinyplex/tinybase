import {
  Persister,
  PersisterListener,
  createFilePersister as createFilePersisterDecl,
} from '../types/persisters.d';
import {Store, Tables, Values} from '../types/store.d';
import {promises, watch} from 'fs';
import {FSWatcher} from 'fs';
import {UTF8} from '../common/strings';
import {createCustomPersister} from './common';
import {jsonString} from '../common/other';

export const createFilePersister = ((
  store: Store,
  filePath: string,
): Persister => {
  const getPersisted = async (): Promise<string | null | undefined> => {
    try {
      return await promises.readFile(filePath, UTF8);
    } catch {}
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await promises.writeFile(filePath, jsonString(getContent()), UTF8);
    } catch {}
  };

  const startListeningToPersisted = (listener: PersisterListener): FSWatcher =>
    watch(filePath, () => listener());

  const stopListeningToPersisted = (watcher: FSWatcher): void =>
    watcher?.close();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
}) as typeof createFilePersisterDecl;
