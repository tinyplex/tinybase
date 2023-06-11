/* eslint-disable max-len */
import {Persister, Store, createStore} from 'tinybase/debug';
import {mkdirSync, unlinkSync} from 'fs';
import sqlite3, {Database} from 'sqlite3';
import {createSqlite3Persister} from 'tinybase/debug/persisters/persister-sqlite3';
import {dirname} from 'path';
import {getDatabaseFunctions} from './sqlite';

const TEST_FILE = 'tmp/test.sqlite3';

const [getDatabase, setDatabase] = getDatabaseFunctions(
  (
    db: Database,
    sql: string,
    args: any[] = [],
  ): Promise<{[id: string]: any}[]> =>
    new Promise((resolve) =>
      db.all(sql, args, (_, rows: {[id: string]: any}[]) => resolve(rows)),
    ),
);

let db: Database;
let store: Store;
let persister: Persister;

beforeEach(async () => {
  try {
    mkdirSync(dirname(TEST_FILE), {recursive: true});
    unlinkSync(TEST_FILE);
  } catch {}
  db = new sqlite3.Database(TEST_FILE);
  store = createStore();
});

afterEach(() => {
  db.close();
});

describe('Serialized', () => {
  beforeEach(async () => {
    persister = createSqlite3Persister(store, db);
  });

  describe('Custom table name', () => {
    test('as string', async () => {
      const persister = createSqlite3Persister(store, db, 'test');
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test',
          'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{},{}]'}],
        ],
      ]);
    });

    test('with spaces', async () => {
      const persister = createSqlite3Persister(store, db, 'test table');
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test table',
          'CREATE TABLE "test table"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{},{}]'}],
        ],
      ]);
    });

    test('with quote', async () => {
      const persister = createSqlite3Persister(store, db, 'test "table"');
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test "table"',
          'CREATE TABLE "test ""table"""("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{},{}]'}],
        ],
      ]);
    });

    test('as config', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: true,
        storeTable: 'test',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test',
          'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{},{}]'}],
        ],
      ]);
    });
  });

  describe('Save to empty database', () => {
    test('nothing', async () => {
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{},{}]'}],
        ],
      ]);
    });

    test('tables', async () => {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
        ],
      ]);
    });

    test('values', async () => {
      store.setValues({v1: 1});
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{},{"v1":1}]'}],
        ],
      ]);
    });

    test('both', async () => {
      store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
        ],
      ]);
    });
  });

  describe('Load from database', () => {
    test('nothing', async () => {
      await persister.load();
      expect(store.getContent()).toEqual([{}, {}]);
    });

    test('defaulted', async () => {
      await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    });

    test('broken', async () => {
      setDatabase(db, [
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{"t1": 1}]'}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{}, {}]);
    });

    test('broken, can default', async () => {
      setDatabase(db, [
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{"t1": }]'}],
        ],
      ]);
      await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    });

    test('tables', async () => {
      setDatabase(db, [
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{"t1": {"r1": {"c1": 1}}}, {}]'}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
    });

    test('values', async () => {
      setDatabase(db, [
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{}, {"v1": 1}]'}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{}, {v1: 1}]);
    });

    test('both', async () => {
      setDatabase(db, [
        [
          'tinybase',
          'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
          [{_id: '_', store: '[{"t1": {"r1": {"c1": 1}}}, {"v1": 1}]'}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    });
  });
});

describe('Non-serialized', () => {
  beforeEach(async () => {
    persister = createSqlite3Persister(store, db, {serialized: false});
  });

  describe('Custom row id column', () => {
    test('word', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: false,
        rowIdColumn: 'test',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("test" PRIMARY KEY ON CONFLICT REPLACE)',
          [{test: '_'}],
        ],
      ]);
    });

    test('with spaces', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: false,
        rowIdColumn: 'test table',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("test table" PRIMARY KEY ON CONFLICT REPLACE)',
          [{'test table': '_'}],
        ],
      ]);
    });

    test('with quote', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: false,
        rowIdColumn: 'test "table"',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("test ""table""" PRIMARY KEY ON CONFLICT REPLACE)',
          [{'test "table"': '_'}],
        ],
      ]);
    });
  });

  describe('Custom values table name', () => {
    test('word', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: false,
        valuesTable: 'test',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test',
          'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
          [{_id: '_'}],
        ],
      ]);
    });

    test('with spaces', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: false,
        valuesTable: 'test table',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test table',
          'CREATE TABLE "test table"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
          [{_id: '_'}],
        ],
      ]);
    });

    test('with quote', async () => {
      const persister = createSqlite3Persister(store, db, {
        serialized: false,
        valuesTable: 'test "table"',
      });
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'test "table"',
          'CREATE TABLE "test ""table"""("_id" PRIMARY KEY ON CONFLICT REPLACE)',
          [{_id: '_'}],
        ],
      ]);
    });
  });

  describe('Save to empty database', () => {
    test('nothing', async () => {
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
          [{_id: '_'}],
        ],
      ]);
    });

    test('tables', async () => {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          't1',
          'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
          [{_id: 'r1', c1: 1}],
        ],
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
          [{_id: '_'}],
        ],
      ]);
    });

    test('values', async () => {
      store.setValues({v1: 1});
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
          [{_id: '_', v1: 1}],
        ],
      ]);
    });

    test('both', async () => {
      store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      await persister.save();
      expect(await getDatabase(db)).toEqual([
        [
          't1',
          'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
          [{_id: 'r1', c1: 1}],
        ],
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
          [{_id: '_', v1: 1}],
        ],
      ]);
    });
  });

  describe('Load from database', () => {
    test('nothing', async () => {
      await persister.load();
      expect(store.getContent()).toEqual([{}, {}]);
    });

    test('defaulted', async () => {
      await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    });

    test('broken', async () => {
      setDatabase(db, [
        [
          't1',
          'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
          [{di: 'r1', c1: 1}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{}, {}]);
    });

    test('broken, can default', async () => {
      setDatabase(db, [
        [
          't1',
          'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
          [{di: 'r1', c1: 1}],
        ],
      ]);
      await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    });

    test('tables', async () => {
      setDatabase(db, [
        [
          't1',
          'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
          [{_id: 'r1', c1: 1}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
    });

    test('values', async () => {
      setDatabase(db, [
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
          [{_id: '_', v1: 1}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{}, {v1: 1}]);
    });

    test('both', async () => {
      setDatabase(db, [
        [
          't1',
          'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
          [{_id: 'r1', c1: 1}],
        ],
        [
          'tinybase_values',
          'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
          [{_id: '_', v1: 1}],
        ],
      ]);
      await persister.load();
      expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    });
  });
});
