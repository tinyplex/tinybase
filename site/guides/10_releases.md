# Releases

This is a reverse chronological list of the major TinyBase releases, with
highlighted features.

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
const store = createStore().setValues({employees: 3, open: true});
console.log(store.getValues());
// -> {employees: 3, open: true}

const listenerId = store.addValueListener(
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
prior to v3.0.0.

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

## v1.3.0

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

```js
store.addWillFinishTransactionListener((store, cellsTouched) =>
  console.log(`Cells touched: ${cellsTouched}`),
);

store.transaction(() => store.setCell('pets', 'fido', 'species', 'dog'));
// -> 'Cells touched: false'

store.transaction(() => store.setCell('pets', 'fido', 'color', 'walnut'));
// -> 'Cells touched: true'
// -> 'Fido changed'
```

Together, this release allows stores to couple their transaction life-cycles
together, which we need for the query engine.

## v1.2.0

This adds a way to revert transactions if they have not met certain conditions.

When using the transaction method, you can provide an optional `doRollback`
callback which should return true if you want to revert the whole transaction at
its conclusion.

The callback is provided with two objects, `changedCells` and `invalidCells`,
which list all the net changes and invalid attempts at changes that were made
during the transaction. You will most likely use the contents of those objects
to decide whether the transaction should be rolled back.

## v1.1.0

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
