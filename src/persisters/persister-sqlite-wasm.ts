import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {createCustomPersister} from '../persisters';
import {createSqliteWasmPersister as createSqliteWasmPersisterDecl} from '../types/persisters/persister-sqlite-wasm';
import {jsonString} from '../common/other';

const run = async (db: any, sql: string, args: any[] = []): Promise<void> =>
  db.exec(sql, {bind: args});

const get = async (db: any, sql: string): Promise<any[]> =>
  db.exec(sql, {returnValue: 'resultRows'});

const ensureTable = async (db: any): Promise<void> =>
  await run(db, 'CREATE TABLE IF NOT EXISTS tinybase(json);');

export const createSqliteWasmPersister = ((
  store: Store,
  sqlite3: any,
  db: any,
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

  const addPersisterListener = (listener: PersisterListener): void =>
    sqlite3.capi.sqlite3_update_hook(db, () => listener(), 0);

  const delPersisterListener = (): void =>
    sqlite3.capi.sqlite3_update_hook(db, () => 0, 0);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
}) as typeof createSqliteWasmPersisterDecl;
