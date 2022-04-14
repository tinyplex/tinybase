# Writing To Stores

This guide shows you how to write data to a Store.

A Store has a simple hierarchical structure:

- The Store contains a number of Table objects.
- Each Table contains a number of Row objects.
- Each Row contains a number of Cell objects.

Once you have created a store, you can write data to it with one of its setter
methods, according to the level of the hierarchy that you want to set.

For example, you can set the data for the entire Store with the setTables
method:

```js
const store = createStore();
store.setTables({pets: {fido: {species: 'dog'}}});
```

Hopefully self-evidently, this sets a whole Store to have one Table object
(called `pets`), containing one Row object (called `fido`), containing one Cell
object (called `species` and with the string value `dog`):

```js
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

You can also alter Store data at different granularities with the setTable
method, the setRow method, and the setCell method:

```js
store.setTable('species', {dog: {price: 5}});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}}}

store.setRow('species', 'cat', {price: 4});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}, cat: {price: 4}}}

store.setCell('pets', 'fido', 'color', 'brown');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}, species: {dog: {price: 5}, cat: {price: 4}}}
```

A Cell can be a string, a number, or a boolean value.

It's worth mentioning here that there are two extra methods to manipulate Row
objects. The addRow method is like the setRow method but automatically assigns
it a new unique Id. And the setPartialRow method lets you update multiple Cell
values in a Row without affecting the others.

## Deleting Data

There are dedicated deletion methods (again, for each level of granularity),
such as the delTable method, the delRow method, and the delCell method. For
example:

```js
store.delTable('species');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}}
```

Deletions are also implied when you set an object that omits something that
existed before:

```js
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}}

store.setRow('pets', 'fido', {species: 'dog'});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}}
// The `color` Cell has been deleted.
```

Table and Row objects cannot be empty - if they are, they are removed - which
leads to a cascading effect when you remove the final child of a parent object:

```js
store.delCell('pets', 'fido', 'species');
console.log(store.getTables());
// -> {}
// The `fido` Row and `pets` Table have been recursively deleted.
```

## Summary

That's a quick overview on how to write data to a Store. But of course you want
to get it out too!

In the examples above, we've used the getTables method to get a view of all the
data in the Store. Unsurprisingly, you can also use more granular methods to get
data out - for which we proceed to the Reading From Stores guide.
