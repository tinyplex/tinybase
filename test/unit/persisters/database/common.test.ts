import sqlite3 from 'sqlite3';
import {createStore} from 'tinybase';
import {createCustomSqlitePersister, Persists} from 'tinybase/persisters';
import {createSqlite3Persister} from 'tinybase/persisters/persister-sqlite3';
import {expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';

test('replaces every table name placeholder', async () => {
  const db = new sqlite3.Database(':memory:');
  await new Promise<void>((resolve, reject) =>
    db.exec(
      'CREATE TABLE pets (id TEXT PRIMARY KEY, species TEXT);' +
        "INSERT INTO pets VALUES ('fido', 'dog'), ('felix', 'cat');",
      (error) => (error ? reject(error) : resolve()),
    ),
  );
  const store = createStore();
  const persister = createSqlite3Persister(store, db, {
    mode: 'tabular',
    tables: {
      load: {
        pets: {
          tableId: 'pets',
          rowIdColumnName: 'id',
          condition:
            "$tableName.species = 'dog' OR $tableName.species = 'cat'",
        },
      },
    },
  });
  await persister.load();

  expect(store.getTable('pets')).toEqual({
    fido: {species: 'dog'},
    felix: {species: 'cat'},
  });
  await persister.destroy();
  db.close();
});

test('rolls back failed database transactions', async () => {
  const db = new sqlite3.Database(':memory:');
  const ignoredError = vi.fn();
  const executeCommand = async (
    sql: string,
    params: any[] = [],
  ): Promise<any[]> =>
    await new Promise((resolve, reject) =>
      db.all(sql, params, (error, rows) =>
        error ? reject(error) : resolve(rows),
      ),
    );
  const persister = createCustomSqlitePersister(
    createStore().setValue('species', 'dog'),
    undefined,
    async (sql, params) =>
      sql.startsWith('INSERT')
        ? Promise.reject(new Error('insert failed'))
        : executeCommand(sql, params),
    () => undefined,
    () => {},
    undefined,
    ignoredError,
    () => {},
    Persists.StoreOnly,
    db,
  );
  await persister.save();

  expect(
    await executeCommand(
      "SELECT name FROM sqlite_master WHERE type='table'AND name='tinybase'",
    ),
  ).toEqual([]);
  expect(ignoredError).toHaveBeenCalledOnce();
  expect(ignoredError.mock.calls[0][0].message).toBe('insert failed');
  await persister.destroy();
  db.close();
});

test('establishes the SQLite auto-load baseline before polling', async () => {
  let content = '[{},{"species":"dog"}]';
  let dataVersion = 1;
  const persister = createCustomSqlitePersister(
    createStore(),
    {mode: 'json', autoLoadIntervalSeconds: 0.01},
    async (sql) =>
      sql.includes('data_version')
        ? [{d: dataVersion, s: 1, c: 0}]
        : sql.includes('pragma_table')
          ? [
              {tn: 'tinybase', cn: '_id'},
              {tn: 'tinybase', cn: 'store'},
            ]
          : sql.startsWith('SELECT*')
            ? [{_id: '_', store: content}]
            : [],
    () => undefined,
    () => {},
    undefined,
    undefined,
    () => {},
    Persists.StoreOnly,
    {},
  );
  await persister.startAutoLoad();

  content = '[{},{"species":"cat"}]';
  dataVersion++;
  await pause(30);

  expect(persister.getStore().getValue('species')).toBe('cat');
  await persister.destroy();
});
