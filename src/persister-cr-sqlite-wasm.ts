import {Persister, PersisterListener} from './types/persisters';
import {Store, Tables, Values} from './types/store';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl} from './types/persister-cr-sqlite-wasm';
import {createCustomPersister} from './persisters';
import {jsonString} from './common/other';

const ensureTable = async (db: DB) =>
  await db.exec('CREATE TABLE IF NOT EXISTS tinybase(json);');

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
): Persister => {
  const getPersisted = async (): Promise<[Tables, Values]> => {
    await ensureTable(db);
    return JSON.parse(
      (await db.execA('SELECT json FROM tinybase LIMIT 1'))[0][0],
    );
  };
  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await ensureTable(db);
      await db.exec(
        'INSERT INTO tinybase(rowId, json) VALUES (1, ?) ON CONFLICT DO ' +
          'UPDATE SET json=excluded.json',
        [jsonString(getContent())],
      );
    } catch {}
  };

  const addPersisterListener = (listener: PersisterListener): (() => void) =>
    db.onUpdate(() => listener());

  const delPersisterListener = (removeListener: () => void): void =>
    removeListener();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
}) as typeof createCrSqliteWasmPersisterDecl;
