# Persisting Data

The persister module lets you save and load Store data to and from different
locations, or underlying storage types.

This is useful for preserving Store data between browser sessions or reloads,
saving or loading browser state to or from a server, saving Store data to disk
in a environment with filesystem access, or, in v4.0 and above, to SQLite and
CRDT frameworks like [Yjs](https://yjs.dev/) and
[Automerge](https://automerge.org/).

## Types of Persisters

Several entry points are provided (in separately installed modules), each of
which returns a new Persister object that can load and save a Store. Between
them, these allow you to store your TinyBase data locally, remotely, to SQLite
databases, and across synchronization boundaries with CRDT frameworks.

| Module                    | Function                    | Storage                                                                                                |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| persister-browser         | createSessionPersister      | Browser session storage                                                                                |
| persister-browser         | createLocalPersister        | Browser local storage                                                                                  |
| persister-indexed-db      | createIndexedDbPersister    | Browser IndexedDB                                                                                      |
| persister-remote          | createRemotePersister       | Remote server                                                                                          |
| persister-file            | createFilePersister         | Local file (where possible)                                                                            |
| persister-partykit-client | createPartyKitPersister     | PartyKit with the persister-partykit-server module                                                     |
| persister-sqlite3         | createSqlite3Persister      | SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)                                |
| persister-sqlite-wasm     | createSqliteWasmPersister   | SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)                         |
| persister-cr-sqlite-wasm  | createCrSqliteWasmPersister | SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)                               |
| persister-expo-sqlite     | createExpoSqlitePersister   | SQLite in React Native, via [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite) |
| persister-electric-sql    | createElectricSqlPersister  | Electric SQL, via [electric](https://github.com/electric-sql/electric)                                 |
| persister-libsql          | createLibSqlPersister       | LibSQL for Turso, via [libsql-client](https://github.com/tursodatabase/libsql-client-ts)               |
| persister-powersync       | createPowerSyncPersister    | PowerSync, via [powersync-sdk](https://github.com/powersync-ja/powersync-js)                           |
| persister-yjs             | createYjsPersister          | Yjs CRDTs, via [yjs](https://github.com/yjs/yjs)                                                       |
| persister-automerge       | createSqliteWasmPersister   | Automerge CRDTs, via [automerge-repo](https://github.com/automerge/automerge-repo)                     |

See the Database Persistence guide for details on how to work with SQLite
databases, and the Synchronizing Data guide for more complex synchronization
with the CRDT frameworks.

There is also a way to developer custom Persisters of your own, which we
describe in the Custom Persistence guide.

## Persister Operations

A Persister lets you explicit save or load data, with the save method and the
load method respectively. These methods are both asynchronous (since the
underlying data storage may also be) and return promises. As a result you should
use the `await` keyword to call them in a way that guarantees subsequent
execution order.

In this example, a Persister saves data to, and loads it from, the browser's
session storage:

```js
import {createSessionPersister} from 'tinybase/persisters/persister-browser';
import {createStore} from 'tinybase';

const store = createStore()
  .setValues({employees: 3})
  .setTables({pets: {fido: {species: 'dog'}}});
const persister = createSessionPersister(store, 'petStore');

await persister.save();
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"fido":{"species":"dog"}}},{"employees":3}]'

sessionStorage.setItem(
  'petStore',
  '[{"pets":{"toto":{"species":"dog"}}},{"employees":4}]',
);
await persister.load();
console.log(store.getTables());
// -> {pets: {toto: {species: 'dog'}}}
console.log(store.getValues());
// -> {employees: 4}

sessionStorage.clear();
```

## Automatic Loading and Saving

When you don't want to deal with explicit persistence operations, a Persister
object also provides automatic saving and loading. Automatic saving listens for
changes to the Store and persists the data immediately. Automatic loading
listens (or polls) for changes to the persisted data and reflects those changes
in the Store.

You can start automatic saving or loading with the startAutoSave method and
startAutoLoad method. Both are asynchronous since they will do an immediate save
and load before starting to listen for subsequent changes. You can stop the
behavior with the stopAutoSave method and stopAutoLoad method (which are
synchronous).

In this example, both automatic loading and saving are configured:

```js
await persister.startAutoLoad([{pets: {fido: {species: 'dog'}}}, {}]);
await persister.startAutoSave();

store.delValues().setTables({pets: {felix: {species: 'cat'}}});
// ...
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"felix":{"species":"cat"}}},{}]'

sessionStorage.setItem('petStore', '[{"pets":{"toto":{"species":"dog"}}},{}]');
// -> StorageEvent('storage', {storageArea: sessionStorage, key: 'petStore'})
// ...
console.log(store.getTables());
// -> {pets: {toto: {species: "dog"}}}

persister.destroy();
sessionStorage.clear();
```

Note that the startAutoLoad method also takes a default set of Tables so that
the Store can be instantiated with good data if the persistence layer is empty
(such as when this is the first time the app has been executed).

## A Caveat

You may often want to have both automatic saving and loading of a Store so that
changes are constantly synchronized (allowing basic state preservation between
browser tabs, for example). The framework has some basic provisions to prevent
race conditions - for example it will not attempt to save data if it is
currently loading it and vice-versa - and will sequentially schedule methods
that could cause race conditions.

That said, be aware that you should always comprehensively test your persistence
strategy to understand the opportunity for data loss (in the case of trying to
save data to a server under poor network conditions, for example).

To help debug such issues, since v4.0.4, the create methods for all Persister
objects take an optional `onIgnoredError` argument. This is a handler for the
errors that the Persister would otherwise ignore when trying to save or load
data (such as when handling corrupted stored data). It's recommended you use
this for debugging persistence issues, but only in a development environment.
Database-based Persister objects also take an optional `onSqlCommand` argument
for logging commands and queries made to the underlying database.

## Summary

Use the persisters module to load and save data from and to a variety of common
persistence layers. When these don't suffice, you can also develop custom
Persisters of your own, for which we proceed to the Custom Persistence guide.
