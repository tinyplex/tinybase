import sqlite3 from 'sqlite3';
import {createStore} from 'tinybase';
import {createSqlite3Persister} from 'tinybase/persisters/persister-sqlite3';
import {expect, test} from 'vitest';

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
