# Mutating Data With Listeners

Although listeners are normally prevented from updating data, there are times
when you may want to - such as when you are programmatically checking your data
as it gets updated.

## Configuring Listeners

By default, listeners cannot update data. For instance, you might imagine that
this code will replace 'walnut' with 'brown' when the `color` Cell is updated.
But in fact the correction will fail silently:

```js
import {createStore} from 'tinybase';

const store = createStore();
store.setRow('pets', 'fido', {species: 'dog', color: 'black'});

const colorListenerId = store.addCellListener(
  'pets',
  null,
  'color',
  (store, tableId, rowId, cellId, newCell) => {
    if (newCell == 'walnut') {
      store.setCell(tableId, rowId, cellId, 'brown');
    }
  },
);

store.setCell('pets', 'fido', 'color', 'walnut');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'walnut'}}}

store.delListener(colorListenerId);
```

## Mutator Listeners

To indicate that a listener is a 'mutator' (meaning that you are willing to
allow it to change data), simply set the `mutator` flag to true on the method
that adds the listener to the Store.

In this example, the Cell value must be one of the known species, or else it is
set to 'unknown':

```js
const SPECIES = ['unknown', 'dog', 'cat', 'worm'];
store.addCellListener(
  'pets',
  null,
  'species',
  (store, tableId, rowId, cellId, newCell) => {
    if (!SPECIES.includes(newCell)) {
      store.setCell(tableId, rowId, cellId, SPECIES[0]);
    }
  },
  true, // This listener is permitted to mutate the Store.
);

store.setCell('pets', 'fido', 'species', 'worm');
console.log(store.getTables());
// -> {pets: {fido: {species: 'worm', color: 'walnut'}}}

store.setCell('pets', 'fido', 'species', 'wolf');
console.log(store.getTables());
// -> {pets: {fido: {species: 'unknown', color: 'walnut'}}}
```

Note that all the listeners that are marked as mutators will run _before_ all of
those that are not. This means you can be sure that when your read-only
listeners fire, the data within the Store has already been been fully
manipulated to your liking.

## Summary

We have now effectively implemented a programmatic schema, one which is capable
of ensuring values are valid, and defaulting them to something else if not.

This same technique can also constrain numeric Cell values to valid ranges, for
example - and even potentially have Cell values which are constrained by other
Cell values (though note that this needs to be done carefully to avoid expensive
or impossible constraint solutions).

One common circumstance for creating a TablesSchema for a Store is when you are
loading data from a source and you want to ensure the data is sculpted as your
application require. But how do you save and load Store data? For that we
proceed to the Persisting Data guide.
