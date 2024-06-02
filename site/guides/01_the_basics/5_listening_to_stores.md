# Listening To Stores

This guide shows you how to listen to changes in the data in a Store.

By now, you'll have noticed that there are always consistent methods for each
level of the Store hierarchy, and the way you register listeners is no
exception:

- Listen to Values with the addValuesListener method.
- Listen to Value Ids with the addValueIdsListener method.
- Listen to a Value with the addValueListener method.

And for tabular data:

- Listen to Tables with the addTablesListener method.
- Listen to Table Ids with the addTableIdsListener method.
- Listen to a Table with the addTableListener method.
- Listen to Cells Ids across a Table with the addTableCellIdsListener method.
- Listen to Row Ids with the addRowIdsListener method.
- Listen to sorted Row Ids with the addSortedRowIdsListener method.
- Listen to a Row with the addRowListener method.
- Listen to Cell Ids with the addCellIdsListener method.
- Listen to a Cell with the addCellListener method.

You can also listen to attempts to write invalid data to a Value with the
addInvalidValueListener method, and to a Cell with the addInvalidCellListener
method.

Let's start with the simplest type of listener, addTablesListener, which listens
to changes to any tabular data in the Store. Firstly, let's set up some simple
data:

```js
import {createStore} from 'tinybase';

const store = createStore().setTables({
  pets: {fido: {species: 'dog'}},
  species: {dog: {price: 5}},
});
```

We can then use the addTablesListener method to register a function on the Store
that will be called whenever the data in the Store changes:

```js
const listenerId = store.addTablesListener(() =>
  console.log('Tables changed!'),
);
```

Let's test it out by updating a Cell in the Store:

```js
store.setCell('species', 'dog', 'price', 6);
// -> 'Tables changed!'
```

The listener will be called, regardless of which type of setter method was used
to make the change. But a change needs to have been made! If a setter method was
used to no effect, the listener is not called:

```js
store.setCell('pets', 'fido', 'species', 'dog');
// Since the data didn't actually change, the listener was not called.
```

It is important to note that by default, you can't mutate the Store with code
inside a listener, and attempting to do so will fail silently. We cover how to
mutate the Store from with in a listener (in order to adhere to a TablesSchema,
for example) in the Mutating Data With Listeners guide.

## Cleaning Up Listeners

You will have noticed that the addTablesListener method didn't return a
reference to the Store object (so you can't chain other methods after it), but
an Id representing the registration of that listener.

You can use that Id to remove the listener at a later stage with the delListener
method:

```js
store.delListener(listenerId);
store.setCell('species', 'dog', 'price', 7);
// Listener has been unregistered and so is not called.
```

It's good habit to remove the listeners you are no longer using. Note that
listener Ids are commonly re-used, so you have removed a listener with a given
Id, don't try to use that Id again.

## Listener Parameters

In the example above, we registered a listener that didn't take any parameters.
However, all Store listeners are called with at least a reference to the Store,
and often a convenient `getCellChange` function that lets you inspect changes
that might have happened:

```js
const listenerId2 = store.addTablesListener((store, getCellChange) =>
  console.log(getCellChange('species', 'dog', 'price')),
);

store.setCell('species', 'dog', 'price', 8);
// -> [true, 7, 8]

store.delListener(listenerId2);
```

See the addTablesListener method documentation for more information on these
parameters.

When you listen to changes down inside a Store (with more granular listeners),
you will also be passed Id parameters reflecting what changed.

For example, here we register a listener on the `fido` Row in the `pets` Table:

```js
const listenerId3 = store.addRowListener(
  'pets',
  'fido',
  (store, tableId, rowId) =>
    console.log(`${rowId} row in ${tableId} table changed`),
);

store.setCell('pets', 'fido', 'color', 'brown');
// -> 'fido row in pets table changed'

store.delListener(listenerId3);
```

When you register a CellListener listener with the addCellListener method, that
also receives parameters containing the old and new Cell values.

## Wildcard Listeners

The fact that the listeners are passed parameters for what changed becomes very
useful when you register wildcard listeners. These listen to changes at a
particular part of the Store hierarchy but not necessarily to a specific object.

So for example, you can listen to changes to any Row in a given Table. To
wildcard what you want to listen to, simply use `null` in place of an Id
argument when you add a listener:

```js
const listenerId4 = store.addRowListener(null, null, (store, tableId, rowId) =>
  console.log(`${rowId} row in ${tableId} table changed`),
);

store.setCell('pets', 'fido', 'color', 'walnut');
// -> 'fido row in pets table changed'

store.setCell('species', 'dog', 'price', '9');
// -> 'dog row in species table changed'

store.delListener(listenerId4);
```

You can intermingle wildcards and actual Id values for any of the parameters.
So, for example, you could listen to the Cell values with a given Id in any Row
in a given Table, and so on.

Note that you can't use the wildcard technique with the addSortedRowIdsListener
method. You must explicitly specify just one Table, for performance reasons.

## Summary

We've now seen how to create a Store, set data in it, read it back out, and set
up listeners to detect whenever it changes. Finally we'll cover how to wrap
multiple changes together, in the Transactions guide.
