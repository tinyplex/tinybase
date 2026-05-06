# Using Solid Primitives

The primitives in the ui-solid module return Solid Accessor functions for
reactive TinyBase data. Calling the Accessor reads the current value, and any
Solid computation that calls it will update when the underlying Store data
changes.

Here is the useCell primitive reading the color of a pet:

```tsx
import {createRoot} from 'solid-js';
import {createStore} from 'tinybase';
import {useCell, useSetCellCallback, useTable} from 'tinybase/ui-solid';

const store = createStore().setCell('pets', 'fido', 'color', 'brown');

createRoot((dispose) => {
  const color = useCell('pets', 'fido', 'color', store);
  console.log(color());
  // -> 'brown'

  store.setCell('pets', 'fido', 'color', 'walnut');
  console.log(color());
  // -> 'walnut'
  dispose();
});
```

There are primitives that correspond to each of the Store getter methods:

- The useValues primitive is the reactive equivalent of the getValues method.
- The useValueIds primitive is the reactive equivalent of the getValueIds method.
- The useValue primitive is the reactive equivalent of the getValue method.

And for tabular data:

- The useTables primitive is the reactive equivalent of the getTables method.
- The useTableIds primitive is the reactive equivalent of the getTableIds method.
- The useTable primitive is the reactive equivalent of the getTable method.
- The useTableCellIds primitive is the reactive equivalent of the
  getTableCellIds method.
- The useRowIds primitive is the reactive equivalent of the getRowIds method.
- The useSortedRowIds primitive is the reactive equivalent of the
  getSortedRowIds method.
- The useRow primitive is the reactive equivalent of the getRow method.
- The useCellIds primitive is the reactive equivalent of the getCellIds method.
- The useCell primitive is the reactive equivalent of the getCell method.

They have the same value types, wrapped in Accessors. For example, the useTable
primitive returns an Accessor for a Table object:

```tsx
createRoot((dispose) => {
  const table = useTable('pets', store);
  console.log(JSON.stringify(table()));
  // -> '{"fido":{"color":"walnut"}}'

  store.setCell('pets', 'fido', 'species', 'dog');
  console.log(JSON.stringify(table()));
  // -> '{"fido":{"color":"walnut","species":"dog"}}'
  dispose();
});
```

When the owner that created a primitive is disposed, the listener registered
with TinyBase is removed automatically. This keeps Store subscriptions aligned
with Solid's lifecycle.

## Using Primitives To Set Data

In an interactive application, you don't just want to read data. You also want
to be able to set it in response to user's actions. For this purpose, there is a
group of primitives that return callbacks for setting data based on events.

This example uses the useSetCellCallback primitive to update a Cell:

```tsx
createRoot((dispose) => {
  const sold = useCell('pets', 'fido', 'sold', store);
  const sell = useSetCellCallback('pets', 'fido', 'sold', () => true, store);

  sell();
  console.log(sold());
  // -> true
  dispose();
});
```

## Reactive Parameters With MaybeAccessor

Many ui-solid primitives accept either a plain value or a Solid Accessor
function. This is the MaybeAccessor type.

Passing an Accessor is the idiomatic way to connect primitive arguments to
changing props or signals. For example, a component can pass `() => props.rowId`
as the Row Id so the primitive re-reads the Store when the prop changes.

## Summary

The primitives in the ui-solid module make it easy to connect Solid reactivity
to TinyBase Store data, while callback and listener primitives let you handle
mutations and side-effects. Next, let's look at the view components in the
Using Solid Components guide.
