# Releases

This is a reverse chronological list of the major TinyBase releases, with
highlighted features.

## v4.0

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

Take a look at the
[vite-tinybase-ts-react-crsqlite](https://github.com/tinyplex/vite-tinybase-ts-react-crsqlite)
template, for example, which demonstrates Vulcan's cr-sqlite to provide
persistence and synchronization via this technique.

### SQLite databases

You can persist Store data to a database with either a JSON serialization or
tabular mapping. (See the DatabasePersisterConfig documentation for more
details).

For example, this creates a Persister object and saves and loads the Store to
and from a local SQLite database. It uses an explicit tabular one-to-one mapping
for the 'pets' table:

```js
const sqlite3 = await sqlite3InitModule();
const db = new sqlite3.oo1.DB(':memory:', 'c');
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
});

await persister.save();
console.log(db.exec('SELECT * FROM pets;', {rowMode: 'object'}));
// -> [{_id: 'fido', species: 'dog'}]

db.exec(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`);
await persister.load();
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}

persister.destroy();
```

### CRDT Frameworks

CRDTs allow complex reconciliation and synchronization between clients. Yjs and
Automerge are two popular examples. The API should be familiar! The following will persist a TinyBase Store to a Yjs document:

```js
store.setTables({pets: {fido: {species: 'dog'}}});

const doc = new Y.Doc();
const yJsPersister = createYjsPersister(store, doc);

await yJsPersister.save();
// Store will be saved to the document.
console.log(doc.toJSON());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
yJsPersister.destroy();
```

The following is the equivalent for an Automerge document that will sync over
the broadcast channel:

```js
const docHandler = new AutomergeRepo.Repo({
  network: [new BroadcastChannelNetworkAdapter()],
}).create();
const automergePersister = createAutomergePersister(store, docHandler);

await automergePersister.save();
// Store will be saved to the document.
console.log(docHandler.doc);
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
automergePersister.destroy();

store.delTables();
```

### New methods

There are three new methods on the Store object. The getContent method lets you
get the Store's Tables and Values in one call. The corresponding setContent
method lets you set them simultaneously.

The new setTransactionChanges method lets you replay TransactionChanges
(received at the end of a transaction via listeners) into a Store, allowing you
to take changes from one Store and apply them to another.

Persisters now provide a schedule method that lets you queue up asynchronous
tasks, such as when persisting data that requires complex sequences of actions.

### Breaking changes

The way that data is provided to the DoRollback and TransactionListener
callbacks at the end of a transaction has changed. Where previously they
directly received content about changed Cell and Value content, they now
receive functions that they can choose to call to receive that same data. This
has a performance improvement, and your callback or listener can choose
between concise TransactionChanges or more verbose TransactionLog structures
for that data.

If you have build a custom persister, you will need to update your
implementation. Most notably, the `setPersisted` function parameter is
provided with a `getContent` function to get the content from the Store
itself, rather than being passed pre-serialized JSON. It also receives
information about the changes made during a transaction. The `getPersisted`
function must return the content (or nothing) rather than JSON.
`startListeningToPersisted` has been renamed `addPersisterListener`, and
`stopListeningToPersisted` has been renamed `delPersisterListener`.

## v3.3

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

## v3.2

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

## v3.1

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

These are each described in the new TinyBase and TypeScript guide.

Also in v3.1, the ORM-like type definition generation in the tools module has
been extended to emit ui-react module definitions.

Finally, v3.1.1 adds a `reuseRowIds` parameter to the addRow method and the
useAddRowCallback hook. It defaults to `true`, for backwards compatibility, but
if set to `false`, new Row Ids will not be reused unless the whole Table is
deleted.

## v3.0

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

Guides and documentation have been fully updated, and certain demos - such as the
Todo App v2 (indexes) demo, and the Countries demo - have been updated to use
this new functionality.

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

## v2.2

This release includes a new tools module. These tools are not intended for
production use, but are instead to be used as part of your engineering workflow
to perform tasks like generating APIs from schemas, or schemas from data. For
example:

```js
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

## v2.1

This release allows you to create indexes where a single Row Id can exist in
multiple slices. You can utilize this to build simple keyword searches, for
example.

Simply provide a custom getSliceIdOrIds function in the setIndexDefinition
method that returns an array of Slice Ids, rather than a single Id:

```js
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

## v2.0

**Announcing the next major version of TinyBase 2.0!** This is an exciting
release that evolves TinyBase towards becoming a reactive, relational data
store, complete with querying, sorting, and pagination. Here are a few of the
highlights...

### Query Engine

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

### Sorting and Pagination

To complement the query engine, you can now sort and paginate Row Ids. This
makes it very easy to build grid-like user interfaces (also shown in the demos
above). To achieve this, the Store now includes the getSortedRowIds method (and
the addSortedRowIdsListener method for reactivity), and the Queries object
includes the equivalent getResultSortedRowIds method and
addResultSortedRowIdsListener method.

These are also exposed in the optional ui-react module via the useSortedRowIds
hook, the useResultSortedRowIds hook, the SortedTableView component and
the ResultSortedTableView component, and so on.

### Queries in the ui-react module

The v2.0 query functionality is fully supported by the ui-react module (to match
support for Store, Metrics, Indexes, and Relationship objects). The
useCreateQueries hook memoizes the creation of app- or component-wide Query
objects; and the useResultTable hook, useResultRow hook, useResultCell hook (and
so on) let you bind you component to the results of a query.

This is, of course, supplemented with higher-level components: the
ResultTableView component, the ResultRowView component, the ResultCellView
component, and so on. See the Building A UI With Queries guide for more details.

### It's a big release!

Thank you for all your support as we brought this important new release to life,
and we hope you enjoy using it as much as we did building it. Please provide
feedback via [Github](https://github.com/tinyplex/tinybase) and
[Twitter](https://twitter.com/tinybasejs)!

## v1.3

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

## v1.2

This adds a way to revert transactions if they have not met certain conditions.

When using the transaction method, you can provide an optional `doRollback`
callback which should return true if you want to revert the whole transaction at
its conclusion.

The callback is provided with two objects, `changedCells` and `invalidCells`,
which list all the net changes and invalid attempts at changes that were made
during the transaction. You will most likely use the contents of those objects
to decide whether the transaction should be rolled back.

Note: this API was updated to be more comprehensive in v4.0.

## v1.1

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
