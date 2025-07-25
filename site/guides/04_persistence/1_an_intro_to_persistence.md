# An Intro To Persistence

The persister module framework lets you save and load Store data to and from different
locations, or underlying storage types.

Remember that TinyBase Stores are in-memory data structures, so you will
generally want to use a Persister to store that data longer-term. For example,
they are useful for preserving Store data between browser sessions or reloads,
saving or loading browser state to or from a server, saving Store data to disk
in a environment with filesystem access, or, in v4.0 and above, to SQLite,
PostgreSQL, or CRDT frameworks like [Yjs](https://yjs.dev/) and
[Automerge](https://automerge.org/).

## Types of Persisters

Many entry points are provided (in separately installed modules), each of which
returns different types of Persister that can load and save a Store. Between
them, these allow you to store your TinyBase data locally, remotely, to
databases, and across synchronization boundaries with CRDT frameworks.

### Basic Persisters

These are reasonably simple Persisters that generally load and save a
JSON-serialized version of your Store. They are good for smaller data sets and
where you need to have something saved in a basic browser or server environment.

| Persister                | Storage                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| SessionPersister         | Browser session storage                                                                      |
| LocalPersister           | Browser local storage                                                                        |
| FilePersister            | Local file                                                                                   |
| IndexedDbPersister       | Browser IndexedDB                                                                            |
| RemotePersister          | Remote server                                                                                |
| ReactNativeMmkvPersister | MMKV in React Native, via [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) |

### Database Persisters

These are Persisters that can load and save either a JSON-serialized, or tabular
version of your Store into a database. They are good for larger data sets, often
on a server - but can also work in a browser environment when a SQLite instance
is available.

| Persister                  | Storage                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Sqlite3Persister           | SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)                                          |
| SqliteBunPersister         | SQLite in Bun, via [bun:sqlite](https://bun.sh/docs/api/sqlite)                                                  |
| SqliteWasmPersister        | SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)                                   |
| ExpoSqlitePersister        | SQLite in React Native, via [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite)           |
| ReactNativeSqlitePersister | SQLite in React Native, via [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage) |
| CrSqliteWasmPersister      | SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)                                         |
| ElectricSqlPersister       | Electric SQL, via [electric](https://github.com/electric-sql/electric)                                           |
| LibSqlPersister            | LibSQL for Turso, via [libsql-client](https://github.com/tursodatabase/libsql-client-ts)                         |
| PowerSyncPersister         | PowerSync, via [powersync-sdk](https://github.com/powersync-ja/powersync-js)                                     |
| PostgresPersister          | PostgreSQL, via [postgres](https://github.com/porsager/postgres)                                                 |
| PglitePersister            | PostgreSQL, via [PGlite](https://github.com/electric-sql/pglite)                                                 |

See the Database Persistence guide for details on how to work with databases.

### Durable Object Persisters

These Persisters are designed to work with Durable Objects, which are a
specialized type of server-side storage provided by CloudFlare. In conjunction
with a WsServerDurableObject, they allow you to synchronize clients and then
also persist data in a Durable Object, either in its key-value, or SQlite
storage form.

| Persister                        | Storage                                     |
| -------------------------------- | ------------------------------------------- |
| DurableObjectStoragePersister    | Cloudflare Durable Object key-value storage |
| DurableObjectSqlStoragePersister | Cloudflare Durable Object SQLite storage    |

### Third-Party CRDT & Socket Persisters

These Persisters can bind your Store into third-party CRDT frameworks, or
synchronize over sockets to PartyKit.

| Persister          | Storage                                                                            |
| ------------------ | ---------------------------------------------------------------------------------- |
| YjsPersister       | Yjs CRDTs, via [yjs](https://github.com/yjs/yjs)                                   |
| AutomergePersister | Automerge CRDTs, via [automerge-repo](https://github.com/automerge/automerge-repo) |
| PartyKitPersister  | [PartyKit](https://www.partykit.io/), via the persister-partykit-server module     |

See the Third-Party CRDT Persistence guide for more complex synchronization with
the CRDT frameworks.

There is also a way to develop custom Persisters of your own, which we describe
in the Custom Persistence guide.

## Persister Operations

A Persister lets you explicitly save or load data, with the save method and the
load method respectively. These methods are both asynchronous (since the
underlying data storage may also be) and return promises. As a result you should
use the `await` keyword to call them in a way that guarantees subsequent
execution order.

In this example, a Persister saves data to, and loads it from, the browser's
session storage:

```js
import {createStore} from 'tinybase';
import {createSessionPersister} from 'tinybase/persisters/persister-browser';

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
startAutoLoad method. The startAutoPersisting method is a convenience wrapper to
do both in one command. These methods are asynchronous since they will do an
immediate save and load before starting to listen for subsequent changes. You
can stop the behavior with the stopAutoSave method, stopAutoLoad method, the
stopAutoPersisting method, and/or the destroy method.

In this example, both automatic loading and saving are configured:

```js
await persister.startAutoPersisting([{pets: {fido: {species: 'dog'}}}, {}]);

store.delValues().setTables({pets: {felix: {species: 'cat'}}});
// ...
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"felix":{"species":"cat"}}},{}]'

sessionStorage.setItem('petStore', '[{"pets":{"toto":{"species":"dog"}}},{}]');
// -> StorageEvent('storage', {storageArea: sessionStorage, key: 'petStore'})
// ...
console.log(store.getTables());
// -> {pets: {toto: {species: "dog"}}}

await persister.destroy();
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
Persisters of your own.

Next we move on to look at how to fully synchronize TinyBase Stores with
databases, particularly SQLite, in the Database Persistence guide.
