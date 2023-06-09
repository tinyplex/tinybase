import {IdObj, objMap} from '../common/obj';
import {Persister, PersisterListener} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {Database} from 'sqlite3';
import {arrayMap} from '../common/array';
import {createCustomPersister} from '../persisters';
import {createSqlite3Persister as createSqlite3PersisterDecl} from '../types/persisters/persister-sqlite3';
import {jsonString} from '../common/other';

const run = (db: Database, sql: string, args: any[] = []): Promise<void> =>
  new Promise((resolve, reject) =>
    db.run(sql, args, (err) => (err ? reject(err) : resolve())),
  );

const get = (db: Database, sql: string): Promise<any> =>
  new Promise((resolve) =>
    db.all(sql, (_, rows: IdObj<any>[]) =>
      resolve(
        arrayMap(rows, (row: IdObj<any>) => objMap(row, (value) => value)),
      ),
    ),
  );

const ensureTable = async (db: Database): Promise<void> =>
  await run(db, 'CREATE TABLE IF NOT EXISTS tinybase(json);');

export const createSqlite3Persister = ((
  store: Store,
  db: Database,
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

  const addPersisterListener = (listener: PersisterListener): (() => void) => {
    const observer = () => listener();
    db.on('change', observer);
    return observer;
  };

  const delPersisterListener = (observer: () => void): any =>
    db.off('change', observer);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
}) as typeof createSqlite3PersisterDecl;
