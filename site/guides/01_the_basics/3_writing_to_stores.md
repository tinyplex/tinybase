# Writing To Stores

This guide shows you how to write data to a Store.

A Store has two types of data in it: keyed values ('Values'), and tabular data
('Tables').

Values are just Id/Value pairs. Tables on the other hand, have a simple
hierarchical structure:

- The Store's Tables object contains a number of Table objects.
- Each Table contains a number of Row objects.
- Each Row contains a number of Cell objects.

Once you have created a Store, you can write data to it with one of its setter
methods, according to the level of the hierarchy that you want to set.

For example, you can set the data for the keyed value structure of Store with the setValues
method:

```js
import {createStore} from 'tinybase';

const store = createStore();
store.setValues({employees: 3, open: true});
```

Similarly, you can set the data for the tabular structure of Store with the setTables
method:

```js
store.setTables({pets: {fido: {species: 'dog'}}});
```

Hopefully self-evidently, this sets the Store to have two Values (`employees`
and `open`, which are `3` and `true` respectively). It also has one Table object
(called `pets`), containing one Row object (called `fido`), containing one Cell
object (called `species` and with the string value `dog`):

```js
console.log(store.getValues());
// -> {employees: 3, open: true}

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

You can also alter Store data at different granularities with the setValue
method, the setTable method, the setRow method, and the setCell method:

```js
store.setValue('employees', 4);
console.log(store.getValues());
// -> {employees: 4, open: true}

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

The data in a Value or a Cell can be a string, a number, or a boolean type.

It's worth mentioning here that there are two extra methods to manipulate Row
objects. The addRow method is like the setRow method but automatically assigns
it a new unique Id. And the setPartialRow method lets you update multiple Cell
values in a Row without affecting the others. (setPartialValues does the same
for Values.)

## Deleting Data

There are dedicated deletion methods (again, for each level of granularity),
such as the delValue method, the delTable method, the delRow method, and the
delCell method. For example:

```js
store.delValue('employees');
console.log(store.getValues());
// -> {open: true}

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
to get it out again too!

In the examples above, we've used the getValues method and the getTables method
to get a view into the data in the Store. Unsurprisingly, you can also use more
granular methods to get data out - for which we proceed to the Reading From
Stores guide.
