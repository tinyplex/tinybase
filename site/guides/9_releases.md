# Releases

This is a reverse chronological list of the major TinyBase releases, with
highlighted features.

## v2.0.0-beta

This is the beta for the next major version of TinyBase 2.0: "the one with
the query engine".

The new queries module allows you to build fully reactive queries with a
SQL-adjacent JavaScript API. The documentation and test suite for the query
system is complete, and an introductory example is
[here](/api/queries/interfaces/queries/queries/).

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
