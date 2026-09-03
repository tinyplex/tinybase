import {createMergeableStore, createStore} from 'tinybase';
import {createCustomMsSqlPersister, Persists} from 'tinybase/persisters';
import {expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';

const STORE_TABLE_NAME = 'tinybase';

type FakeMsSql = {
  commands: [sql: string, params: any[]][];
  executeCommand: (sql: string, params?: any[]) => Promise<any[]>;
  failWith: Error | null;
  hasTable: boolean;
  hasVersionColumn: boolean;
  store: string | null;
  version: number;
  sqlMatching: (pattern: RegExp) => string[];
};

// A deliberately literal-minded stand-in for SQL Server: it only answers a
// query if the SQL would really have worked, so invalid T-SQL shows up as a
// failing expectation rather than passing silently.
const getFakeMsSql = (): FakeMsSql => {
  const fake: FakeMsSql = {
    commands: [],
    failWith: null,
    hasTable: false,
    hasVersionColumn: false,
    store: null,
    version: 1,
    executeCommand: async (sql: string, params: any[] = []) => {
      fake.commands.push([sql, params]);
      if (fake.failWith) {
        throw fake.failWith;
      }
      if (sql.startsWith('SELECT c.TABLE_NAME')) {
        return fake.hasTable
          ? [
              {tn: STORE_TABLE_NAME, cn: '_id', uq: 1},
              {tn: STORE_TABLE_NAME, cn: 'store', uq: 0},
              // A rowversion column is only ever reported when the query has
              // not excluded it.
              ...(fake.hasVersionColumn &&
              !sql.includes(`c.DATA_TYPE<>'timestamp'`)
                ? [{tn: STORE_TABLE_NAME, cn: '_version', uq: 0}]
                : []),
            ]
          : [];
      }
      if (sql.startsWith('IF OBJECT_ID')) {
        if (fake.hasTable) {
          fake.hasVersionColumn = true;
        }
        return [];
      }
      if (sql.startsWith('SELECT CONVERT(bigint')) {
        if (!fake.hasTable) {
          throw new Error(`Invalid object name '${STORE_TABLE_NAME}'.`);
        }
        if (!fake.hasVersionColumn) {
          throw new Error(`Invalid column name '_version'.`);
        }
        return [{v: '' + fake.version}];
      }
      if (sql.startsWith('CREATE TABLE')) {
        fake.hasTable = true;
        return [];
      }
      if (sql.startsWith('MERGE INTO')) {
        fake.store = params[1];
        fake.version++;
        return [];
      }
      if (sql.startsWith('SELECT*FROM')) {
        return fake.store == null ? [] : [{_id: '_', store: fake.store}];
      }
      return [];
    },
    sqlMatching: (pattern: RegExp) =>
      fake.commands.map(([sql]) => sql).filter((sql) => pattern.test(sql)),
  };
  return fake;
};

const getPersister = (
  fake: FakeMsSql,
  store = createStore(),
  onIgnoredError?: (error: any) => void,
  autoLoadIntervalSeconds = 0.01,
) =>
  createCustomMsSqlPersister(
    store,
    {mode: 'json', storeTableName: STORE_TABLE_NAME, autoLoadIntervalSeconds},
    fake.executeCommand,
    undefined,
    onIgnoredError,
    () => {},
    Persists.StoreOrMergeableStore,
    fake,
    'getMsSql',
  );

// eslint-disable-next-line max-len
test('generates T-SQL rather than the shared PostgreSQL and SQLite spellings', async () => {
  const fake = getFakeMsSql();
  const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
  const persister = getPersister(fake, store);

  await persister.save();

  const sql = fake.commands.map(([oneSql]) => oneSql);
  // T-SQL has no boolean literal, and BEGIN and END are block delimiters.
  expect(sql).toContain('BEGIN TRANSACTION');
  expect(sql).toContain('COMMIT');
  expect(sql.join('\n')).not.toMatch(/\btrue\b/);
  expect(fake.sqlMatching(/^DELETE FROM/)[0]).toContain('WHERE(1=1)');
  // nvarchar(max) cannot be a primary key, so the row Id column is narrower.
  expect(fake.sqlMatching(/^CREATE TABLE/)[0]).toBe(
    'CREATE TABLE"tinybase"("_id"nvarchar(450) PRIMARY KEY,' +
      '"store"nvarchar(max));',
  );
  // There is no ON CONFLICT in SQL Server.
  expect(fake.sqlMatching(/^MERGE INTO/)[0]).toBe(
    'MERGE INTO"tinybase" WITH(HOLDLOCK)AS t USING(VALUES(@p1,@p2))' +
      'AS s("_id","store")ON t."_id"=s."_id" ' +
      'WHEN MATCHED THEN UPDATE SET t."store"=s."store" ' +
      'WHEN NOT MATCHED THEN INSERT("_id","store")' +
      'VALUES(s."_id",s."store");',
  );

  await persister.destroy();
});

test('round-trips a Store through the database', async () => {
  const fake = getFakeMsSql();
  const store = createStore()
    .setTables({pets: {fido: {species: 'dog'}}})
    .setValues({employees: 3});
  const persister = getPersister(fake, store);
  await persister.save();
  await persister.destroy();

  expect(fake.store).toBe(
    '[{"pets":{"fido":{"species":"dog"}}},{"employees":3}]',
  );

  const store2 = createStore();
  const persister2 = getPersister(fake, store2);
  await persister2.load();
  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  expect(store2.getValues()).toEqual({employees: 3});
  await persister2.destroy();
});

test('round-trips a MergeableStore through the database', async () => {
  const fake = getFakeMsSql();
  const store = createMergeableStore('s1').setTables({
    pets: {fido: {species: 'dog'}},
  });
  const persister = getPersister(fake, store);
  await persister.save();
  await persister.destroy();

  const store2 = createMergeableStore('s2');
  const persister2 = getPersister(fake, store2);
  await persister2.load();
  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  await persister2.destroy();
});

// eslint-disable-next-line max-len
test('hides the rowversion column from the shared schema handling', async () => {
  const fake = getFakeMsSql();
  const persister = getPersister(
    fake,
    createStore().setTables({pets: {fido: {species: 'dog'}}}),
  );

  // The column can only be added once a save has created the table.
  await persister.save();
  await persister.startAutoLoad();
  // A subsequent save is the risky one: the shared save path drops any column
  // it does not know about.
  expect(fake.hasVersionColumn).toBe(true);

  fake.commands.length = 0;
  await persister.save();
  expect(fake.sqlMatching(/^SELECT c\.TABLE_NAME/)[0]).toContain(
    `c.DATA_TYPE<>'timestamp'`,
  );
  expect(fake.sqlMatching(/DROP COLUMN/)).toEqual([]);

  await persister.destroy();
});

test('adds the rowversion column once the table exists', async () => {
  const fake = getFakeMsSql();
  const persister = getPersister(fake, createStore());

  // Nothing to add to yet, and the probe cannot work.
  await persister.startAutoLoad();
  expect(fake.hasVersionColumn).toBe(false);
  expect(fake.sqlMatching(/^IF OBJECT_ID/).length).toBeGreaterThan(0);

  // Once a save has created the table, the probe recovers by itself.
  fake.hasTable = true;
  await pause(50);
  expect(fake.hasVersionColumn).toBe(true);

  await persister.destroy();
});

test('auto-loads when another writer changes the rowversion', async () => {
  const fake = getFakeMsSql();
  fake.hasTable = true;
  fake.hasVersionColumn = true;
  fake.store = '[{"pets":{"fido":{"species":"dog"}}},{}]';
  const store = createStore();
  const persister = getPersister(fake, store);

  await persister.startAutoLoad();
  expect(store.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

  // A change from outside of TinyBase bumps the rowversion.
  fake.store = '[{"pets":{"felix":{"species":"cat"}}},{}]';
  fake.version++;
  await pause(100);
  expect(store.getTables()).toEqual({pets: {felix: {species: 'cat'}}});

  await persister.destroy();
});

test('does not load again while the rowversion is unchanged', async () => {
  const fake = getFakeMsSql();
  fake.hasTable = true;
  fake.hasVersionColumn = true;
  fake.store = '[{"pets":{"fido":{"species":"dog"}}},{}]';
  const persister = getPersister(fake, createStore());

  await persister.startAutoLoad();
  fake.commands.length = 0;
  await pause(100);

  // The version is polled, but nothing is read back.
  expect(fake.sqlMatching(/^SELECT CONVERT\(bigint/).length).toBeGreaterThan(0);
  expect(fake.sqlMatching(/^SELECT\*FROM/)).toEqual([]);

  await persister.destroy();
});

test('stops polling once destroyed', async () => {
  const fake = getFakeMsSql();
  fake.hasTable = true;
  fake.hasVersionColumn = true;
  fake.store = '[{},{}]';
  const persister = getPersister(fake, createStore());

  await persister.startAutoLoad();
  await persister.destroy();

  fake.commands.length = 0;
  await pause(100);
  expect(fake.commands).toEqual([]);
});

test('contains errors raised while polling', async () => {
  const fake = getFakeMsSql();
  fake.hasTable = true;
  fake.hasVersionColumn = true;
  fake.store = '[{},{}]';
  const ignoredError = vi.fn();
  const persister = getPersister(fake, createStore(), ignoredError);

  await persister.startAutoLoad();
  ignoredError.mockClear();

  fake.failWith = new Error('database is gone');
  await pause(100);
  expect(ignoredError).toHaveBeenCalled();

  fake.failWith = null;
  await persister.destroy();
});

test('rejects tabular mode, which is not yet supported', async () => {
  const fake = getFakeMsSql();

  expect(() =>
    createCustomMsSqlPersister(
      createStore(),
      {mode: 'tabular'},
      fake.executeCommand,
      undefined,
      undefined,
      () => {},
      Persists.StoreOnly,
      fake,
      'getMsSql',
    ),
  ).toThrow('tinybase:0');

  expect(() =>
    createCustomMsSqlPersister(
      createMergeableStore(),
      {mode: 'tabular'},
      fake.executeCommand,
      undefined,
      undefined,
      () => {},
      Persists.StoreOrMergeableStore,
      fake,
      'getMsSql',
    ),
  ).toThrow('tinybase:0');
});

test('returns the thing it was given', async () => {
  const fake = getFakeMsSql();
  const persister = getPersister(fake, createStore());
  expect((persister as any).getMsSql()).toBe(fake);
  await persister.destroy();
});
