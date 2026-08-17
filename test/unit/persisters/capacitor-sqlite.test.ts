import type {SQLiteDBConnection} from '@capacitor-community/sqlite';
import sqlite3 from 'sqlite3';
import {createMergeableStore, createStore} from 'tinybase';
import {createCapacitorSqlitePersister} from 'tinybase/persisters/persister-capacitor-sqlite';
import {expect, test, vi} from 'vitest';

// The plugin needs a native runtime, so stand its two SQL methods on an
// in-process SQLite database instead, and record how each one is used.
const createMockConnection = () => {
  const database = new sqlite3.Database(':memory:');
  const all = (sql: string, params: any[] = []): Promise<any[]> =>
    new Promise((resolve, reject) =>
      database.all(sql, params, (error, rows) =>
        error ? reject(error) : resolve(rows),
      ),
    );
  const queries: string[] = [];
  const runs: [sql: string, transaction: boolean | undefined][] = [];
  const db = {
    query: vi.fn(async (statement: string, values: any[] = []) => {
      queries.push(statement);
      return {values: await all(statement, values)};
    }),
    run: vi.fn(
      async (statement: string, values: any[] = [], transaction?: boolean) => {
        runs.push([statement, transaction]);
        await all(statement, values);
        return {changes: {changes: 0}};
      },
    ),
  } as any as SQLiteDBConnection;
  return {all, db, queries, runs};
};

test('saves and loads a Store', async () => {
  const {all, db} = createMockConnection();
  const persister = createCapacitorSqlitePersister(
    createStore().setTables({pets: {fido: {species: 'dog'}}}),
    db,
    'my_tinybase',
  );

  await persister.save();
  expect(await all('SELECT * FROM my_tinybase')).toEqual([
    {_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'},
  ]);

  const store2 = createStore();
  await createCapacitorSqlitePersister(store2, db, 'my_tinybase').load();
  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

  await persister.destroy();
});

test('sends reads to query and writes to run', async () => {
  const {db, queries, runs} = createMockConnection();
  const persister = createCapacitorSqlitePersister(
    createStore().setValue('species', 'dog'),
    db,
    'my_tinybase',
  );
  await persister.save();

  expect(queries.length).toBeGreaterThan(0);
  queries.forEach((sql) => expect(sql).toMatch(/^\s*(SELECT|PRAGMA)/i));
  expect(runs.length).toBeGreaterThan(0);
  runs.forEach(([sql]) => expect(sql).not.toMatch(/^\s*(SELECT|PRAGMA)/i));

  await persister.destroy();
});

test('leaves transactions to the Persister', async () => {
  const {db, runs} = createMockConnection();
  const persister = createCapacitorSqlitePersister(
    createStore().setValue('species', 'dog'),
    db,
    'my_tinybase',
  );
  await persister.save();

  // Every write opts out of the plugin's own per-statement transaction, so the
  // Persister's BEGIN and END are not nested inside one.
  runs.forEach(([, transaction]) => expect(transaction).toBe(false));
  const statements = runs.map(([sql]) => sql);
  expect(statements).toContain('BEGIN');
  expect(statements).toContain('END');
  expect(statements).not.toContain('ROLLBACK');

  await persister.destroy();
});

test('saves and loads a MergeableStore', async () => {
  const {db} = createMockConnection();
  const persister = createCapacitorSqlitePersister(
    createMergeableStore().setTables({pets: {fido: {species: 'dog'}}}),
    db,
    'my_tinybase',
  );
  await persister.save();

  const store2 = createMergeableStore();
  await createCapacitorSqlitePersister(store2, db, 'my_tinybase').load();

  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  await persister.destroy();
});

test('persists with tabular mapping', async () => {
  const {all, db} = createMockConnection();
  const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
  const persister = createCapacitorSqlitePersister(store, db, {
    mode: 'tabular',
    tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
  });

  await persister.save();
  expect(await all('SELECT * FROM pets')).toEqual([
    {_id: 'fido', species: 'dog'},
  ]);

  await all(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`);
  await persister.load();
  expect(store.getTables()).toEqual({
    pets: {fido: {species: 'dog'}, felix: {species: 'cat'}},
  });

  await persister.destroy();
});

test('returns the database connection', async () => {
  const {db} = createMockConnection();
  const persister = createCapacitorSqlitePersister(createStore(), db);

  expect(persister.getDb()).toBe(db);
  await persister.destroy();
});

test('reports errors from the plugin', async () => {
  const onIgnoredError = vi.fn();
  const db = {
    query: vi.fn(async () => {
      throw new Error('plugin failed');
    }),
    run: vi.fn(async () => ({changes: {changes: 0}})),
  } as any as SQLiteDBConnection;
  const store = createStore().setValue('species', 'dog');

  await createCapacitorSqlitePersister(
    store,
    db,
    'my_tinybase',
    undefined,
    onIgnoredError,
  ).load();

  expect(onIgnoredError).toHaveBeenCalled();
  expect(onIgnoredError.mock.calls[0][0].message).toBe('plugin failed');
  expect(store.getValues()).toEqual({species: 'dog'});
});
