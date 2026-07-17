import {createRequire} from 'module';
import {createMergeableStore} from 'tinybase';
import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {getTimeFunctions} from '../common/mergeable.ts';

const [reset, getNow, pause] = getTimeFunctions();
const Database = createRequire(import.meta.url)('better-sqlite3');

let db: any;
let sqlCommands: string[];

const createSqlStorage = (): SqlStorage =>
  ({
    exec: (sql: string, ...params: any[]) => {
      sqlCommands.push(sql);
      if (!params.length && sql.trim().includes(';')) {
        db.exec(sql);
        return {toArray: () => []};
      }
      const statement = db.prepare(sql);
      if (statement.reader) {
        return {toArray: () => statement.all(...params)};
      }
      statement.run(...params);
      return {toArray: () => []};
    },
  }) as any;

const getTableRows = () => db.prepare('SELECT * FROM tinybase_tables').all();

const getRowRecord = () =>
  db
    .prepare(
      'SELECT * FROM tinybase_tables WHERE table_id = ? AND row_id = ? ' +
        'AND cell_id IS NULL',
    )
    .get('pets', 'fido');

beforeEach(() => {
  reset();
  db = new Database(':memory:');
  sqlCommands = [];
});

afterEach(() => {
  db.close();
});

test('fragmented mode stores table rows as rows, not cells', async () => {
  const row = Object.fromEntries(
    Array.from({length: 20}, (_, index) => ['cell' + index, index]),
  );
  const store = createMergeableStore('s1', getNow);
  const sqlStorage = createSqlStorage();
  const persister = createDurableObjectSqlStoragePersister(store, sqlStorage, {
    mode: 'fragmented',
  });

  store.setRow('pets', 'fido', row);
  await persister.save();

  expect(
    getTableRows().filter(
      (row: any) =>
        row.table_id == 'pets' && row.row_id == 'fido' && row.cell_id != null,
    ),
  ).toEqual([]);
  expect(Object.keys(JSON.parse(getRowRecord().value_data)[0])).toHaveLength(
    20,
  );
  expect(
    sqlCommands.filter((sql) => sql.startsWith('INSERT INTO tinybase_tables')),
  ).toHaveLength(3);

  const store2 = createMergeableStore('s2', getNow);
  const persister2 = createDurableObjectSqlStoragePersister(
    store2,
    sqlStorage,
    {mode: 'fragmented'},
  );
  await persister2.load();
  expect(store2.getTables()).toEqual({pets: {fido: row}});

  await persister.destroy();
  await persister2.destroy();
});

test('fragmented mode autosaves full changed row records', async () => {
  const store = createMergeableStore('s1', getNow);
  const sqlStorage = createSqlStorage();
  const persister = createDurableObjectSqlStoragePersister(store, sqlStorage, {
    mode: 'fragmented',
  });

  store.setRow('pets', 'fido', {species: 'dog', color: 'brown'});
  await persister.startAutoSave();
  store.delCell('pets', 'fido', 'color');
  await pause();

  const store2 = createMergeableStore('s2', getNow);
  const persister2 = createDurableObjectSqlStoragePersister(
    store2,
    sqlStorage,
    {mode: 'fragmented'},
  );
  await persister2.load();
  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

  await persister.destroy();
  await persister2.destroy();
});

test('fragmented mode loads and cleans up legacy cell rows', async () => {
  const store = createMergeableStore('s1', getNow);
  const sqlStorage = createSqlStorage();
  const persister = createDurableObjectSqlStoragePersister(store, sqlStorage, {
    mode: 'fragmented',
  });
  const insertSql =
    'INSERT INTO tinybase_tables ' +
    '(type, table_id, row_id, cell_id, value_data, timestamp, hash) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?)';

  db.prepare(insertSql).run('t', 'pets', 'fido', null, '[0]', '', 1);
  db.prepare(insertSql).run('t', 'pets', 'fido', 'species', '["dog"]', '', 2);
  db.prepare(insertSql).run('t', 'pets', 'fido', 'color', '["brown"]', '', 3);

  await persister.load();
  expect(store.getTables()).toEqual({
    pets: {fido: {species: 'dog', color: 'brown'}},
  });

  store.setCell('pets', 'fido', 'color', 'black');
  await persister.save();
  expect(
    getTableRows().filter(
      (row: any) =>
        row.table_id == 'pets' && row.row_id == 'fido' && row.cell_id != null,
    ),
  ).toEqual([]);

  await persister.destroy();
});

test('fragmented mode preserves empty string identifiers', async () => {
  const sqlStorage = createSqlStorage();
  const store1 = createMergeableStore('s1', getNow)
    .setCell('', '', '', 'cell')
    .setValue('', 'value');
  const persister1 = createDurableObjectSqlStoragePersister(
    store1,
    sqlStorage,
    {mode: 'fragmented'},
  );
  await persister1.save();

  const store2 = createMergeableStore('s2', getNow);
  const persister2 = createDurableObjectSqlStoragePersister(
    store2,
    sqlStorage,
    {mode: 'fragmented'},
  );
  await persister2.load();

  expect(store2.getContent()).toEqual([
    {'': {'': {'': 'cell'}}},
    {'': 'value'},
  ]);
  await persister1.destroy();
  await persister2.destroy();
});

test('fragmented mode escapes unsafe storage prefixes', async () => {
  db.exec('CREATE TABLE protected (id INTEGER)');
  db.prepare('INSERT INTO protected VALUES (?)').run(1);

  const sqlStorage = createSqlStorage();
  const storagePrefix = '123_"; DROP TABLE protected; --';
  const store1 = createMergeableStore('s1', getNow)
    .setCell('pets', 'fido', 'species', 'dog')
    .setValue('open', true);
  const persister1 = createDurableObjectSqlStoragePersister(
    store1,
    sqlStorage,
    {mode: 'fragmented', storagePrefix},
  );
  await persister1.save();

  const store2 = createMergeableStore('s2', getNow);
  const persister2 = createDurableObjectSqlStoragePersister(
    store2,
    sqlStorage,
    {mode: 'fragmented', storagePrefix},
  );
  await persister2.load();

  expect(store2.getContent()).toEqual([
    {pets: {fido: {species: 'dog'}}},
    {open: true},
  ]);
  expect(db.prepare('SELECT * FROM protected').all()).toEqual([{id: 1}]);
  expect(
    sqlCommands.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS "123_')),
  ).toBe(true);

  await persister1.destroy();
  await persister2.destroy();
});
