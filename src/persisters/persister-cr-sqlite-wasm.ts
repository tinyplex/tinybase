import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl} from '../types/persisters/persister-cr-sqlite-wasm';
import {createCustomPersister} from '../persisters';
import {jsonString} from '../common/other';

const run = async (db: any, sql: string, args: any[] = []): Promise<void> =>
  db.exec(sql, args);

const get = async (db: any, sql: string): Promise<any[]> => await db.execA(sql);

const ensureTable = async (db: DB) =>
  await db.exec('CREATE TABLE IF NOT EXISTS tinybase(json);');

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
): Persister => {
  const getPersisted = async (): Promise<[Tables, Values]> => {
    await ensureTable(db);
    return JSON.parse(
      (await get(db, 'SELECT json FROM tinybase LIMIT 1'))[0][0],
    );
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await ensureTable(db);
      await run(
        db,
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
