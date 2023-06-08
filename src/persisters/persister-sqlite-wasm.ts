import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {createCustomPersister} from '../persisters';
import {createSqliteWasmPersister as createSqliteWasmPersisterDecl} from '../types/persisters/persister-sqlite-wasm';
import {jsonString} from '../common/other';

export const createSqliteWasmPersister = ((
  store: Store,
  sqlite3: any,
  db: any,
): Persister => {
  const getPersisted = (): Promise<[Tables, Values]> =>
    new Promise((resolve) =>
      db.exec('SELECT json FROM tinybase LIMIT 1', {
        callback: (row: string) => resolve(JSON.parse(row)),
      }),
    );

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      db.exec(
        'CREATE TABLE IF NOT EXISTS tinybase(json); ' +
          'INSERT INTO tinybase(rowId, json) VALUES (1, ?) ON CONFLICT DO ' +
          'UPDATE SET json=excluded.json',
        {bind: [jsonString(getContent())]},
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
