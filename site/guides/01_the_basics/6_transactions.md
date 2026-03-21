# Transactions

This guide shows you how to wrap multiple changes to the data in a Store.

A transaction is a sequence of changes made to a Store. No listeners will be
fired until the full transaction is complete. This is a useful way to debounce
listener side-effects and ensure that you are only responding to net changes.
Changes are made silently during the transaction, and listeners relevant to the
changes you have made will instead only be called when the whole transaction is
complete.

A transaction can also be rolled back and the original state of the Store will
be restored.

## Creating Transactions

The transaction method takes a function that makes multiple mutations to the
store, buffering all calls to the relevant listeners until it completes.

```js
import {createStore} from 'tinybase';

const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const listenerId = store.addRowListener('pets', 'fido', () =>
  console.log('Fido changed'),
);

// Multiple changes, not in a transaction
store.setCell('pets', 'fido', 'color', 'brown');
store.setCell('pets', 'fido', 'sold', false);
// -> 'Fido changed'
// -> 'Fido changed'

// Multiple changes in a transaction
store.transaction(() => {
  store.setCell('pets', 'fido', 'color', 'walnut');
  store.setCell('pets', 'fido', 'sold', true);
});
// -> 'Fido changed'

store.delListener(listenerId);
```

If multiple changes are made to a piece of Store data throughout the
transaction, a relevant listener will only be called with the final value
(assuming it is different to the value at the start of the transaction),
regardless of the changes that happened in between. For example, if a Cell had a
value `'a'` and then, within a transaction, it was changed to `'b'` and then
`'c'`, any CellListener registered for that cell would be called once as if
there had been a single change from `'a'` to `'c'`:

```js
const listenerId2 = store.addCellListener(
  'pets',
  'fido',
  'color',
  (store, tableId, rowId, cellId, newCell) =>
    console.log(`Fido color changed to ${newCell}`),
);

store.transaction(() => {
  store.setCell('pets', 'fido', 'color', 'black');
  store.setCell('pets', 'fido', 'color', 'brown');
});
// -> 'Fido color changed to brown'

store.delListener(listenerId2);
```

Note that transactions can be nested. Relevant listeners will be called only
when the outermost one completes.

## Rolling Back Transactions

The transaction method takes a second optional parameter, `doRollback`. This is
a callback that you can use to rollback the transaction if it did not complete
to your satisfaction.

This example makes multiple changes to the Store, including some attempts to
update a Cell with invalid values. The `doRollback` callback fetches information
about the changes and invalid attempts, and then judges that the transaction
should be rolled back to its original state.

```js
store.transaction(
  () => {
    store.setCell('pets', 'fido', 'color', 'black');
    store.setCell('pets', 'fido', 'eyes', new Date(0));
    store.setCell('pets', 'fido', 'buyer', new Date(1));
  },
  () => {
    const [, , changedCells, invalidCells] = store.getTransactionLog();
    console.log(store.getTables());
    // -> {pets: {fido: {species: 'dog', color: 'black', sold: true}}}
    console.log(changedCells);
    // -> {pets: {fido: {color: ['brown', 'black']}}}
    console.log(invalidCells);
    // -> {pets: {fido: {eyes: [new Date(0)], buyer: [new Date(1)]}}}
    return invalidCells['pets'] != null;
  },
);

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown', sold: true}}}
```

## Listening to transactions

You can register listeners to the start and finish of a transaction. There are
three points in its lifecycle:

| Event      | Add a listener with              | When                                      | Can mutate data |
| ---------- | -------------------------------- | ----------------------------------------- | --------------- |
| Start      | addStartTransactionListener      | Before changes                            | Yes             |
| WillFinish | addWillFinishTransactionListener | After changes and other mutator listeners | Yes             |
| DidFinish  | addDidFinishTransactionListener  | After non-mutator listeners               | No              |

For example:

```js
store.delTables();

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
```

## Transaction Lifecycle

Since TinyBase now has multiple phases around a transaction, it helps to think
of one complete transaction in this order:

1. The transaction starts.
2. `startTransaction` listeners fire (as added with the
   addStartTransactionListener method).
3. Your transaction actions run.
4. For each attempted write in those actions, middleware callbacks run first (as
   added with the addWillSetRow method, for example).
5. Changes are buffered in the transaction log; non-mutating listeners are not
   called yet.
6. Mutating listeners fire for net changes and invalid attempts (as added with
   the addRowListener method, for example, with the final `mutator` flag set).
7. Any writes made by mutating listeners also go through middleware, but do not
   trigger mutating listeners again.
8. If provided to the transaction method or the startTransaction method,
   `doRollback` runs with the transaction log after all mutating listeners and
   their writes.
9. If `doRollback` returns `true`, TinyBase rolls back the transaction changes.
10. `willFinish` transaction listeners fire (as added with the
    addWillFinishTransactionListener method).
11. Non-mutating listeners fire for the final committed result (if the
    transaction has not rolled back).
12. `didFinish` transaction listeners fire (as added with the
    addDidFinishTransactionListener method).

If transactions are nested, this full lifecycle only happens when the outermost
transaction finishes.

## Summary

We've covered all of the essential basics of working with a TinyBase Store, but
that's still just the start!

Before we move on, we have a quick aside about how to use various flavors of
TinyBase in your app, in the Importing TinyBase guide.
