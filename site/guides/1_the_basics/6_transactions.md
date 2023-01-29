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
regardless of the changes that happened in between. For example, if a Cell
had a value `'b'` and then, within a transaction, it was changed to `'b'`
and then `'c'`, any CellListener registered for that cell would be called
once as if there had been a single change from `'a'` to `'c'`:

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
to your satisfaction. It is called with `changedCells` and `invalidCells`
parameters, which inform you of the net changes that have been made during the
transaction, and any invalid attempts to do so, respectively.

This example makes multiple changes to the Store, including some attempts
to update a Cell with invalid values. The `doRollback` callback receives
information about the changes and invalid attempts, and then judges that
the transaction should be rolled back to its original state.

```js
store.transaction(
  () => {
    store.setCell('pets', 'fido', 'color', 'black');
    store.setCell('pets', 'fido', 'eyes', ['left', 'right']);
    store.setCell('pets', 'fido', 'buyer', {name: 'Bob'});
  },
  (changedCells, invalidCells) => {
    console.log(store.getTables());
    // -> {pets: {fido: {species: 'dog', color: 'black', sold: true}}}
    console.log(changedCells);
    // -> {pets: {fido: {color: ['brown', 'black']}}}
    console.log(invalidCells);
    // -> {pets: {fido: {eyes: [['left', 'right']], buyer: [{name: 'Bob'}]}}}
    return invalidCells['pets'] != null;
  },
);

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown', sold: true}}}
```

## Summary

We've covered all of the essential basics of working with a TinyBase Store, but
that's still just the start!

Next we will show how you can quickly build user interfaces on top of a Store,
and for that, it's time to proceed to the Building UIs guide.
