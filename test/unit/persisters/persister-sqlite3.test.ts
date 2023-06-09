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

const get = (sql: string, args: any[] = []): Promise<{[id: string]: any}[]> =>
  new Promise((resolve) =>
    db.all(sql, args, (_, rows: {[id: string]: any}[]) => resolve(rows)),
  );

const getDatabaseDump = async (): Promise<Dump> =>
  await Promise.all(
    (
      await get('SELECT * FROM sqlite_schema')
    ).map(async (table: any) => [
      table.sql,
      await get('SELECT * FROM ' + table.name),
    ]),
  );

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
    expect(await getDatabaseDump()).toMatchSnapshot();
  });

  test('tables', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.save();
    expect(await getDatabaseDump()).toMatchSnapshot();
  });

  test('values', async () => {
    store.setValues({v1: 1});
    await persister.save();
    expect(await getDatabaseDump()).toMatchSnapshot();
  });

  test('both', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.save();
    expect(await getDatabaseDump()).toMatchSnapshot();
  });
});
