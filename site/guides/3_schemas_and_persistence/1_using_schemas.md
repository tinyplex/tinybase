# Using Schemas

TablesSchemas are a simple declarative way to say what data you would like to
store in specific Cells in specific Tables.

A TablesSchema comprises a JavaScript object describing each Table, in turn a
nested JavaScript object containing information about each Cell and its
CellSchema. It is provided to the setTablesSchema method.

## Adding A TablesSchema

Typically you will want to set a TablesSchema prior to loading data into your
Store:

```js
const store = createStore().setTablesSchema({
  pets: {
    species: {type: 'string'},
    sold: {type: 'boolean', default: false},
  },
});
store.setRow('pets', 'fido', {species: 'dog', color: 'brown', sold: 'maybe'});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false}}}
```

In the above example, we indicated that the Store contains a single `pets`
Table, each Row of which has a `species` Cell (which needs to be a string) and a
`sold` Cell (which needs to be a boolean).

As you can see, when a Row is added that doesn't quite match those constraints,
the data is corrected. The `color` Cell is ignored, and the `sold` string is
corrected to the default `false` value.

In general, if a default value is provided (and its type is correct), you can be
certain that that Cell will always be present in a Row. If the default value is
_not_ provided (or its type is incorrect), the Cell may be missing from the Row.
But when it is present you can be guaranteed it is of the correct type.

## Altering A TablesSchema

You can also set or change the TablesSchema after data has been added to the
Store. Note that this may result in a change to data in the Store, as defaults
are applied or as invalid Table, Row, or Cell objects are removed. These changes
will fire any listeners to that data, as expected.

In this example, the TablesSchema gains a new required field that is added to
the current Row to make it compliant:

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    legs: {type: 'number', default: 4},
    sold: {type: 'boolean', default: false},
  },
});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 4}}}
```

The TablesSchema does not attempt to cast data. If a field needs to be of a
particular type, it really needs to be of that type:

```js
store.setCell('pets', 'fido', 'legs', '3');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 4}}}

store.setCell('pets', 'fido', 'legs', 3);
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 3}}}
```

## Be Aware Of Potential Data Loss

In order to guarantee that a TablesSchema is met, Cell values may be removed,
potentially resulting in the removal of a whole Row.

In this case, for example, the TablesSchema changes quite dramatically and none
of the Cells of the existing data match it, so the Row is deleted:

```js
store.setTablesSchema({
  pets: {
    color: {type: 'string'},
    weight: {type: 'number'},
  },
});
console.log(store.getTables());
// -> {}
```

When no longer needed, you can also completely remove an existing TablesSchema
with the delTablesSchema method.

## Summary

Adding a TablesSchema gives you a simple declarative way to describe your data
structure.

Sometimes, however, you may require more complex programmatic enforcement of
your data, and for that we turn to the Mutating Data With Listeners guide.
