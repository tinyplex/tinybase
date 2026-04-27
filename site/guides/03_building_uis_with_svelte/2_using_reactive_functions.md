# Using Reactive Functions

Every reactive function in the ui-svelte module returns a reactive object with a
`current` property that automatically updates any part of your template that
reads it when the underlying Store data changes.

Here is the getCell function reading the color of a pet and displaying it in a
paragraph:

```svelte
<script>
  import {createStore} from 'tinybase';
  import {getCell} from 'tinybase/ui-svelte';

  const store = createStore().setCell('pets', 'fido', 'color', 'brown');
  const color = getCell('pets', 'fido', 'color', store);
</script>

<p>Color: {color.current}</p>
<!-- Renders: <p>Color: brown</p> -->
```

When the color cell is updated elsewhere in the application, the paragraph
immediately re-renders to show the new value. You don't need to add any manual
subscriptions, nor `$:` labels, nor `onDestroy` cleanup. The reactive object
registers and removes TinyBase listeners automatically using Svelte's reactivity
lifecycle.

There are reactive functions corresponding to every Store reading method. For
example:

| TinyBase Store         | Svelte Reactive Function |
| ---------------------- | ------------------------ |
| getValues method       | getValues function       |
| getValueIds method     | getValueIds function     |
| getValue method        | getValue function        |
| getTables method       | getTables function       |
| getTableIds method     | getTableIds function     |
| getTable method        | getTable function        |
| getRowIds method       | getRowIds function       |
| getSortedRowIds method | getSortedRowIds function |
| getRow method          | getRow function          |
| getCellIds method      | getCellIds function      |
| getCell method         | getCell function         |

There are also reactive functions for the derived TinyBase data or objects.
Examples include the getMetric function, getSliceRowIds function, or
getResultTable function, and so on.

Functions that access higher-level TinyBase objects, like the getStore
function, getMetrics function, and getQueries function, are different: rather
than returning a reactive object, they return TinyBase objects directly from a
Provider context.

## Listener Functions

The module also includes listener functions such as onCell, onRowIds, or
onStartTransaction. These are the side-effect-oriented counterpart to the
reactive functions: use them when you need to run code in response to TinyBase
changes, rather than read a `current` value in the template.

Most UI rendering can be built with reactive functions and view components
alone. You should only need listener functions when you need behavior such as
logging, analytics, imperative synchronization, or other non-render side
effects.

## Reactive Parameters With MaybeGetter

All function parameters accept either a plain value or a reactive getter
function. This is the `MaybeGetter<T>` type: `T | (() => T)`.

Passing a getter function that reads a `$state` variable makes the function
reactively track which data it fetches. In this example, `rowId` is a prop and
the function re-fetches automatically when it changes:

```svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  let {rowId, store} = $props();
  const color = getCell('pets', () => rowId, 'color', store);
</script>

<p>{color.current}</p>
```

Without the `() => rowId` wrapper, changing the `rowId` prop would not cause the
function to re-read the Store for the new row.

## Writable State With `getCell`

The `getCell` and `getValue` functions expose a writable `current` property for
scalar values. Writing to it calls `store.setCell()` or `store.setValue()`. This
makes Svelte's `bind:value` directive work for two-way binding:

```svelte
<script>
  import {createStore} from 'tinybase';
  import {getCell} from 'tinybase/ui-svelte';

  const store = createStore().setCell('pets', 'fido', 'color', 'brown');
  const color = getCell('pets', 'fido', 'color', store);
</script>

<input bind:value={color.current} />
<p>Current color: {color.current}</p>
```

Typing in the `<input>` updates the Store, which is immediately reflected in the
paragraph without any additional event handling.

## Summary

The reactive functions in the ui-svelte module make it easy to connect your user
interface to TinyBase Store data, while listener functions let you handle
side-effects declaratively. Next, let's look at the view components in the Using
Svelte Components guide.
