import {createMergeableStore, createStore} from 'tinybase';
import type {Persister} from 'tinybase/persisters';
import {createTinyJoinPersister} from 'tinybase/persisters/persister-tinyjoin';
import type {Client} from 'tinyjoin';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {getTinyJoinClient} from './common/tinyjoin.ts';

let tinyJoin: Client;
let closeTinyJoin: () => Promise<void>;
const persisters: Persister[] = [];

const rows = async (sql: string): Promise<any[]> =>
  (await tinyJoin.query(sql)).rows;

const track = <PersisterType extends Persister>(
  persister: PersisterType,
): PersisterType => {
  persisters.push(persister);
  return persister;
};

beforeEach(async () => {
  [tinyJoin, closeTinyJoin] = await getTinyJoinClient();
});

afterEach(async () => {
  await Promise.all(
    persisters.splice(0).map((persister) => persister.destroy()),
  );
  await closeTinyJoin();
});

describe('Json mode', () => {
  test('gets the client back', () => {
    const persister = track(
      createTinyJoinPersister(createStore(), tinyJoin, 'my_tinybase'),
    );
    expect(persister.getTinyJoin()).toBe(tinyJoin);
  });

  test('creates the table and saves', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.save();
    expect(await rows('SELECT * FROM my_tinybase')).toEqual([
      {_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'},
    ]);
  });

  test('saves again over an existing row', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.save();
    store.setCell('pets', 'fido', 'species', 'wolf');
    await persister.save();
    expect(await rows('SELECT * FROM my_tinybase')).toEqual([
      {_id: '_', store: '[{"pets":{"fido":{"species":"wolf"}}},{}]'},
    ]);
  });

  test('loads a change made to the database', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.save();
    await tinyJoin.query('UPDATE my_tinybase SET store = $1 WHERE _id = $2', [
      '[{"pets":{"felix":{"species":"cat"}}},{}]',
      '_',
    ]);
    await persister.load();
    expect(store.getTables()).toEqual({pets: {felix: {species: 'cat'}}});
  });

  test('saves an emptied store', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.save();
    store.delTables();
    await persister.save();
    expect(await rows('SELECT * FROM my_tinybase')).toEqual([
      {_id: '_', store: '[{},{}]'},
    ]);
  });

  test('auto loads from the database subscription', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.save();
    await persister.startAutoLoad();
    await tinyJoin.query('UPDATE my_tinybase SET store = $1 WHERE _id = $2', [
      '[{"pets":{"felix":{"species":"cat"}}},{}]',
      '_',
    ]);
    await vi.waitFor(() =>
      expect(store.getTables()).toEqual({pets: {felix: {species: 'cat'}}}),
    );
  });

  test('auto saves to the database', async () => {
    const store = createStore();
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.startAutoSave();
    store.setTables({pets: {fido: {species: 'dog'}}});
    await vi.waitFor(async () =>
      expect(await rows('SELECT * FROM my_tinybase')).toEqual([
        {_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'},
      ]),
    );
  });

  test('persists a MergeableStore', async () => {
    const store = createMergeableStore('s1');
    store.setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase'),
    );
    await persister.save();
    const store2 = createMergeableStore('s2');
    const persister2 = track(
      createTinyJoinPersister(store2, tinyJoin, 'my_tinybase'),
    );
    await persister2.load();
    expect(store2.getMergeableContent()).toEqual(store.getMergeableContent());
  });

  test('issues no redundant true predicate', async () => {
    const onSqlCommand = vi.fn();
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, 'my_tinybase', onSqlCommand),
    );
    await persister.save();
    await persister.load();
    const sqls = onSqlCommand.mock.calls.map(([sql]) => sql);
    expect(sqls).toContain('SELECT*FROM"my_tinybase"');
    expect(sqls.join('\n')).not.toContain('true');
  });
});

describe('Tabular mode', () => {
  const tabular = {
    mode: 'tabular' as const,
    tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
    values: {load: true, save: true},
  };

  test('saves and loads tables and values', async () => {
    const store = createStore()
      .setTables({pets: {fido: {species: 'dog'}}})
      .setValues({open: true});
    const persister = track(createTinyJoinPersister(store, tinyJoin, tabular));
    await persister.save();
    expect(await rows('SELECT * FROM pets')).toEqual([
      {_id: 'fido', species: '"dog"'},
    ]);
    expect(await rows('SELECT * FROM tinybase_values')).toEqual([
      {_id: '_', open: 'true'},
    ]);

    const store2 = createStore();
    const persister2 = track(
      createTinyJoinPersister(store2, tinyJoin, tabular),
    );
    await persister2.load();
    expect(store2.getContent()).toEqual([
      {pets: {fido: {species: 'dog'}}},
      {open: true},
    ]);
  });

  test('updates existing rows and inserts new ones', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(createTinyJoinPersister(store, tinyJoin, tabular));
    await persister.save();
    store.setCell('pets', 'fido', 'species', 'wolf');
    store.setCell('pets', 'felix', 'species', 'cat');
    await persister.save();
    expect(await rows('SELECT * FROM pets ORDER BY _id')).toEqual([
      {_id: 'felix', species: '"cat"'},
      {_id: 'fido', species: '"wolf"'},
    ]);
  });

  test('deletes rows that the store no longer has', async () => {
    const store = createStore().setTables({
      pets: {fido: {species: 'dog'}, felix: {species: 'cat'}},
    });
    const persister = track(createTinyJoinPersister(store, tinyJoin, tabular));
    await persister.save();
    store.delRow('pets', 'felix');
    await persister.save();
    expect(await rows('SELECT * FROM pets')).toEqual([
      {_id: 'fido', species: '"dog"'},
    ]);
  });

  test('adds a column to an existing table', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(createTinyJoinPersister(store, tinyJoin, tabular));
    await persister.save();
    store.setCell('pets', 'fido', 'legs', 4);
    await persister.save();
    expect(await rows('SELECT * FROM pets')).toEqual([
      {_id: 'fido', species: '"dog"', legs: '4'},
    ]);
  });

  test('loads a table that the database already had', async () => {
    await tinyJoin.exec(
      'CREATE TABLE pets ("_id" text PRIMARY KEY, species text);',
    );
    await tinyJoin.query('INSERT INTO pets ("_id", species) VALUES ($1, $2)', [
      'felix',
      '"cat"',
    ]);
    const store = createStore();
    const persister = track(createTinyJoinPersister(store, tinyJoin, tabular));
    await persister.load();
    expect(store.getTables()).toEqual({pets: {felix: {species: 'cat'}}});
  });

  test('drops a table that the store no longer has', async () => {
    const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
    const persister = track(
      createTinyJoinPersister(store, tinyJoin, {
        mode: 'tabular',
        tables: {
          load: {pets: 'pets'},
          save: {pets: {tableName: 'pets', deleteEmptyTable: true}},
        },
      }),
    );
    await persister.save();
    expect(await rows('SELECT * FROM pets')).toEqual([
      {_id: 'fido', species: '"dog"'},
    ]);
    store.delTable('pets');
    await persister.save();
    await expect(rows('SELECT * FROM pets')).rejects.toThrow();
  });

  test('refuses a MergeableStore', () => {
    expect(() =>
      createTinyJoinPersister(
        createMergeableStore('s1'),
        tinyJoin,
        tabular as any,
      ),
    ).toThrow();
  });
});
