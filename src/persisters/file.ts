import {Callback, Json} from '../types/common.d';
import {
  Persister,
  createFilePersister as createFilePersisterDecl,
} from '../types/persisters.d';
import {promises, watch} from 'fs';
import {FSWatcher} from 'fs';
import {Store} from '../types/store.d';
import {UTF8} from '../common/strings';
import {createCustomPersister} from './common';

export const createFilePersister = ((
  store: Store,
  filePath: string,
): Persister => {
  let watcher: FSWatcher | undefined;

  const getPersisted = async (): Promise<string | null | undefined> => {
    try {
      return await promises.readFile(filePath, UTF8);
    } catch {}
  };

  const setPersisted = async (json: Json): Promise<void> => {
    try {
      await promises.writeFile(filePath, json, UTF8);
    } catch {}
  };

  const startListeningToPersisted = (didChange: Callback): void => {
    watcher = watch(filePath, didChange);
  };

  const stopListeningToPersisted = (): void => {
    watcher?.close();
    watcher = undefined;
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
}) as typeof createFilePersisterDecl;
