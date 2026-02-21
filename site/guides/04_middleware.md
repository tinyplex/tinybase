# Middleware

This guide describes how to use the middleware module, which lets you register
callbacks that can manipulate operations made on data in a Store.

The main entry point to using the middleware module is the createMiddleware
function, which returns a new Middleware object. That object in turn has methods
that let you register callbacks for when specific operations are made on the
Store.

## The Basics

Here's a simple example to show a Middleware object in action. We create a
middleware callback that will be called whenever a single Value is set, and
makes sure that strings written to the Store are always uppercase:

```js
import {createMiddleware, createStore} from 'tinybase';

const store = createStore();

const middleware = createMiddleware(store);
middleware.addWillSetValueCallback((valueId, value) => {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
});

store.setValue('shopName', 'happy pets');
console.log(store.getValue('shopName'));
// -> 'HAPPY PETS'
```

## Available Callbacks

A Middleware object supports 14 different callbacks that you can register. Each
callback is passed relevant parameters for the operation, and can return a
value. The meaning of this return value depends on the type of callback:

* For `willSet*` callbacks (and `willApplyChanges`), the return value is used as
  the new value to be set in the Store (as in the upper-casing example above).
  If the function returns undefined (or void), the operation is cancelled.
* For `willDel*` callbacks, the return value is a boolean that indicates whether
  the delete operation should proceed (true) or be cancelled (false).

The full list of `willSet*` callbacks you can register is as follows:

| Callback         | Parameters                   | Called                       | Return               |
| ---------------- | ---------------------------- | ---------------------------- | -------------------- |
| willSetContent   | content                      | When setContent is called.   | Content or undefined |
| willSetTables    | tables                       | When setTables is called.    | Tables or undefined  |
| willSetTable     | tableId, table               | When setTable is called.     | Table or undefined   |
| willSetRow       | tableId, rowId, row          | When setRow is called.       | Row or undefined     |
| willSetCell      | tableId, rowId, cellId, cell | When setCell is called.      | Cell or undefined    |
| willSetValues    | values                       | When setValues is called.    | Values or undefined  |
| willSetValue     | valueId, value               | When setValue is called.     | Value or undefined   |
| willApplyChanges | changes                      | When applyChanges is called. | Changes or undefined |

The full list of `willDel*` callbacks you can register is as follows:

| Callback      | Parameters             | Called                    | Return  |
| ------------- | ---------------------- | ------------------------- | ------- |
| willDelTables |                        | When delTables is called. | boolean |
| willDelTable  | tableId                | When delTable is called.  | boolean |
| willDelRow    | tableId, rowId         | When delRow is called.    | boolean |
| willDelCell   | tableId, rowId, cellId | When delCell is called.   | boolean |
| willDelValues |                        | When delValues is called. | boolean |
| willDelValue  | valueId                | When delValue is called.  | boolean |

The callbacks are registered with the Middleware object using fluent methods
with the `add*` prefix:

```js
middleware
  .addWillSetContentCallback((content) => { /* ... */})
  .addWillSetTablesCallback((tables) => { /* ... */ });
// and so on for each callback type
```

## Callback Chaining And Cascade

When an operation is made on the Store, the relevant callback will be called. If
multiple callbacks are registered for the same operation, they will be called in
the order in which they were registered.

If a `willSet*` callback changes the value to be set, the next subsequent
`willSet*` callback will receive the new value (and so on). If a `willSet*`
callback cancels the operation, subsequent `willSet*` callbacks will not be
called. 

```js
middleware.addWillSetRowCallback((tableId, rowId, row) => {
  console.log('Timestamp row');
  return {...row, timestamp: Date.now()}; 
});
middleware.addWillSetRowCallback((tableId, rowId, row) => {
  console.log('Cancel setting row');
  return undefined; 
});
middleware.addWillSetRowCallback((tableId, rowId, row) => {
  console.log('Defaulting pet to be alive');
  return {...row, alive: true}; 
});

store.setRow('pets', 'fido', {'species': 'dog'});
// -> 'Timestamp row'
// -> 'Cancel setting row'
// (Callback 3 is not called because Callback 2 cancels the operation)

console.log(store.getTable('pets'));
// -> {}
```

Similarly, if a `willDel*` callback cancels the delete operation, subsequent
`willDel*` callbacks will not be called. In other words, a callback cannot
re-enable a delete operation that has been cancelled by a previous callback.

