# Database Persistence

Since v4.0, there are various options for persisting Store data to and from
SQLite databases, via a range of third-party modules.

There are currently eight SQLite-based persistence options:

| Module                     | Function                      | Storage                                                                                                     |
| -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| persister-sqlite3          | createSqlite3Persister        | SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)                                     |
| persister-sqlite-wasm      | createSqliteWasmPersister     | SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)                              |
| persister-cr-sqlite-wasm   | createCrSqliteWasmPersister   | SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)                                    |
| persister-expo-sqlite      | createExpoSqlitePersister     | SQLite in React Native, via [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite)      |
| persister-expo-sqlite-next | createExpoSqliteNextPersister | SQLite in React Native, via [expo-sqlite/next](https://github.com/expo/expo/tree/main/packages/expo-sqlite) |
| persister-electric-sql     | createElectricSqlPersister    | Electric SQL, via [electric](https://github.com/electric-sql/electric)                                      |
| persister-libsql           | createLibSqlPersister         | LibSQL for Turso, via [libsql-client](https://github.com/tursodatabase/libsql-client-ts)                    |
| persister-powersync        | createPowerSyncPersister      | PowerSync, via [powersync-sdk](https://github.com/powersync-ja/powersync-js)                                |

(Take a look at the
[vite-tinybase-ts-react-crsqlite](https://github.com/tinyplex/vite-tinybase-ts-react-crsqlite)
template, for example, which demonstrates Vulcan's cr-sqlite to provide
persistence and synchronization via the third of these.)

Each creation function takes a database reference, and a DatabasePersisterConfig
object to describe its configuration. There are two modes for persisting a Store
with a database:

- A JSON serialization of the whole Store, which is stored in a single row of
  a table (normally called `tinybase`) within the database. This is
  configured by providing a DpcJson object.
- A tabular mapping of Table Ids to database table names (and vice-versa).
  Values are stored in a separate special table (normally called
  `tinybase_values`). This is configured by providing a DpcTabular object.

Note that changes made to the database (outside of a Persister) are picked up
immediately if they are made via the same connection or library that it is
using. If the database is being changed by another client, the Persister needs
to poll for changes. Hence both configuration types also contain an
`autoLoadIntervalSeconds` property which indicates how often it should do that.
This defaults to 1 second.

## Using JSON Serialization

To get started, we'll use JSON serialization to save a Store to SQLite in the
browser, via the [sqlite-wasm](https://github.com/tomayac/sqlite-wasm) module.

Firstly, use the module to initiate a database. Here it will be created in
memory, but typically you would use the origin private file system (OPFS) as a
storage back-end.

```js
import {createSqliteWasmPersister} from 'tinybase/persisters/persister-sqlite-wasm';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const sqlite3 = await sqlite3InitModule();
let db = new sqlite3.oo1.DB(':memory:', 'c');
```

Next create a simple Store with a small amount of data:

```js
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
```

The Persister itself is created with the createSqliteWasmPersister method. This
requires a reference to the the `sqlite3` module itself and the database. We're
not providing any configuration so it will use JSON serialization into the
default table (namely one called `tinybase`).

```js
const jsonPersister = createSqliteWasmPersister(store, sqlite3, db);
```

Now we can use the Persister to save data to the Store. Of course you can also
use the startAutoSave method to make it automatic.

```js
await jsonPersister.save();
```

And we can check the database to ensure the data has been stored:

```js
console.log(db.exec('SELECT * FROM tinybase;', {rowMode: 'object'}));
// -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
```

If the data in the database is changed...

```js
db.exec(
  'UPDATE tinybase SET store = ' +
    `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
);
```

...it can be picked up by loading it explicitly or with auto-loading:

```js
await jsonPersister.load();
console.log(store.getTables());
// -> {pets: {felix: {species: 'cat'}}}

jsonPersister.destroy();
```

Please see the DpcJson documentation for more detail on configuring this type of
persistence.

## Using Tabular Mapping

More flexibly, you can map distinct Store Tables to database tables and back
again. This is likely a more suitable approach if you are binding TinyBase to
existing data.

To use this technique, you must provide a DatabasePersisterConfig object when
you create the Persister, and specify how you would like Store Tables (and
Values) to correspond to tables in the database.

It is important to note that both the tabular mapping in ('save') and out
('load') of an underlying database are disabled by default. This is to ensure
that if you pass in an existing populated database you don't run the immediate
risk of corrupting or losing all your data.

This configuration therefore takes a `tables` property object (with child `load`
and `save` property objects) and a `values` property object. One of these at
least is required for the Persister to do anything!

Let's demonstrate. We start by creating a new database and resetting the data in
the Store to put into it:

```js
db = new sqlite3.oo1.DB(':memory:', 'c');
store.setTables({
  pets: {felix: {species: 'cat'}, fido: {species: 'dog'}},
  species: {dog: {price: 5}, cat: {price: 4}},
});
```

The persister itself has a more complex configuration as described above:

```js
const tabularPersister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {
    save: {pets: 'pets', species: 'animal_species'},
    load: {pets: 'pets', animal_species: 'species'},
  },
});
```

Notice how there is a symmetric mapping of Store Table to database table and
vice-versa. It is deliberate that this must be spelled out like this, so that
your intent to connect to (or especially mutate) existing data is very explicit.

Again, we can save the Store...

```js
await tabularPersister.save();
```

...and see the resulting data in the SQLite database:

```js
console.log(db.exec('SELECT * FROM pets;', {rowMode: 'object'}));
// -> [{_id: 'felix', species: 'cat'}, {_id: 'fido', species: 'dog'}]
console.log(db.exec('SELECT * FROM animal_species;', {rowMode: 'object'}));
// -> [{_id: 'dog', price: 5}, {_id: 'cat', price: 4}]
```

And, as expected, making a change to the database and re-loading brings the
changes back into the Store:

```js
db.exec(`INSERT INTO pets (_id, species) VALUES ('cujo', 'wolf')`);
await tabularPersister.load();
console.log(store.getTable('pets'));
// -> {felix: {species: 'cat'}, fido: {species: 'dog'}, cujo: {species: 'wolf'}}

tabularPersister.destroy();
```

Store Values are saved into a separate table, normally called `tinybase_values`.
See the DpcTabularValues documentation for examples of how to use that.

## Working With An Existing Database

In theory, it's possible to bind TinyBase to a SQLite database that already
exists. You will obviously want to list the tables of interest in the `load`
section of the configuration.

Do be aware that TinyBase is an in-memory data structure, and so you will not
want to do this if your database tables are particularly large and complex.

Also be very careful when setting the `save` configuration, since it will mean that
TinyBase writes its version of the data back to the database (optionally
removing empty columns). If there is data that does not survive the round trip
(because of schema constraints or data typing), it will be lost.

The Persister maps a column in the database table to provide and store the Store
Table's Row Ids. By default, this is a database column called `_id`, but you can
set it to be something else, per table. It is required that this column is a
primary or unique key in the database so that the Persister knows how to update
existing records.

So for example, imagine your existing database table looks like this, with the
first column of each table being a primary key:

```
> SELECT * FROM the_pets_table;
+--------+---------+-------+
| pet_id | species | color |
+--------+---------+-------+
| fido   | dog     | brown |
| felix  | cat     | black |
+--------+---------+-------+

> SELECT * FROM the_species_table;
+------------+-------+
| species_id | price |
+------------+-------+
| dog        | 5     |
| cat        | 4     |
+------------+-------+
```

For this, you may consider the following configuration for your Persister:

```js
const databasePersisterConfig: DatabasePersisterConfig = {
  mode: 'tabular',
  tables: {
    load: {
      the_pets_table: {tableId: 'pets', rowIdColumnName: 'pet_id'},
      the_species_table: {tableId: 'species', rowIdColumnName: 'species_id'},
    },
    save: {
      pets: {tableId: 'the_pets_table', rowIdColumnName: 'pet_id'},
      species: {tableId: 'the_species_table', rowIdColumnName: 'species_id'},
    },
  },
};
```

This will load into a Store (and save back again) with Tables that look like
this:

```json
{
  "pets": {
    "fido": {"species": "dog", "color": "brown"},
    "felix": {"species": "cat", "color": "black"}
  },
  "species": {
    "dog": {"price": 5},
    "cat": {"price": 4}
  }
}
```

## Summary

With care, you can load and save Store data from and to a SQLite database in a
variety of ways and via different modules. This is new in v4.0, so feedback on
the functionality is welcomed!

Finally we move on to look at how to fully synchronize TinyBase Stores using
more complex CRDT frameworks, such as Yjs and Automerge, in the Synchronizing
Data guide.
