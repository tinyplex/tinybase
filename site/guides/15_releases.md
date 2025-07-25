# Releases

This is a reverse chronological list of the major TinyBase releases, with
highlighted features.

---

# v6.4

This release includes the new persister-react-native-sqlite module, which
allows you to persist data in a React Native SQLite database via the
[react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)
library.

Usage should be as simple as this:

```js yolo
import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
import {createStore} from 'tinybase';
import {createReactNativeSqlitePersister} from 'tinybase/persisters/persister-react-native-sqlite';

enablePromise(true);
const db = await openDatabase({name: 'my.db', location: 'default'});
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createReactNativeSqlitePersister(store, db);

await persister.save();
// Store will be saved to the database.
```

Please let us know how you get on with this new Persister, and if you have any feedback or suggestions.

---

# v6.3

This release includes the new persister-durable-object-sql-storage module, which
allows you to persist data in a Cloudflare Durable Object's SQLite-based storage
in conjunction with websocket-based synchronization (using the
WsServerDurableObject class).

Huge thanks to [Corey Jepperson](https://github.com/acoreyj) for implementing
the entirety of this functionality!

```js yolo
import {createMergeableStore} from 'tinybase';
import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

const config = {
  mode: 'fragmented',
  storagePrefix: 'my_app_',
};

export class MyDurableObject extends WsServerDurableObject {
  createPersister() {
    const store = createMergeableStore();
    const persister = createDurableObjectSqlStoragePersister(
      store,
      this.ctx.storage.sql,
      config,
    );
    return persister;
  }
}
```

Prior to this release, the only way to persist data in a Durable Object was to
use the persister-durable-object-storage module, which uses CloudFlare's
key-value storage backend behind the scenes.

However, Cloudflare's SQLite storage backend for Durable Objects offers
significantly better pricing compared to the key-value storage backend. The
SQLite storage backend is Cloudflare's recommended storage option for new
Durable Object namespaces.

Note that, before using this persister, you must configure your Durable Object
class to use SQLite storage by adding a migration to your `wrangler.toml` or
`wrangler.json` configuration file. Use `new_sqlite_classes` in your migration
configuration to enable SQLite storage for your Durable Object class. See the
module documentation for more information.

This release also addresses a local-storage persistence issue, #[257](https://github.com/tinyplex/tinybase/issues/257).

---

# v6.2

This release contains various packaging improvements and exposes some internal
HLC functions that are useful for people building their own persisters or
synchronizers.

## New `omni` module

There is a new `omni` module that is an explicit superset of everything in the
TinyBase ecosystem. It exports the features and functionality of every
`tinybase/*` module, including every persister, every synchronizer, and every UI
component. This is useful for applications that want to use multiple facets of
the overall TinyBase ecosystem and also benefit from the fact they share a lot
of code internally.

```js yolo
import {createStore, createSqliteBunPersister} from 'tinybase/omni';
```

However, it should go without saying that you should only use the `omni` module
if you have an aggressive tree-shaking bundler that can remove all the
persisters, synchronizers, and so on, that you do _not_ use. Experiment with
different bundler configurations to see what works best for your usage.

## with-schema exports

This release changes the `package.json` exports slightly so that imports of both
`/with-schema` and non-schema'd versions of the modules resolve to the same
JavaScript file. This reduces bundle size for apps that use both schema and
non-schema imports.

## HLC & hash functions

The common module (and hence tinybase module) now export the getHlcFunctions
function. This returns set of seven functions that can be used to create and
manipulate HLC (Hybrid Logical Clock) timestamps.

```js
import {getHlcFunctions} from 'tinybase';
const [getNextHlc, seenHlc, encodeHlc] = getHlcFunctions();
```

There are also several functions to help hash tabular and key-value data in a
way that is compatible with the internal MergeableStore implementation. These
include the getHash function and the getCellHash function, for example.

These are for pretty advanced use-cases! But you can use these in your own
systems to ensure the timestamps and hashes are compatible with the ones
generated in TinyBase MergeableStore objects.

## Moved types

The rarely-used GetNow and Hash types have been moved from the mergeable-store
module into the common module.

---

# v6.1

## In Summary

- [A new Persister for Bun](#bun-sqlite)'s embedded SQLite database.
- [Subset persistence](#subset-persistence) to load subsets of tables into a
  Store.
- [Destructured object
  arguments](#destructured-object-arguments-for-sorted-row-ids) for sorted Row
  Id methods and hooks.
- [A new startAutoPersisting method](#new-startautopersisting-method).

And more!

## Bun SQLite

This release includes a new Persister for the [embedded SQLite
database](https://bun.sh/docs/api/sqlite) available in the Bun runtime.

You use it by passing a reference to a Bun Database object into the
createSqliteBunPersister function:

```js bun
import {Database} from 'bun:sqlite';
import {createStore} from 'tinybase';
import {createSqliteBunPersister} from 'tinybase/persisters/persister-sqlite-bun';

const db = new Database(':memory:');
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createSqliteBunPersister(store, db, 'my_tinybase');

await persister.save();
// Store will be saved to the database.

console.log(db.query('SELECT * FROM my_tinybase;').all());
// -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]

db.query(
  'UPDATE my_tinybase SET store = ' +
    `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
).run();
await persister.load();
console.log(store.getTables());
// -> {pets: {felix: {species: 'cat'}}}

await persister.destroy();
```

There's more information the documentation for the new persister-sqlite-bun
module.

## Subset persistence

Persisters that load and save data to an underlying database can now be
configured to only load a _subset_ of the rows in a table into a Store.

This is useful for reducing the amount of data that is loaded into memory, or
for working with a subset of data that is relevant to the current user, for
example.

Do this by specifying a `condition` in the Persister configuration. This is a
single string argument which is used as a SQL `WHERE` clause when reading and
observing data in the table.

For example, the following code will only load rows from the `pets` database
table where the `sold` column is set to `0`:

```js yolo
const subsetPersister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {
    load: {pets: {tableId: 'pets', condition: '$tableName.sold = 0'}},
    save: {pets: {tableName: 'pets', condition: '$tableName.sold = 0'}},
  },
});
```

See the '[Loading subsets of database
tables](/guides/persistence/database-persistence/#loading-subsets-of-database-tables)'
section of the Database Persistence guide for more details. And a huge thank you
to Jakub Riedl ([@jakubriedl](https://github.com/jakubriedl)) for landing this
functionality!

## Destructured object arguments for sorted Row Ids

The getSortedRowIds method on the Store interface has a number of optional
parameters and it can be tiresome to fill in the defaults if you only want to
change the last one, for example. So this release introduces an override such
that you can pass an object with the parameters as properties.

So instead of:

```js yolo
store.getSortedRowIds('pets', undefined, undefined, undefined, 10);
```

You can now do:

```js yolo
store.getSortedRowIds({tableId: 'pets', limit: 10});
```

This pattern is also made available to the addSortedRowIdsListener method, the
useSortedRowIds hook, and the useSortedRowIdsListener hook.

## New startAutoPersisting method

The new startAutoPersisting method and stopAutoPersisting method on the
Persister interface act as convenience methods for starting (and stopping) both
the automatic loading and saving of data.

## New createMergeableStore getNow parameter

The createMergeableStore function now takes an optional `getNow` argument that
lets you override the clock used to generate HLC timestamps.

## Asynchronous Persister & Synchronizer methods

Please note that some methods in the Persister and Synchronizer APIs are now
asynchronous. Although most implementations of these methods are synchronous,
some (particularly for Postgres-based databases) are no longer so and you are
recommended to await them all.

The stopAutoLoad method, the stopAutoSave method, and the destroy method in the
base Persister interface have been marked asynchronous and return Promises. The
stopSync method in the Synchronizer interface and the destroy method in the
Synchronizer server interfaces should also be considered asynchronous.

---

# v6.0

This major release is about updating dependencies and infrastructure rather than
adding new features.

The most notable changes for users are:

- The package distribution only includes modern ESM packages (both minified and
  non-minified).
- React 19 is now compatible as an optional peer dependency.
- The tools module and TinyBase CLI have been removed.

If you have been using CJS or UMD packages, you will need to update your
bundling strategy for TinyBase (in the same way that you will have had to have
done for React 19, for example) but this change should be compatible with most
packaging tools. If you had been using the library directly a browser, you
should consider the [esm.sh](https://esm.sh/) CDN, as we have for our demos.

As a result of these changes, there have been some additional knock-on effects
to the project and developer infrastructure as a whole. For example:

- The test suite has been updated to use `react-testing-library` instead of
  `react-test-renderer`.
- The React `jsx-runtime` is used for JSX transformations.
- Demos (and CodePen examples) have been updated to use an `importmap` mapping
  the modules to the [esm.sh](https://esm.sh/) CDN.
- ESLint has finally been upgraded to v9.

Note that TinyBase v6.0 adds no new functionality, so you can afford to stay on
v5.4.x for a while if these changes are somehow incompatible for you. However,
all future functionality changes and bug fixes _will_ take effect as v6.x
releases (and probably won't be back-ported to v5.4.x), so you should endeavor
to upgrade as soon as you can.

Please let us know how these changes find you, and please file an issue on
GitHub if you need help adapting to any of them.

---

# v5.4

## Durable Objects synchronization

This release contains a new WebSocket synchronization server that runs on
Cloudflare as a Durable Object.

![Durable Objects](/durable.svg 'Durable Objects')

It's in the new synchronizer-ws-server-durable-object module, and you use it by
extending the WsServerDurableObject class. Use the getWsServerDurableObjectFetch
function for conveniently binding your Cloudflare Worker to your Durable Object:

```js yolo
import {
  WsServerDurableObject,
  getWsServerDurableObjectFetch,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

export class MyDurableObject extends WsServerDurableObject {}

export default {fetch: getWsServerDurableObjectFetch('MyDurableObjects')};
```

For the above code to work, you'll need to have a Wrangler configuration that
connects the `MyDurableObject` class to the `MyDurableObjects` namespace. In
other words, you'll have something like this in your `wrangler.toml` file:

```toml
[[durable_objects.bindings]]
name = "MyDurableObjects"
class_name = "MyDurableObject"
```

With this you can now easily connect and synchronize clients that are using the
WsSynchronizer synchronizer.

## Durable Objects Persistence

But wait! There's more. Durable Objects also provide a storage mechanism, and
sometimes you want TinyBase data to also be stored on the server (in case all
the current clients disconnect and a new one joins, for example). So this
release of TinyBase also includes a dedicated persister, the
DurableObjectStoragePersister, that also synchronizes the data to the Durable
Object storage layer.

You create it with the createDurableObjectStoragePersister function, and hook it
into the Durable Object by returning it from the createPersister method of your
WsServerDurableObject:

```js yolo
export class MyDurableObject extends WsServerDurableObject {
  createPersister() {
    return createDurableObjectStoragePersister(
      createMergeableStore(),
      this.ctx.storage,
    );
  }
}
```

You can get started quickly with this architecture using the [new Vite
template](https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object)
that accompanies this release.

## Server Reference Implementation

Unrelated to Durable Objects, this release also includes the new
synchronizer-ws-server-simple module that contains a simple server
implementation called WsServerSimple. Without the complications of listeners,
persistence, or statistics, this is more suitable to be used as a reference
implementation for other server environments.

## Architectural Guide

To go with this release, we have added new documentation on ways in which you
can use TinyBase in an app architecture. Check it out in the new Architectural
Options guide.

We've also started a new section of documentation for describing integrations,
of which the Cloudflare Durable Objects guide, of course, is the first new
entry!

---

# v5.3

This release is focussed on a few API improvements and quality-of-life changes.
These include:

## React SSR support

Thanks to contributor [Muhammad Muhajir](https://github.com/muhajirdev) for
ensuring that TinyBase runs in server-side rendering environments!

## In the persisters module...

All Persister objects now expose information about whether they are loading or
saving. To access this Status, use:

- The getStatus method, which will return 0 when it is idle, 1 when it is
  loading, and 2 when it is saving.
- The addStatusListener method, which lets you add a StatusListener function and
  which is called whenever the status changes.

These make it possible to track background load and save activities, so that,
for example, you can show a status-bar spinner of asynchronous persistence
activity.

## In the synchronizers module...

Synchronizers are a sub-class of Persister, so all Synchronizer objects now also
have:

- The getStatus method, which will return 0 when it is idle, 1 when it is
  'loading' (ie inbound syncing), and 2 when it is 'saving' (ie outbound
  syncing).
- The addStatusListener method, which lets you add a StatusListener function and
  which is called whenever the status changes.

## In the ui-react module...

There are corresponding hooks so that you can build these status changes into a
React UI easily:

- The usePersisterStatus hook, which will return the status for an explicitly
  provided, or context-derived Persister.
- The usePersisterStatusListener hook, which lets you add your own
  StatusListener function to a Persister.
- The usePersister hook, which lets you get direct access to a Persister from
  within your UI.

And correspondingly for Synchronizers:

- The useSynchronizerStatus hook, which will return the status for an explicitly
  provided, or context-derived Synchronizer.
- The useSynchronizerStatusListener hook, which lets you add your own
  StatusListener function to a Synchronizer.
- The useSynchronizer hook, which lets you get direct access to a Synchronizer
  from within your UI.

In addition, this module also now includes hooks for injecting objects into the
Provider context scope imperatively, much like the existing useProvideStore
hook:

- The useProvideMetrics hook, which lets you imperatively register Metrics
  objects.
- The useProvideIndexes hook, which lets you register Indexes objects.
- The useProvideRelationships hook, which lets you register Relationships
  objects.
- The useProvideQueries hook, which lets you register Queries objects.
- The useProvideCheckpoints hook, which lets you register Checkpoints objects.
- The useProvidePersister hook, which lets you register Persister objects.
- The useProvideSynchronizer hook, which lets you register Synchronizer objects.

All of these new methods have extensive documentation, each with examples to
show how to use them.

Please provide feedback on this new release on GitHub!

---

# v5.2

This release introduces new Persisters for... PostgreSQL! TinyBase now has two
new Persister modules:

- The persister-postgres module provides the PostgresPersister, which uses the
  excellent [`postgres`](https://github.com/porsager/postgres) module to bind to
  regular PostgreSQL databases, generally on a server.
- The persister-pglite module provides the PglitePersister, which uses the new
  and exciting [`pglite`](https://github.com/electric-sql/pglite) module for
  running PostgreSQL... in a browser!

Conceptually, things behave in the same way as they do for the various SQLite
persisters. Simply use the createPostgresPersister function (or the similar
createPglitePersister function) to persist your TinyBase data:

```js
import postgres from 'postgres';
import {createStore} from 'tinybase';
import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';

// Create a TinyBase Store.
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});

// Create a postgres connection and Persister.
const sql = postgres('postgres://localhost:5432/tinybase');
const pgPersister = await createPostgresPersister(store, sql, 'my_tinybase');

// Save Store to the database.
await pgPersister.save();

console.log(await sql`SELECT * FROM my_tinybase;`);
// -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
```

And, as per usual, you can update the database and have TinyBase automatically
reflect those changes:

```js
// If separately the database gets updated...
const json = '[{"pets":{"felix":{"species":"cat"}}},{}]';
await sql`UPDATE my_tinybase SET store = ${json} WHERE _id = '_';`;

// ... then changes are loaded back. Reactive auto-load is also supported!
await pgPersister.load();
console.log(store.getTables());
// -> {pets: {felix: {species: 'cat'}}}

// As always, don't forget to tidy up.
await pgPersister.destroy();
await sql.end();
```

Note that these two Persister objects support both the `json` and `tabular`
modes for saving TinyBase data into the database. See the
DatabasePersisterConfig type for more details. (Note however that, like the
SQLite Persisters, only the `json` mode is supported for MergeableStore
instances, due to their additional CRDT metadata.)

This release also exposes the new createCustomSqlitePersister function and
createCustomPostgreSqlPersister function at the top level of the persister
module. These can be used to build Persister objects against SQLite and
PostgreSQL SDKs (or forks) that are not already included with TinyBase.

## Minor breaking change

It's very unlikely to affect most apps, but also be aware that the persisters
module and synchronizers module are no longer bundled in the 'master' tinybase
module. If you are using them (most likely because you have built a custom
Persister or Synchronizer), you will need to update your imports accordingly to
the standalone `tinybase/persisters` and `tinybase/synchronizers` versions of
them. Apologies.

---

# v5.1

This release lets you persist data on a server using the createWsServer
function. This makes it possible for all clients to disconnect from a path, but,
when they reconnect, for the data to still be present for them to sync with.

This is done by passing in a second argument to the createWsServer function that
creates a Persister instance (for which also need to create or provide a
MergeableStore) for a given path:

```js
import {createMergeableStore} from 'tinybase';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {WebSocketServer} from 'ws';

const persistingServer = createWsServer(
  new WebSocketServer({port: 8051}),
  (pathId) =>
    createFilePersister(
      createMergeableStore(),
      pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);

await persistingServer.destroy();
```

This is a very crude (and not production-safe!) example, but demonstrates a
server that will create a file, based on any path that clients connect to, and
persist data to it. See the createWsServer function documentation for more
details.

This implementation is still experimental so please kick the tires!

There is one small breaking change in this release: the functions for creating
Synchronizer objects can now take optional onSend and onReceive callbacks that
will fire whenever messages pass through the Synchronizer. See, for example, the
createWsSynchronizer function. These are suitable for debugging synchronization
issues in a development environment.

---

# v5.0

We're excited to announce this major release for TinyBase! It includes important
data synchronization functionality and a range of other improvements.

# In Summary

- [The new MergeableStore type](#the-new-mergeableStore-type) wraps your data as
  a Conflict-Free Replicated Data Type (CRDT).
- [The new Synchronizer framework](#the-new-synchronizer-framework) keeps
  multiple instances of data in sync across different media.
- An [improved module folder structure](#improved-module-folder-structure)
  removes common packaging and bundling issues.
- The TinyBase Inspector is now in its own standalone ui-react-inspector module.
- TinyBase now supports only Expo SQLite v14 ([SDK
  51](https://expo.dev/changelog/2024/05-07-sdk-51)) and above.

There are also some small [breaking changes](#breaking-changes-in-v50) that may
affect you (but which should easy to fix if they do).

Let's look at the major functionality in more detail!

## The New MergeableStore Type

A key part of TinyBase v5.0 is the new mergeable-store module, which contains a
subtype of Store - called MergeableStore - that can be merged with another with
deterministic results. The implementation uses an encoded hybrid logical clock
(HLC) to timestamp the changes made so that they can be cleanly merged.

The getMergeableContent method on a MergeableStore is used to get the state of a
store that can be merged into another. The applyMergeableChanges method will let
you apply that to (another) store. The merge method is a convenience function to
bidirectionally merge two stores together:

```js
const localStore1 = createMergeableStore();
const localStore2 = createMergeableStore();

localStore1.setCell('pets', 'fido', 'species', 'dog');
localStore2.setCell('pets', 'felix', 'species', 'cat');

localStore1.merge(localStore2);

console.log(localStore1.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]

console.log(localStore2.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]
```

Please read the new Using A MergeableStore guide for more details of how to use
this important new API.

A MergeableStore can be persisted locally, just like a regular Store into file,
local and session storage, and simple SQLite environments such as Expo and
SQLite3. These allow you to save the state of a MergeableStore locally before it
has had the chance to be synchronized online, for example.

Which leads us onto the next important feature in v5.0, allowing you to
synchronize stores between systems...

## The New Synchronizer Framework

The v5.0 release also introduces the new concept of synchronization.
Synchronizer objects implement a negotiation protocol that allows multiple
MergeableStore objects to be merged together. This can be across a network,
using WebSockets, for example:

```js
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {WebSocket} from 'ws';

// On a server machine:
const server = createWsServer(new WebSocketServer({port: 8043}));

// On the first client machine:
const store1 = createMergeableStore();
const synchronizer1 = await createWsSynchronizer(
  store1,
  new WebSocket('ws://localhost:8043'),
);
await synchronizer1.startSync();
store1.setCell('pets', 'fido', 'legs', 4);

// On the second client machine:
const store2 = createMergeableStore();
const synchronizer2 = await createWsSynchronizer(
  store2,
  new WebSocket('ws://localhost:8043'),
);
await synchronizer2.startSync();
store2.setCell('pets', 'felix', 'price', 5);
// ...

console.log(store1.getTables());
// -> {pets: {felix: {price: 5}, fido: {legs: 4}}}
console.log(store2.getTables());
// -> {pets: {felix: {price: 5}, fido: {legs: 4}}}

await synchronizer1.destroy();
await synchronizer2.destroy();
await server.destroy();
```

This release includes three types of Synchronizer:

- The WsSynchronizer uses WebSockets to communicate between different systems as
  shown above.
- The BroadcastChannelSynchronizer uses the browser's BroadcastChannel API to
  communicate between different tabs and workers.
- The LocalSynchronizer demonstrates synchronization in memory on a single local
  system.

Notice that the WsSynchronizer assumes that there exists a server that can
forward requests to other WsSynchronizer systems. This can be created using the
createWsServer function that takes a WebSocketServer as also shown above.

Please read the new Using A Synchronizer guide for more details of how to
synchronize your data.

## Improved Module Folder Structure

We have previously found issues with legacy bundlers and other tools that didn't
fully support the new `exports` field in the module's package.

To mitigate that, the TinyBase distribution now has a top-level folder structure
that fully echoes the import paths, including signifiers for JavaScript
versions, schema support, minification and so on.

Please read the comprehensive Importing TinyBase guide for more details of how
to construct the correct import paths in v5.0.

## Breaking Changes in v5.0

### Module File Structure

If you previously had `/lib/` in your import paths, you should remove it. You
also do not have to explicitly specify whether you need the `cjs` version of
TinyBase - if you are using a `require` rather than an `import`, you will get it
automatically.

The non-minified version of the code is now default and you need to be explicit
when you _want_ minified code. Previously you would add `/debug` to the import
path to get non-minified code, but now you add `/min` to the import path to get
_minified_ code.

### Expo SQLite Persister

Previously the persister-expo-sqlite module supported expo-sqlite v13 and the
persister-expo-sqlite-next module supported their modern 'next' package. In
v5.0, the persister-expo-sqlite module only supports v14 and later, and the
persister-expo-sqlite-next module has been removed.

### The TinyBase Inspector

Previously, the React-based inspector (then known as `StoreInspector`) resided
in the debug version of the ui-react-dom module. It now lives in its own
ui-react-inspector module (so that it can be used against non-debug code) and
has been renamed to Inspector.

Please update your imports and rename the component when used, accordingly. See
the API documentation for details, or the <Inspector /> demo, for example.

### API Changes

The following changes have been made to the existing TinyBase API for
consistency. These are less common parts of the API but should straightforward
to correct if you are using them.

In the type definitions:

- The GetTransactionChanges and GetTransactionLog types have been removed.
- The TransactionChanges type has been renamed as the Changes type.
- The Changes type now uses `undefined` instead of `null` to indicate a Cell or
  Value that has been deleted or that was not present.
- The TransactionLog type is now an array instead of a JavaScript object.

In the Store interface:

- There is a new getTransactionChanges method and a new getTransactionLog
  method.
- The setTransactionChanges method is renamed as the applyChanges method.
- A DoRollback function no longer gets passed arguments. You can use the
  getTransactionChanges method and getTransactionLog method directly instead.
- Similarly, a TransactionListener function no longer gets passed arguments.

In the persisters module:

- The createCustomPersister function now takes a final optional boolean
  (`supportsMergeableStore`) to indicate that the Persister can support
  MergeableStore as well as Store objects.
- A Persister's load method and startAutoLoad method now take a Content object
  as one parameter, rather than Tables and Values as two.
- If you create a custom Persister, the setPersisted method now receives changes
  made to a Store directly by reference, rather than via a callback. Similarly,
  the PersisterListener you register in your addPersisterListener implementation
  now takes Content and Changes objects directly rather than via a callback.
- The broadcastTransactionChanges method in the persister-partykit-server module
  has been renamed to the broadcastChanges method.

---

# v4.8

This release includes the new persister-powersync module, which provides a
Persister for [PowerSync's SQLite](https://www.powersync.com/) database.

Much like the other SQLite persisters, use it by passing in a PowerSync instance
to the createPowerSyncPersister function; something like:

```js yolo
const powerSync = usePowerSync();

const persister = createPowerSyncPersister(store, powerSync, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

A huge thank you to [Benedikt Mueller](https://bndkt.com/)
([@bndkt](https://github.com/bndkt)) for building out this functionality! And
please provide feedback on how this new Persister works for you.

---

# v4.7

This release includes the new persister-libsql module, which provides a
Persister for [Turso's LibSQL](https://turso.tech/libsql) database.

Use the Persister by passing in a reference to the LibSQL client to the
createLibSQLPersister function; something like:

```js yolo
const client = createClient({url: 'file:my.db'});

const persister = createLibSqlPersister(store, client, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

This is the first version of this functionality, so please provide feedback on
how it works for you!

---

# v4.6

This release includes the new persister-electric-sql module, which provides a
Persister for [ElectricSQL](https://electric-sql.com/) client databases.

Use the Persister by passing in a reference to the Electric client to the
createElectricSqlPersister function; something like:

```js yolo
const electric = await electrify(connection, schema, config);

const persister = createElectricSqlPersister(store, electric, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

This release is accompanied by a [template
project](https://github.com/tinyplex/tinybase-ts-react-electricsql) to get
started quickly with this integration. Enjoy!

---

# v4.5

This release includes the new persister-expo-sqlite-next module, which provides
a Persister for the modern version of Expo's
[SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite) library, designated
'next' as of November 2023. This API should be used if you are installing the
`expo-sqlite/next` module.

Note that TinyBase support for the legacy version of Expo-SQLite (`expo-sqlite`)
is still available in the persister-expo-sqlite module.

NB as of TinyBase v5.0, this is now the default and legacy support has been
removed.

Thank you to Expo for providing this functionality!

---

# v4.4

This relatively straightforward release adds a selection of new listeners to the
Store object, and their respective hooks. These are for listening to changes in
the 'existence' of entities rather than to their value. For example, the
addHasTableListener method will let you listen for the presence (or not) of a
specific table.

The full set of new existence-listening methods and hooks to work with this is
as follows:

| Existence of: | Add Listener            | Hook            | Add Listener Hook       |
| ------------- | ----------------------- | --------------- | ----------------------- |
| Tables        | addHasTablesListener    | useHasTables    | useHasTablesListener    |
| A Table       | addHasTableListener     | useHasTable     | useHasTableListener     |
| A Table Cell  | addHasTableCellListener | useHasTableCell | useHasTableCellListener |
| A Row         | addHasRowListener       | useHasRow       | useHasRowListener       |
| A Cell        | addHasCellListener      | useHasCell      | useHasCellListener      |
| Values        | addHasValuesListener    | useHasValues    | useHasValuesListener    |
| A Value       | addHasValueListener     | useHasValue     | useHasValueListener     |

These methods may become particularly important in future versions of TinyBase
that support `null` as valid Cells and Values.

---

# v4.3

We're excited to announce TinyBase 4.3, which provides an integration with
[PartyKit](https://www.partykit.io/), a cloud-based collaboration provider.

This allows you to enjoy the benefits of both a "local-first" architecture and a
"sharing-first" platform. You can have structured data on the client with fast,
reactive user experiences, but also benefit from cloud-based persistence and
room-based collaboration.

![PartyKit](/partykit.gif 'PartyKit')

This release includes two new modules:

- The persister-partykit-server module provides a server class for coordinating
  clients and persisting Store data to the PartyKit cloud.
- The persister-partykit-client module provides the API to create connections to
  the server and a binding to your Store.

A TinyBase server implementation on PartyKit can be as simple as this:

```js yolo
import {TinyBasePartyKitServer} from 'tinybase/persisters/persister-partykit-server';

export default class extends TinyBasePartyKitServer {}
```

On the client, use the familiar Persister API, passing in a reference to a
PartyKit socket object that's been configured to connect to your server
deployment and named room:

```js yolo
import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';

const persister = createPartyKitPersister(
  store,
  new PartySocket({
    host: 'project-name.my-account.partykit.dev',
    room: 'my-partykit-room',
  }),
);
await persister.startAutoSave();
await persister.startAutoLoad();
```

The load method and (gracefully failing) save method on this Persister use HTTPS
to get or set full copies of the Store to the cloud. However, the auto-save and
auto-load modes use a websocket to transmit subsequent incremental changes in
either direction, making for performant sharing of state between clients.

See and try out this new collaboration functionality in the Todo App v6
(collaboration) demo. This also emphasizes the few changes that need to be made
to an existing app to make it instantly collaborative.

Also try out the
[tinybase-ts-react-partykit](https://github.com/tinyplex/tinybase-ts-react-partykit)
template that gets you up and running with a PartyKit-enabled TinyBase app
extremely quickly.

PartyKit supports retries for clients that go offline, and so the disconnected
user experience is solid, out of the box. Learn more about configuring this
behavior [here](https://docs.partykit.io/reference/partysocket-api/#options).

Note, however, that this release is not yet a full CRDT implementation: there is
no clock synchronization and it is more 'every write wins' than 'last write
wins'. However, since the transmitted updates are at single cell (or value)
granularity, conflicts are minimized. More resilient replication is planned as
this integration matures.

---

# v4.2

This release adds support for persisting TinyBase to a browser's IndexedDB
storage. You'll need to import the new persister-indexed-db module, and call the
createIndexedDbPersister function to create the IndexedDB Persister.

The API is the same as for all the other Persister APIs:

```js
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';

store
  .setTable('pets', {fido: {species: 'dog'}})
  .setTable('species', {dog: {price: 5}})
  .setValues({open: true});
const indexedDbPersister = createIndexedDbPersister(store, 'petStore');

await indexedDbPersister.save();
// IndexedDB ->
//   database petStore:
//     objectStore t:
//       object 0:
//         k: "pets"
//         v: {fido: {species: dog}}
//       object 1:
//         k: "species"
//         v: {dog: {price: 5}}
//     objectStore v:
//       object 0:
//         k: "open"
//         v: true

await indexedDbPersister.destroy();
```

Note that it is not possible to reactively detect changes to a browser's
IndexedDB storage. A polling technique is used to load underlying changes if you
choose to 'autoLoad' your data into TinyBase.

This release also upgrades Prettier to v3.0 which has a peer-dependency impact
on the tools module. Please report any issues!

---

# v4.1

This release introduces the new ui-react-dom module. This provides pre-built
components for tabular display of your data in a web application.

![A TinyBase DOM Component](/ui-react-dom.webp 'A TinyBase DOM Component')

## New DOM Components

The following is the list of all the components released in v4.1:

| Component                    | Purpose                                                    |                                                           |
| ---------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| ValuesInHtmlTable            | Renders Values.                                            | [demo](/demos/ui-components/valuesinhtmltable)            |
| TableInHtmlTable             | Renders a Table.                                           | [demo](/demos/ui-components/tableinhtmltable)             |
| SortedTableInHtmlTable       | Renders a sorted Table, with optional interactivity.       | [demo](/demos/ui-components/sortedtableinhtmltable)       |
| SliceInHtmlTable             | Renders a Slice from an Index.                             | [demo](/demos/ui-components/sliceinhtmltable)             |
| RelationshipInHtmlTable      | Renders the local and remote Tables of a relationship      | [demo](/demos/ui-components/relationshipinhtmltable)      |
| ResultTableInHtmlTable       | Renders a ResultTable.                                     | [demo](/demos/ui-components/resulttableinhtmltable)       |
| ResultSortedTableInHtmlTable | Renders a sorted ResultTable, with optional interactivity. | [demo](/demos/ui-components/resultsortedtableinhtmltable) |
| EditableCellView             | Renders a Cell and lets you change its type and value.     | [demo](/demos/ui-components/editablecellview)             |
| EditableValueView            | Renders a Value and lets you change its type and value.    | [demo](/demos/ui-components/editablevalueview)            |

These pre-built components are showcased in the UI Components demos. Using them
should be very familiar if you have used the more abstract ui-react module:

```jsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import {SortedTableInHtmlTable} from 'tinybase/ui-react-dom';

const App = ({store}) => (
  <SortedTableInHtmlTable tableId="pets" cellId="species" store={store} />
);

store.setTables({
  pets: {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
  },
});
const app = document.createElement('div');
const root = createRoot(app);
root.render(<App store={store} />); // !act

console.log(app.innerHTML);
// ->
`
<table>
 <thead>
   <tr><th>Id</th><th class="sorted ascending">↑ species</th></tr>
 </thead>
 <tbody>
   <tr><th>felix</th><td>cat</td></tr>
   <tr><th>fido</th><td>dog</td></tr>
 </tbody>
</table>
`;

root.unmount(); // !act
```

The EditableCellView component and EditableValueView component are interactive
input controls for updating Cell and Value content respectively. You can
generally use them across your table views by adding the `editable` prop to your
table component.

## The new Inspector

![Inspector](/store-inspector.webp 'Inspector')

The new Inspector component allows you to view, understand, and edit the content
of a Store in a debug web environment. Try it out in most of the demos on the
site, including the Movie Database demo, pictured. This requires a debug build
of the new ui-react-dom module, which is now also included in the UMD
distribution.

Also in this release, the getResultTableCellIds method and
addResultTableCellIdsListener method have been added to the Queries object. The
equivalent useResultTableCellIds hook and useResultTableCellIdsListener hook
have also been added to ui-react module. A number of other minor React hooks
have been added to support the components above.

Demos have been updated to demonstrate the ui-react-dom module and the Inspector
component where appropriate.

(NB: Previous to v5.0, this component was called `StoreInspector`.)

---

# v4.0

This major release provides Persister modules that connect TinyBase to SQLite
databases (in both browser and server contexts), and CRDT frameworks that can
provide synchronization and local-first reconciliation:

| Module                   | Function                    | Storage                                                                            |
| ------------------------ | --------------------------- | ---------------------------------------------------------------------------------- |
| persister-sqlite3        | createSqlite3Persister      | SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)            |
| persister-sqlite-wasm    | createSqliteWasmPersister   | SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)     |
| persister-cr-sqlite-wasm | createCrSqliteWasmPersister | SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)           |
| persister-yjs            | createYjsPersister          | Yjs CRDTs, via [yjs](https://github.com/yjs/yjs)                                   |
| persister-automerge      | createSqliteWasmPersister   | Automerge CRDTs, via [automerge-repo](https://github.com/automerge/automerge-repo) |

See the Database Persistence guide for details on how to work with SQLite
databases, and the Synchronizing Data guide for more complex synchronization
with the CRDT frameworks.

## SQLite databases

You can persist Store data to a database with either a JSON serialization or
tabular mapping. (See the DatabasePersisterConfig documentation for more
details).

For example, this creates a Persister object and saves and loads the Store to
and from a local SQLite database. It uses an explicit tabular one-to-one mapping
for the 'pets' table:

```js
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {createSqliteWasmPersister} from 'tinybase/persisters/persister-sqlite-wasm';

const sqlite3 = await sqlite3InitModule();
const db = new sqlite3.oo1.DB(':memory:', 'c');
store.setTables({pets: {fido: {species: 'dog'}}});
const sqlitePersister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
});

await sqlitePersister.save();
console.log(db.exec('SELECT * FROM pets;', {rowMode: 'object'}));
// -> [{_id: 'fido', species: 'dog'}]

db.exec(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`);
await sqlitePersister.load();
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}

await sqlitePersister.destroy();
```

## CRDT Frameworks

CRDTs allow complex reconciliation and synchronization between clients. Yjs and
Automerge are two popular examples. The API should be familiar! The following
will persist a TinyBase Store to a Yjs document:

```js
import {createYjsPersister} from 'tinybase/persisters/persister-yjs';
import {Doc} from 'yjs';

store.setTables({pets: {fido: {species: 'dog'}}});

const doc = new Doc();
const yJsPersister = createYjsPersister(store, doc);

await yJsPersister.save();
// Store will be saved to the document.
console.log(doc.toJSON());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
await yJsPersister.destroy();
```

The following is the equivalent for an Automerge document that will sync over
the broadcast channel:

```js
import {Repo} from '@automerge/automerge-repo';
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
import {createAutomergePersister} from 'tinybase/persisters/persister-automerge';

const docHandler = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
}).create();
const automergePersister = createAutomergePersister(store, docHandler);

await automergePersister.save();
// Store will be saved to the document.
console.log(await docHandler.doc());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
await automergePersister.destroy();

store.delTables();
```

## New methods

There are three new methods on the Store object. The getContent method lets you
get the Store's Tables and Values in one call. The corresponding setContent
method lets you set them simultaneously.

The new setTransactionChanges method lets you replay TransactionChanges
(received at the end of a transaction via listeners) into a Store, allowing you
to take changes from one Store and apply them to another.

Persisters now provide a schedule method that lets you queue up asynchronous
tasks, such as when persisting data that requires complex sequences of actions.

## Breaking changes

The way that data is provided to the DoRollback and TransactionListener
callbacks at the end of a transaction has changed. Although previously they
directly received content about changed Cell and Value content, they now receive
functions that they can choose to call to receive that same data. This has a
performance improvement, and your callback or listener can choose between
concise TransactionChanges or more verbose TransactionLog structures for that
data.

If you have build a custom persister, you will need to update your
implementation. Most notably, the `setPersisted` function parameter is provided
with a `getContent` function to get the content from the Store itself, rather
than being passed pre-serialized JSON. It also receives information about the
changes made during a transaction. The `getPersisted` function must return the
content (or nothing) rather than JSON. `startListeningToPersisted` has been
renamed `addPersisterListener`, and `stopListeningToPersisted` has been renamed
`delPersisterListener`.

---

# v3.3

This release allows you to track the Cell Ids used across a whole Table,
regardless of which Row they are in.

In a Table (particularly in a Store without a TablesSchema), different Rows can
use different Cells. Consider this Store, where each pet has a different set of
Cell Ids:

```js
store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat', friendly: true},
  cujo: {legs: 4},
});
```

Prior to v3.3, you could only get the Cell Ids used in each Row at a time (with
the getCellIds method). But you can now use the getTableCellIds method to get
the union of all the Cell Ids used across the Table:

```js
console.log(store.getCellIds('pets', 'fido')); // previously available
// -> ['species']

console.log(store.getTableCellIds('pets')); //    new in v3.3
// -> ['species', 'friendly', 'legs']
```

You can register a listener to track the Cell Ids used across a Table with the
new addTableCellIdsListener method. Use cases for this might include knowing
which headers to render when displaying a sparse Table in a user interface, or
synchronizing data with relational or column-oriented database system.

There is also a corresponding useTableCellIds hook in the optional ui-react
module for accessing these Ids reactively, and a useTableCellIdsListener hook
for more advanced purposes.

Note that the bookkeeping behind these new accessors and listeners is efficient
and should not be slowed by the number of Rows in the Table.

This release also passes a getIdChanges function to every Id-related listener
that, when called, returns information about the Id changes, both additions and
removals, during a transaction. See the TableIdsListener type, for example.

```js
let listenerId = store.addRowIdsListener(
  'pets',
  (store, tableId, getIdChanges) => {
    console.log(getIdChanges());
  },
);

store.setRow('pets', 'lowly', {species: 'worm'});
// -> {lowly: 1}

store.delRow('pets', 'felix');
// -> {felix: -1}

store.delListener(listenerId).delTables();
```

---

# v3.2

This release lets you add a listener to the start of a transaction, and detect
that a set of changes are about to be made to a Store.

To use this, call the addStartTransactionListener method on your Store. The
listener you add can itself mutate the data in the Store.

From this release onwards, listeners added with the existing
addWillFinishTransactionListener method are also able to mutate data.
Transactions added with the existing addDidFinishTransactionListener method
_cannot_ mutate data.

```js
const startListenerId = store.addStartTransactionListener(() => {
  console.log('Start transaction');
  console.log(store.getTables());
  // Can mutate data
});

const willFinishListenerId = store.addWillFinishTransactionListener(() => {
  console.log('Will finish transaction');
  console.log(store.getTables());
  // Can mutate data
});

const didFinishListenerId = store.addDidFinishTransactionListener(() => {
  console.log('Did finish transaction');
  console.log(store.getTables());
  // Cannot mutate data
});

store.setTable('pets', {fido: {species: 'dog'}});
// -> 'Start transaction'
// -> {}
// -> 'Will finish transaction'
// -> {pets: {fido: {species: 'dog'}}}
// -> 'Did finish transaction'
// -> {pets: {fido: {species: 'dog'}}}

store
  .delListener(startListenerId)
  .delListener(willFinishListenerId)
  .delListener(didFinishListenerId);

store.delTables();
```

This release also fixes a bug where using the explicit startTransaction method
_inside_ another listener could create infinite recursion.

---

# v3.1

This new release adds a powerful schema-based type system to TinyBase.

If you define the shape and structure of your data with a TablesSchema or
ValuesSchema, you can benefit from an enhanced developer experience when
operating on it. For example:

```ts yolo
// Import the 'with-schemas' definition:
import {createStore} from 'tinybase/with-schemas';

// Set a schema for a new Store:
const store = createStore().setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
});

// Benefit from inline TypeScript errors.
store.setValues({employees: 3}); //                      OK
store.setValues({employees: true}); //                   TypeScript error
store.setValues({employees: 3, website: 'pets.com'}); // TypeScript error
```

The schema-based typing is used comprehensively throughout every module - from
the core Store interface all the way through to the ui-react module. See the new
Schema-Based Typing guide for instructions on how to use it.

This now means that there are _three_ progressive ways to use TypeScript with
TinyBase:

- Basic Type Support (since v1.0)
- Schema-based Typing (since v3.1)
- ORM-like type definitions (since v2.2)

These are each described in the new TinyBase And TypeScript guide.

Also in v3.1, the ORM-like type definition generation in the tools module has
been extended to emit ui-react module definitions.

Finally, v3.1.1 adds a `reuseRowIds` parameter to the addRow method and the
useAddRowCallback hook. It defaults to `true`, for backwards compatibility, but
if set to `false`, new Row Ids will not be reused unless the whole Table is
deleted.

---

# v3.0

This major new release adds key/value store functionality to TinyBase. Alongside
existing tabular data, it allows you to get, set, and listen to, individual
Value items, each with a unique Id.

```js
store.setValues({employees: 3, open: true});
console.log(store.getValues());
// -> {employees: 3, open: true}

listenerId = store.addValueListener(
  null,
  (store, valueId, newValue, oldValue) => {
    console.log(`Value '${valueId}' changed from ${oldValue} to ${newValue}`);
  },
);

store.setValue('employees', 4);
// -> "Value 'employees' changed from 3 to 4"

store.delListener(listenerId).delValues();
```

Guides and documentation have been fully updated, and certain demos - such as
the Todo App v2 (indexes) demo, and the Countries demo - have been updated to
use this new functionality.

If you use the optional ui-react module with TinyBase, v3.0 now uses and expects
React v18.

In terms of core API changes in v3.0, there are some minor breaking changes (see
below), but the majority of the alterations are additions.

The Store object gains the following:

- The setValues method, setPartialValues method, and setValue method, to set
  keyed value data into the Store.
- The getValues method, getValueIds method, and getValue method, to get keyed
  value data out of the Store.
- The delValues method and delValue method for removing keyed value data.
- The addValuesListener method, addValueIdsListener method, addValueListener
  method, and addInvalidValueListener method, for listening to changes to keyed
  value data.
- The hasValues method, hasValue method, and forEachValue method, for existence
  and enumeration purposes.
- The getTablesJson method, getValuesJson method, setTablesJson method, and
  setValuesJson method, for reading and writing tabular and keyed value data to
  and from a JSON string. Also see below.
- The getTablesSchemaJson method, getValuesSchemaJson method, setTablesSchema
  method, setValuesSchema method, delTablesSchema method, and delValuesSchema
  method, for reading and writing tabular and keyed value schemas for the Store.
  Also see below.

The following types have been added to the store module:

- Values, Value, and ValueOrUndefined, representing keyed value data in a Store.
- ValueListener and InvalidValueListener, to describe functions used to listen
  to (valid or invalid) changes to a Value.
- ValuesSchema and ValueSchema, to describe the keyed Values that can be set in
  a Store and their types.
- ValueCallback, MapValue, ChangedValues, and InvalidValues, which also
  correspond to their 'Cell' equivalents.

Additionally:

- The persisters' load method and startAutoLoad method take an optional
  `initialValues` parameter for setting Values when a persisted Store is
  bootstrapped.
- The Checkpoints module will undo and redo changes to keyed values in the same
  way they do for tabular data.
- The tools module provides a getStoreValuesSchema method for inferring
  value-based schemas. The getStoreApi method and getPrettyStoreApi method now
  also provides an ORM-like code-generated API for schematized key values.

All attempts have been made to provide backwards compatibility and/or easy
upgrade paths.

In previous versions, getJson method would get a JSON serialization of the
Store's tabular data. That functionality is now provided by the getTablesJson
method, and the getJson method instead now returns a two-part array containing
the tabular data and the keyed value data.

Similarly, the getSchemaJson method used to return the tabular schema, now
provided by the getTablesSchemaJson method. The getSchemaJson method instead now
returns a two-part array of tabular schema and the keyed value schema.

The setJson method used to take a serialization of just the tabular data object.
That's now provided by the setTablesJson method, and the setJson method instead
expects a two-part array containing the tabular data and the keyed value data
(as emitted by the getJson method). However, for backwards compatibility, if the
setJson method is passed an object, it _will_ set the tabular data, as it did
prior to v3.0.

Along similar lines, the setSchema method's previous behavior is now provided by
the setTablesSchema method. The setSchema method now takes two arguments, the
second of which is optional, also aiding backward compatibility. The delSchema
method removes both types of schema.

---

# v2.2

Note: The tools module has been removed in TinyBase v6.0.

This release includes a new tools module. These tools are not intended for
production use, but are instead to be used as part of your engineering workflow
to perform tasks like generating APIs from schemas, or schemas from data. For
example:

```js yolo
import {createTools} from 'tinybase/tools';

store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const tools = createTools(store);
const [dTs, ts] = tools.getStoreApi('shop');
```

This will generate two files:

```js yolo
// -- shop.d.ts --
/* Represents the 'pets' Table. */
export type PetsTable = {[rowId: Id]: PetsRow};
/* Represents a Row when getting the content of the 'pets' Table. */
export type PetsRow = {species: string};
//...

// -- shop.ts --
export const createShop: typeof createShopDecl = () => {
  //...
};
```

This release includes a new `tinybase` CLI tool which allows you to generate
Typescript definition and implementation files direct from a schema file:

```bash
npx tinybase getStoreApi schema.json shop api

    Definition: [...]/api/shop.d.ts
Implementation: [...]/api/shop.ts
```

Finally, the tools module also provides ways to track the overall size and
structure of a Store for use while debugging.

---

# v2.1

This release allows you to create indexes where a single Row Id can exist in
multiple slices. You can utilize this to build simple keyword searches, for
example.

Simply provide a custom getSliceIdOrIds function in the setIndexDefinition
method that returns an array of Slice Ids, rather than a single Id:

```js
import {createIndexes} from 'tinybase';

store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  rex: {species: 'dog'},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition('containsLetter', 'pets', (_, rowId) =>
  rowId.split(''),
);

console.log(indexes.getSliceIds('containsLetter'));
// -> ['f', 'i', 'd', 'o', 'e', 'l', 'x', 'r']
console.log(indexes.getSliceRowIds('containsLetter', 'i'));
// -> ['fido', 'felix']
console.log(indexes.getSliceRowIds('containsLetter', 'x'));
// -> ['felix', 'rex']
```

This functionality is showcased in the Word Frequencies demo if you would like
to see it in action.

---

# v2.0

**Announcing the next major version of TinyBase 2.0!** This is an exciting
release that evolves TinyBase towards becoming a reactive, relational data
store, complete with querying, sorting, and pagination. Here are a few of the
highlights...

## Query Engine

The [flagship feature](/guides/making-queries/using-queries/) of this release is
the new queries module. This allows you to build expressive queries against your
data with a SQL-adjacent API that we've cheekily called
[TinyQL](/guides/making-queries/tinyql/). The query engine lets you select,
join, filter, group, sort and paginate data. And of course, it's all reactive!

The best way to see the power of this new engine is with the two new demos we've
included this release:

![Thumbnail of demo](/car-analysis.webp 'Thumbnail of demo') The Car Analysis
demo showcases the analytical query capabilities of TinyBase v2.0, grouping and
sorting dimensional data for lightweight analytical usage, graphing, and tabular
display. _[Try this demo here](/demos/car-analysis/)._

![Thumbnail of demo](/movie-database.webp 'Thumbnail of demo') The Movie
Database demo showcases the relational query capabilities of TinyBase v2.0,
joining together information about movies, directors, and actors from across
multiple source tables. _[Try this demo here](/demos/movie-database/)._

## Sorting and Pagination

To complement the query engine, you can now sort and paginate Row Ids. This
makes it very easy to build grid-like user interfaces (also shown in the demos
above). To achieve this, the Store now includes the getSortedRowIds method (and
the addSortedRowIdsListener method for reactivity), and the Queries object
includes the equivalent getResultSortedRowIds method and
addResultSortedRowIdsListener method.

These are also exposed in the optional ui-react module via the useSortedRowIds
hook, the useResultSortedRowIds hook, the SortedTableView component and the
ResultSortedTableView component, and so on.

## Queries in the ui-react module

The v2.0 query functionality is fully supported by the ui-react module (to match
support for Store, Metrics, Indexes, and Relationship objects). The
useCreateQueries hook memoizes the creation of app- or component-wide Query
objects; and the useResultTable hook, useResultRow hook, useResultCell hook (and
so on) let you bind you component to the results of a query.

This is, of course, supplemented with higher-level components: the
ResultTableView component, the ResultRowView component, the ResultCellView
component, and so on. See the Building A UI With Queries guide for more details.

## It's a big release!

Thank you for all your support as we brought this important new release to life,
and we hope you enjoy using it as much as we did building it. Please provide
feedback via [GitHub](https://github.com/tinyplex/tinybase),
[Bluesky](https://bsky.app/profile/tinybase.bsky.social), and
[X](https://x.com/tinybasejs)!

---

# v1.3

Adds support for explicit transaction start and finish methods, as well as
listeners for transactions finishing.

The startTransaction method and finishTransaction method allow you to explicitly
enclose a transaction that will make multiple mutations to the Store, buffering
all calls to the relevant listeners until it completes when you call the
finishTransaction method.

Unlike the transaction method, this approach is useful when you have a more
'open-ended' transaction, such as one containing mutations triggered from other
events that are asynchronous or not occurring inline to your code. You must
remember to also call the finishTransaction method explicitly when the
transaction is started with the startTransaction method, of course.

```js
store.setTables({pets: {fido: {species: 'dog'}}});
store.addRowListener('pets', 'fido', () => console.log('Fido changed'));

store.startTransaction();
store.setCell('pets', 'fido', 'color', 'brown');
store.setCell('pets', 'fido', 'sold', true);
store.finishTransaction();
// -> 'Fido changed'
```

In addition, see the addWillFinishTransactionListener method and the
addDidFinishTransactionListener method for details around listening to
transactions completing.

Together, this release allows stores to couple their transaction life-cycles
together, which we need for the query engine.

Note: this API was updated to be more comprehensive in v4.0.

---

# v1.2

This adds a way to revert transactions if they have not met certain conditions.

When using the transaction method, you can provide an optional `doRollback`
callback which should return true if you want to revert the whole transaction at
its conclusion.

The callback is provided with two objects, `changedCells` and `invalidCells`,
which list all the net changes and invalid attempts at changes that were made
during the transaction. You will most likely use the contents of those objects
to decide whether the transaction should be rolled back.

Note: this API was updated to be more comprehensive in v4.0.

---

# v1.1

This release allows you to listen to invalid data being added to a Store,
allowing you to gracefully handle errors, rather than them failing silently.

There is a new listener type InvalidCellListener and a addInvalidCellListener
method in the Store interface.

These allow you to keep track of failed attempts to update the Store with
invalid Cell data. These listeners can also be mutators, allowing you to address
any failed writes programmatically.

For more information, please see the addInvalidCellListener method
documentation. In particular, this explains how this listener behaves for a
Store with a TablesSchema.
