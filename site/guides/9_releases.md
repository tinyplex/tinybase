# Releases

This is a reverse chronological list of the major TinyBase releases, with
highlighted features.

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
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
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
Store with a Schema.
