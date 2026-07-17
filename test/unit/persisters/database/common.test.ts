import sqlite3 from 'sqlite3';
import {createMergeableStore, createStore} from 'tinybase';
import {createCustomSqlitePersister, Persists} from 'tinybase/persisters';
import {createSqlite3Persister} from 'tinybase/persisters/persister-sqlite3';
import {afterEach, expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';

afterEach(() => vi.useRealTimers());

test('replaces every table name placeholder', async () => {
  const db = new sqlite3.Database(':memory:');
  await new Promise<void>((resolve, reject) =>
    db.exec(
      'CREATE TABLE pets (id TEXT PRIMARY KEY, species TEXT);' +
        `INSERT INTO pets VALUES ('fido', 'dog'), ('felix', 'cat');`,
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
          condition: `$tableName.species = 'dog' OR $tableName.species = 'cat'`,
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
      `SELECT name FROM sqlite_master WHERE type='table'AND name='tinybase'`,
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

test('serializes and drains SQLite auto-load polling', async () => {
  vi.useFakeTimers();
  let changeListener!: (tableName: string) => void;
  let resolveBaseline!: (rows: any[]) => void;
  let resolvePoll!: (rows: any[]) => void;
  let resolvePollStarted!: () => void;
  let resolveRegistered!: () => void;
  let resolveDelete!: () => void;
  let resolveDeleteStarted!: () => void;
  let slowPoll = false;
  let versionChecks = 0;
  const baseline = new Promise<any[]>((resolve) => (resolveBaseline = resolve));
  const poll = new Promise<any[]>((resolve) => (resolvePoll = resolve));
  const pollStarted = new Promise<void>(
    (resolve) => (resolvePollStarted = resolve),
  );
  const registered = new Promise<void>(
    (resolve) => (resolveRegistered = resolve),
  );
  const deleting = new Promise<void>((resolve) => (resolveDelete = resolve));
  const deleteStarted = new Promise<void>(
    (resolve) => (resolveDeleteStarted = resolve),
  );
  const delChangeListener = vi.fn(() => {
    resolveDeleteStarted();
    return deleting;
  });
  const persister = createCustomSqlitePersister(
    createStore(),
    {mode: 'json', autoLoadIntervalSeconds: 0.01},
    async (sql) => {
      if (sql.includes('data_version')) {
        versionChecks++;
        if (versionChecks == 1) {
          return await baseline;
        }
        if (slowPoll) {
          resolvePollStarted();
          return await poll;
        }
        return [{d: 1, s: 1, c: 0}];
      }
      return sql.includes('pragma_table')
        ? [
            {tn: 'tinybase', cn: '_id'},
            {tn: 'tinybase', cn: 'store'},
          ]
        : sql.startsWith('SELECT*')
          ? [{_id: '_', store: '[{}, {"species":"dog"}]'}]
          : [];
    },
    (listener) => {
      changeListener = listener;
      resolveRegistered();
      return 0;
    },
    delChangeListener,
    undefined,
    undefined,
    () => {},
    Persists.StoreOnly,
    {},
  );
  const starting = persister.startAutoLoad();
  await registered;
  changeListener('tinybase');
  resolveBaseline([{d: 1, s: 1, c: 0}]);
  await starting;

  expect(vi.getTimerCount()).toBe(1);
  const loads = persister.getStats().loads;
  slowPoll = true;
  vi.advanceTimersByTime(10);
  await pollStarted;
  vi.advanceTimersByTime(100);

  expect(versionChecks).toBe(4);
  let destroyed = false;
  const destroying = persister.destroy().then(() => (destroyed = true));
  await Promise.resolve();
  expect(destroyed).toBe(false);

  resolvePoll([{d: 2, s: 1, c: 0}]);
  await deleteStarted;
  expect(destroyed).toBe(false);
  resolveDelete();
  await destroying;

  expect(persister.getStats().loads).toBe(loads);
  expect(vi.getTimerCount()).toBe(0);
  expect(delChangeListener).toHaveBeenCalledWith(0);
});

test('preserves the SQLite baseline across native reloads', async () => {
  vi.useFakeTimers();
  let changeListener!: (tableName: string) => void;
  let content = '[{}, {"species":"dog"}]';
  let dataVersion = 1;
  let injectExternalChange = false;
  let resolveNativeLoad!: () => void;
  let resolveExternalLoad!: () => void;
  const nativeLoad = new Promise<void>(
    (resolve) => (resolveNativeLoad = resolve),
  );
  const externalLoad = new Promise<void>(
    (resolve) => (resolveExternalLoad = resolve),
  );
  const store = createStore();
  const persister = createCustomSqlitePersister(
    store,
    {mode: 'json', autoLoadIntervalSeconds: 0.01},
    async (sql) => {
      if (sql.includes('data_version')) {
        return [{d: dataVersion, s: 1, c: 0}];
      }
      if (sql.includes('pragma_table')) {
        return [
          {tn: 'tinybase', cn: '_id'},
          {tn: 'tinybase', cn: 'store'},
        ];
      }
      if (sql.startsWith('SELECT*')) {
        const loadedContent = content;
        if (injectExternalChange) {
          injectExternalChange = false;
          content = '[{}, {"species":"bird"}]';
          dataVersion++;
          resolveNativeLoad();
        } else if (loadedContent.includes('bird')) {
          resolveExternalLoad();
        }
        return [{_id: '_', store: loadedContent}];
      }
      return [];
    },
    (listener) => (changeListener = listener),
    () => {},
    undefined,
    undefined,
    () => {},
    Persists.StoreOnly,
    {},
  );
  await persister.startAutoLoad();

  content = '[{}, {"species":"cat"}]';
  dataVersion++;
  injectExternalChange = true;
  changeListener('tinybase');
  await nativeLoad;
  await externalLoad;
  for (let turn = 0; turn < 10; turn++) {
    await Promise.resolve();
  }

  expect(store.getValue('species')).toBe('bird');
  await persister.destroy();
});

test('reports SQLite auto-load polling errors', async () => {
  vi.useFakeTimers();
  let fail = false;
  let resolveErrorReported!: () => void;
  const errorReported = new Promise<void>(
    (resolve) => (resolveErrorReported = resolve),
  );
  const ignoredError = vi.fn((_error: Error) => resolveErrorReported());
  const persister = createCustomSqlitePersister(
    createStore(),
    {mode: 'json', autoLoadIntervalSeconds: 0.01},
    async (sql) => {
      if (sql.includes('data_version')) {
        if (fail) {
          throw new Error('poll failed');
        }
        return [{d: 1, s: 1, c: 0}];
      }
      return sql.includes('pragma_table')
        ? [
            {tn: 'tinybase', cn: '_id'},
            {tn: 'tinybase', cn: 'store'},
          ]
        : sql.startsWith('SELECT*')
          ? [{_id: '_', store: '[{},{}]'}]
          : [];
    },
    () => undefined,
    () => {},
    undefined,
    ignoredError,
    () => {},
    Persists.StoreOnly,
    {},
  );
  await persister.startAutoLoad();
  fail = true;
  vi.advanceTimersByTime(10);
  await errorReported;

  expect(ignoredError.mock.calls[0][0].message).toBe('poll failed');
  await persister.destroy();
});

test('contains SQLite ignored-error handler failures', async () => {
  vi.useFakeTimers();
  let fail = false;
  let resolveErrorReported!: () => void;
  const errorReported = new Promise<void>(
    (resolve) => (resolveErrorReported = resolve),
  );
  const ignoredError = vi.fn(() => {
    resolveErrorReported();
    throw new Error('ignored-error handler failed');
  });
  const persister = createCustomSqlitePersister(
    createStore(),
    {mode: 'json', autoLoadIntervalSeconds: 0.01},
    async (sql) => {
      if (sql.includes('data_version')) {
        if (fail) {
          throw new Error('poll failed');
        }
        return [{d: 1, s: 1, c: 0}];
      }
      return sql.includes('pragma_table')
        ? [
            {tn: 'tinybase', cn: '_id'},
            {tn: 'tinybase', cn: 'store'},
          ]
        : sql.startsWith('SELECT*')
          ? [{_id: '_', store: '[{},{}]'}]
          : [];
    },
    () => undefined,
    () => {},
    undefined,
    ignoredError,
    () => {},
    Persists.StoreOnly,
    {},
  );
  await persister.startAutoLoad();

  fail = true;
  vi.advanceTimersByTime(10);
  await errorReported;
  expect(ignoredError).toHaveBeenCalledOnce();

  fail = false;
  await persister.destroy();
});

test('adds collision-safe unique row ID indexes', async () => {
  const db = new sqlite3.Database(':memory:');
  await new Promise<void>((resolve, reject) =>
    db.exec(
      'CREATE TABLE pets (id TEXT, species TEXT);' +
        'CREATE TABLE owners (id TEXT, name TEXT);',
      (error) => (error ? reject(error) : resolve()),
    ),
  );
  const store = createStore()
    .setTable('pets', {fido: {species: 'dog'}})
    .setTable('owners', {alice: {name: 'Alice'}});
  const persister = createSqlite3Persister(store, db, {
    mode: 'tabular',
    tables: {
      save: {
        pets: {tableName: 'pets', rowIdColumnName: 'id'},
        owners: {tableName: 'owners', rowIdColumnName: 'id'},
      },
    },
  });
  await persister.save();

  const indexes = await new Promise<{name: string}[]>((resolve, reject) =>
    db.all(
      `SELECT name FROM sqlite_master WHERE type='index'AND sql IS NOT NULL`,
      (error, rows: {name: string}[]) =>
        error ? reject(error) : resolve(rows),
    ),
  );
  expect(indexes).toHaveLength(2);
  expect(new Set(indexes.map(({name}) => name)).size).toBe(2);
  expect(indexes.every(({name}) => name.startsWith('tinybase_pk_'))).toBe(true);
  expect(store.getTables()).toEqual({
    pets: {fido: {species: 'dog'}},
    owners: {alice: {name: 'Alice'}},
  });
  await persister.destroy();
  db.close();
});

test('rejects tabular persistence for MergeableStore', () => {
  expect(() =>
    createCustomSqlitePersister(
      createMergeableStore(),
      {mode: 'tabular'},
      async () => [],
      () => undefined,
      () => {},
      undefined,
      undefined,
      () => {},
      Persists.StoreOrMergeableStore,
      {},
    ),
  ).toThrow('tinybase:0');
});
