# Middleware

This guide describes how to use the middleware module, which lets you register
callbacks that can manipulate operations made on data in a Store.

The main entry point to using the middleware module is the createMiddleware
function, which returns a new Middleware object. That object in turn has methods
that let you register callbacks for when specific operations are made on the
Store.

## The Basics

Here's a simple example to show a Middleware object in action. We create a
middleware callback that will be called whenever a single Cell is set, and makes
sure that strings written to the Store are always uppercase:

```js
import {createMiddleware, createStore} from 'tinybase';

const store = createStore();

const middleware = createMiddleware(store);
middleware.setWillSetCellCallback((tableId, rowId, cellId, newValue) => {
  if (typeof newValue === 'string') {
    return newValue.toUpperCase();
  }
});

store.setCell('pets', 'fido', 'species', 'dog');
console.log(store.getCell('pets', 'fido', 'species'));
// -> 'DOG'

middleware.destroy();
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
| willDelTables | tableIds               | When delTables is called. | boolean |
| willDelTable  | tableId                | When delTable is called.  | boolean |
| willDelRow    | tableId, rowId         | When delRow is called.    | boolean |
| willDelCell   | tableId, rowId, cellId | When delCell is called.   | boolean |
| willDelValues | valueIds               | When delValues is called. | boolean |
| willDelValue  | valueId                | When delValue is called.  | boolean |

## Callback Chaining And Cascade

When an operation is made on the Store, the relevant callback will be called. If
multiple callbacks are registered for the same operation, they will be called in
the order in which they were registered.

If a `willSet*` callback changes the value to be set, the next subsequent
`willSet*` callback will receive the new value (and so on). If a `willSet*`
callback cancels the operation, subsequent `willSet*` callbacks will not be
called. 

```js
const middleware2 = createMiddleware(store);
middleware2.setWillSetCellCallback((tableId, rowId, cellId, cell) => {
  console.log('Callback 1');
  return cell + '!'; 
});
middleware2.setWillSetCellCallback((tableId, rowId, cellId, cell) => {
  console.log('Callback 2');
  return undefined; 
});
middleware2.setWillSetCellCallback((tableId, rowId, cellId, cell) => {
  console.log('Callback 3');
  return cell + '?'; 
});

store.setCell('pets', 'fido', 'species', 'dog');
// -> 'Callback 1'
// -> 'Callback 2'
// (Callback 3 is not called because Callback 2 cancels the operation)

console.log(store.getCell('pets', 'fido', 'species'));
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

## Middleware And Schemas

The middleware callbacks are called after the schema has been applied to the
data. So, for example, if your schema ignores a Cell that is being set because
it was the wrong type, the `willSetCell` callback will not be called:

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
  },
}); 

middleware.setWillSetCellCallback((tableId, rowId, cellId, cell) => {
  console.log('willSetCell called');
  return cell;
});

store.setCell('pets', 'fido', 'species', 'dog');
// -> 'willSetCell called'

store.setCell('pets', 'fido', 'species', 123);
// (no output, callback not called)
```

It is very important to note that there is no further schema validation again
_after_ the middleware has been applied. Your middleware callbacks are powerful!
And they need to be implicitly aware of the schema and ensure that they return
values that are compliant with it.

So, for example, if the middleware returns a transformed value that is the wrong
type, that value will be set in the Store, which might lead to all sorts of
surprises.

## Summary

Middleware gives you a powerful way to manipulate data coming into the Store,
and to cancel operations on the Store. It is important to understand the
chaining and cascade of callbacks, and to be aware of the relationship between
middleware and schemas.

Now that you understand how to manipulate data coming into the Store, let's
learn how to save and load Store data. For that we proceed to the Persistence
guides.