A less granular operation on the Store (e.g. setting a Table, which will call
`willSetTable`) will also then call more granular callbacks (e.g. `willSetRow`,
`willSetCell`) for each relevant Row and Cell. BUT a more granular operation
(e.g. setting a Cell, which will call `willSetCell`) will NOT call less granular
callbacks (e.g. `willSetRow`, `willSetTable`, `willSetContent` and so on).

This might seem strange since, in a way, the Row, Table, and Content were
technically being updated. But the key is to think about the actual method that
was called on the Store, and then expect callbacks for only more granular
elements from there.

## Complex Object Callbacks

Callbacks for Cell and Value operations (`willSetCell`, `willSetValue`) receive
primitive values directly. But callbacks for Row, Table, Tables, Content, and
Changes operations receive more complex objects — and the Store passes a deep
clone of the original data to the callback, not the original itself.

This means you can safely mutate the received object in place and return it, or
you can return a completely new object. Both approaches work:

```js
// Approach 1: return a new object
middleware.addWillSetRowCallback((tableId, rowId, row) => {
  return {...row, validated: true};
});

// Approach 2: mutate in place and return
middleware.addWillSetRowCallback((tableId, rowId, row) => {
  row.validated = true;
  return row;
});
```

Because the callback receives a clone, the original data passed to the Store
method is never mutated by the middleware regardless of which approach you use.

When middleware transforms a rich object (i.e. returns something other than what
it received), that change is applied as a mutation. This ensures the correct
reactive behavior: listeners will see the transformed data, and the change will
be tracked as a write in MergeableStore synchronization.

Note that there is a small cost to the cloning and mutation tracking for these
more complex types of callbacks, so if you have performance-sensitive code, you
might prefer to use the more granular Cell and Value callbacks where possible.

## Middleware And Listeners

Mutator listeners (that is, listeners registered with the `isMutator` flag set
to `true`) are allowed to write data back to the Store during a transaction.
Any writes made by a mutator listener will also pass through the middleware
pipeline:

```js
middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
  typeof cell === 'string' ? cell.toUpperCase() : cell,
);

store.addCellListener('pets', 'fido', 'name', (store) => {
  store.setCell('pets', 'fido', 'slug', 'from_listener');
}, true);

store.setCell('pets', 'fido', 'name', 'Rex');
console.log(store.getCell('pets', 'fido', 'name'));
// -> 'REX'
console.log(store.getCell('pets', 'fido', 'slug'));
// -> 'FROM_LISTENER'
```

In the example above, both the original `setCell` call and the listener's
`setCell` call pass through the uppercase middleware.

## Middleware And Schemas

The callbacks are called after the schema has been applied to the data. So, for
example, if your schema ignores a Cell that is being set because it was the
wrong type, the `willSetCell` callback will not be called:

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
  },
}); 

middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
  console.log('WillSetCellCallback');
  return cell;
});

store.setCell('pets', 'fido', 'species', 'dog');
// -> 'WillSetCellCallback'

store.setCell('pets', 'fido', 'species', 123);
// (no output, callback not called)
```

It is very important to note that there is no further schema validation again
_after_ the Middleware has been applied. Your Middleware callbacks are powerful!
And they need to be implicitly aware of the schema and ensure that they return
values that are compliant with it.

So, for example, if a Middleware callback returns a transformed value that is
the wrong type, that value will be set in the Store, which might lead to all
sorts of surprises.

That said, the power of Middleware is that it can be used to implement your own
custom validation, defaulting, and correction logic that is not easily captured
in a plain type-based schema. Just be aware of the relationship between
Middleware and schemas, and use that power wisely!

## When Middleware Is Not Called

There are two specific cases where Middleware callbacks will not be called:

* When `doRollback` returns true at the end of a Store transaction: the
  transaction will be rolled back and no callbacks will be called on the changes
  that are made to the data to return it to its previous state.
* When the Store is being updated from a checkpoint (using the checkpoint
  module): the changes from the checkpoint will be applied directly to the Store
  without calling any of the callbacks on the changes required to get it to the
  old 'undo' state or the new 'redo' state.

## Summary

Middleware gives you a powerful way to manipulate data coming into the Store,
and to cancel operations on the Store. It is important to understand the
chaining and cascade of callbacks, and to be aware of the relationship between
Middleware and schemas.

Now that you understand how to manipulate data coming into the Store, let's
learn how to save and load Store data. For that we proceed to the Persistence
guides.