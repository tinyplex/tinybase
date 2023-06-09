import {Persister, Store, createStore} from 'tinybase/debug';
import {mkdirSync, unlinkSync} from 'fs';
import sqlite3, {Database} from 'sqlite3';
import {createSqlite3Persister} from 'tinybase/debug/persisters/persister-sqlite3';
import {dirname} from 'path';

type Dump = [create: string, rows: {[column: string]: any}[]][];

const TEST_FILE = 'tmp/test.sqlite3';

let db: Database;
let store: Store;
let persister: Persister;

const exec = (sql: string, args: any[] = []): Promise<void> =>
  new Promise((resolve) => db.run(sql, args, () => resolve()));

const get = (sql: string, args: any[] = []): Promise<{[id: string]: any}[]> =>
  new Promise((resolve) =>
    db.all(sql, args, (_, rows: {[id: string]: any}[]) => resolve(rows)),
  );

const getDatabase = async (): Promise<Dump> =>
  await Promise.all(
    (
      await get('SELECT * FROM sqlite_schema')
    ).map(async (table: any) => [
      table.sql,
      await get('SELECT * FROM ' + table.name),
    ]),
  );

const setDatabase = async (dump: Dump) =>
  dump.forEach(async ([create, rows]) => {
    await exec(create);
    await Promise.all(
      rows.map(
        async (row) =>
          await exec(
            'INSERT INTO tinybase(' +
              Object.keys(row).join(',') +
              ') VALUES (' +
              Object.keys(row)
                .map(() => '?')
                .join(',') +
              ')',
            Object.values(row),
          ),
      ),
    );
  });

beforeEach(async () => {
  try {
    mkdirSync(dirname(TEST_FILE), {recursive: true});
    unlinkSync(TEST_FILE);
  } catch {}
  db = new sqlite3.Database(TEST_FILE);
  store = createStore();
  persister = createSqlite3Persister(store, db);
});

afterEach(() => {
  db.close();
});

describe('Save to empty database', () => {
  test('nothing', async () => {
    await persister.save();
    expect(await getDatabase()).toMatchSnapshot();
  });

  test('tables', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.save();
    expect(await getDatabase()).toMatchSnapshot();
  });

  test('values', async () => {
    store.setValues({v1: 1});
    await persister.save();
    expect(await getDatabase()).toMatchSnapshot();
  });

  test('both', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.save();
    expect(await getDatabase()).toMatchSnapshot();
  });
});

describe('Load from doc', () => {
  test('nothing', async () => {
    await persister.load();
    expect(store.getContent()).toEqual([{}, {}]);
  });

  test('defaulted', async () => {
    await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('broken', async () => {
    setDatabase([['CREATE TABLE tinybase(json)', [{json: '[{"t1": 1}]'}]]]);
    await persister.load();
    expect(store.getContent()).toEqual([{}, {}]);
  });

  test('broken, can default', async () => {
    setDatabase([['CREATE TABLE tinybase(json)', [{json: '[{"t1": }]'}]]]);
    await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('tables', async () => {
    setDatabase([
      [
        'CREATE TABLE tinybase(json)',
        [{json: '[{"t1": {"r1": {"c1": 1}}}, {}]'}],
      ],
    ]);
    await persister.load();
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
  });

  test('values', async () => {
    setDatabase([['CREATE TABLE tinybase(json)', [{json: '[{}, {"v1": 1}]'}]]]);
    await persister.load();
    expect(store.getContent()).toEqual([{}, {v1: 1}]);
  });

  test('both', async () => {
    setDatabase([
      [
        'CREATE TABLE tinybase(json)',
        [{json: '[{"t1": {"r1": {"c1": 1}}}, {"v1": 1}]'}],
      ],
    ]);
    await persister.load();
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });
});
