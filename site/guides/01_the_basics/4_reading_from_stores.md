# Reading From Stores

This guide shows you how to read data from a Store.

While we're here, notice how the the createStore function and setter methods
return the Store again, so we can easily instantiate it by chaining methods
together:

```js
import {createStore} from 'tinybase';

const store = createStore()
  .setValues({employees: 3, open: true})
  .setTables({
    pets: {fido: {species: 'dog'}},
    species: {dog: {price: 5}},
  });
```

To get the data out again, according to the level of the hierarchy that you want
to get data for, you can use the getValues method, the getValue method, the
getTables method, the getTable method, the getRow method, or the getCell method.

By now, this should be starting to look intuitive. (I hope so! If not, let me
know!)

```js
console.log(store.getValues());
// -> {employees: 3, open: true}

console.log(store.getValue('employees'));
// -> 3

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}}}

console.log(store.getTable('pets'));
// -> {fido: {species: 'dog'}}

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog'}

console.log(store.getCell('pets', 'fido', 'species'));
// -> 'dog'
```

It is worth noting that the return types of these methods are by value, not by
reference. So if you manipulate the returned object, the Store is not updated:

```js
const fido = store.getRow('pets', 'fido');
fido.color = 'brown';
console.log(fido);
// -> {species: 'dog', color: 'brown'}

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog'}
```

## Handling Non-Existent Data

The hasValue method, the hasTable method, the hasRow method, and the hasCell
method can be used to see whether a given object exists, without having to read
it:

```js
console.log(store.hasValue('website'));
// -> false

console.log(store.hasTable('customers'));
// -> false

console.log(store.hasRow('pets', 'fido'));
// -> true
```

When you try to access something that doesn't exist, you'll receive an
`undefined` value for a Value or Cell, or an empty object:

```js
console.log(store.getValue('website'));
// -> undefined

console.log(store.getTable('customers'));
// -> {}

console.log(store.getRow('pets', 'felix'));
// -> {}

console.log(store.getCell('pets', 'fido', 'color'));
// -> undefined
```

## Enumerating Ids

A Store contains Value and Table objects, keyed by Id. A Table contains Row
objects, keyed by Id. And a Row contains Cell objects, keyed by Id.

You can enumerate the Id keys for each with the getValueIds method, the
getTableIds method, the getRowIds method, or the getCellIds method - each of
which return arrays:

```js
console.log(store.getValueIds());
// -> ['employees', 'open']

console.log(store.getTableIds());
// -> ['pets', 'species']

console.log(store.getRowIds('pets'));
// -> ['fido']

console.log(store.getCellIds('pets', 'fido'));
// -> ['species']
```

There is also the getSortedRowIds method that lets you get the Ids sorted by a
specific Cell Id, and the getTableCellIds method that lets you get all the Ids
used across a whole Table.

Again, the return types of these methods are by value, not by reference. So if
you manipulate the returned array, the Store is not updated:

```js
const tableIds = store.getTableIds();
tableIds.pop();
console.log(tableIds);
// -> ['pets']

console.log(store.getTableIds());
// -> ['pets', 'species']
```

Finally, the forEachValue method, the forEachTable method, the forEachRow
method, and the forEachCell method each provide a convenient way to iterate over
these objects and their children in turn:

```js
store.forEachTable((tableId, forEachRow) => {
  console.log(tableId);
  forEachRow((rowId) => console.log(`- ${rowId}`));
});
// -> 'pets'
// -> '- fido'
// -> 'species'
// -> '- dog'
```

## Summary

So far, this should seem relatively straightforward. For more information on all
of these methods, you'll find a lot more in the Store documentation.

The reactive TinyBase magic starts to happen when we register listeners on the
Store so we don't have to keep explicitly fetching data.

For that, we proceed to the Listening To Stores guide.
