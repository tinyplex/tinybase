# Using A MergeableStore

The basic building block of TinyBase's synchronization system is the
MergeableStore interface.

## The Anatomy Of A MergeableStore

The MergeableStore interface is a sub-type of the regular Store - and it shares
its underlying implementation.

This means that if you want to add synchronization to your app, all of your
existing calls to the Store methods will be unchanged - you just need to use the
createMergeableStore function to instantiate it, instead of the classic
createStore function.

```js
import {createMergeableStore} from 'tinybase';

const store1 = createMergeableStore('store1'); // !resetHlc
store1.setCell('pets', 'fido', 'species', 'dog');

console.log(store1.getContent());
// -> [{pets: {fido: {species: 'dog'}}}, {}]
```

The difference, though, is that a MergeableStore records additional metadata as
the data is changed so that potential conflicts between it and another instance
can be reconciled. This metadata is intended to be opaque, but you can see it if
you call the getMergeableContent method:

```js
console.log(store1.getMergeableContent());
// ->
[
  [
    {
      pets: [
        {
          fido: [
            {species: ['dog', 'Nn1JUF-----FnHIC', 290599168]},
            '',
            2682656941,
          ],
        },
        '',
        2102515304,
      ],
    },
    '',
    3506229770,
  ],
  [{}, '', 0],
];
```

Without going into the detail of this, the main point to understand is that each
update gets a timestamp, based on a hybrid logical clock (HLC), and a hash. As a
result, TinyBase is able to understand which parts of the data have changed, and
which changes are the most recent. The resulting 'last write wins' (LWW)
approach allows the MergeableStore to act as a Conflict-Free Replicated Data
Type (CRDT).

(Notice we provided an explicit `uniqueId` when we initialized the
MergeableStore: this is not normally required, but here it just ensures the
hashes in the example are deterministic).

We can of course, create a second MergeableStore with different data:

```js
const store2 = createMergeableStore();
store2.setCell('pets', 'felix', 'species', 'cat');
```

And now merge them together with the convenient merge method:

```js
store1.merge(store2);

console.log(store1.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]

console.log(store2.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]
```

Magic!

This all said, it's very unlikely you will need to use the numerous extra
methods available on a MergeableStore (compared to a Store) since most of them
exist to support synchronization behind the scenes.

In general, you'll just use a MergeableStore in the same was as you would have
used a Store, and instead rely on the more approachable Synchronizer API for
synchronization. We'll discuss this next in the Using A Synchronizer guide.

# Persisting A MergeableStore

Once important thing that you need to be aware of is that a MergeableStore
cannot currently be persisted by every type of Persister available to a regular
Store. This is partly because some are already designed to work with alternative
third-party CRDT systems (like the YjsPersister and AutomergePersister), and
partly because this extra metadata cannot be easily stored in a plain SQLite
database.

The following Persister types _can_ be used to persist a MergeableStore:

| Persister        | Storage                     |
| ---------------- | --------------------------- |
| SessionPersister | Browser session storage     |
| LocalPersister   | Browser local storage       |
| FilePersister    | Local file (where possible) |

The following database-oriented Persister types can be used to persist a
MergeableStore, but _only_ in the 'JSON-serialization' mode:

| Persister           | Storage                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Sqlite3Persister    | SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)                                |
| SqliteWasmPersister | SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)                         |
| ExpoSqlitePersister | SQLite in React Native, via [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite) |
| PostgresPersister   | PostgreSQL, via [postgres](https://github.com/porsager/postgres)                                       |
| PglitePersister     | PostgreSQL, via [PGlite](https://github.com/electric-sql/pglite)                                       |

The following database-oriented Persister types _cannot_ currently be used to
persist a MergeableStore:

| Persister             | Storage                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| IndexedDbPersister    | Browser IndexedDB                                                                        |
| RemotePersister       | Remote server                                                                            |
| CrSqliteWasmPersister | SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)                 |
| ElectricSqlPersister  | Electric SQL, via [electric-sql](https://github.com/electric-sql/electric)               |
| LibSqlPersister       | LibSQL for Turso, via [libsql-client](https://github.com/tursodatabase/libsql-client-ts) |
| PowerSyncPersister    | PowerSync, via [powersync-sdk](https://github.com/powersync-ja/powersync-js)             |
| YjsPersister          | Yjs CRDTs, via [yjs](https://github.com/yjs/yjs)                                         |
| AutomergePersister    | Automerge CRDTs, via [automerge-repo](https://github.com/automerge/automerge-repo)       |
| PartyKitPersister     | [PartyKit](https://www.partykit.io/), via the persister-partykit-server module           |

Next, let's see how to synchronize MergeableStore objects together with the
synchronizers module. Please continue on to the Using A Synchronizer guide.
