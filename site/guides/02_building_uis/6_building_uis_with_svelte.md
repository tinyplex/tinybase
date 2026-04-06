# Building UIs With Svelte

This guide describes how to use the ui-svelte module to build reactive user
interfaces in Svelte 5 applications.

If you want to see the same ideas in a runnable site demo, take a look at the
Hello World (Svelte) demo.

For a fuller example using indexes and persistence, see the Countries (Svelte)
demo.

It is the Svelte counterpart to the ui-react module. Where ui-react exposes
hooks and component override props, ui-svelte exposes reactive functions,
listener functions, and view components that are customized with named
snippets.

## Reactive Functions

Every reactive function in the ui-svelte module returns a reactive object with a
`current` property. Any part of your template that reads it will automatically
update when the underlying Store data changes.

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

Functions that access higher-level TinyBase objects - like the getStore
function, getMetrics function, and getQueries function - are different: rather
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
paragraph — without any additional event handling.

## Context With Provider

For larger apps, passing the `store` object to every function as the last
argument gets repetitive. The Provider component sets a context that all
descendant functions use automatically when no explicit reference is given:

```svelte
<!-- App.svelte -->
<script>
  import {createStore} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import Pane from './Pane.svelte';

  const store = createStore().setTables({
    pets: {fido: {species: 'dog', color: 'brown'}},
  });
</script>

<Provider {store}>
  <Pane />
</Provider>
```

```svelte
<!-- Pane.svelte -->
<script>
  import {getCell} from 'tinybase/ui-svelte';

  // No store argument; resolved automatically from the nearest Provider
  const species = getCell('pets', 'fido', 'species');
  const color = getCell('pets', 'fido', 'color');
</script>

<p>{species.current} ({color.current})</p>
```

`Provider` accepts `store`, `storesById`, `metrics`, `metricsById`, and
equivalent props for every TinyBase object type. When multiple stores are
provided, functions reference them by Id:

```svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  const color = getCell('pets', 'fido', 'color', 'petStore');
</script>
```

Descendant components can register additional objects into the nearest Provider
context at runtime using the provideStore function, the provideMetrics function,
and similar.

Provider components can also be nested. Their contexts merge in the same spirit
as the ui-react module Provider, so outer defaults and named objects remain
visible unless a nearer Provider replaces them.

## View Components

For common rendering tasks, the module provides pre-built view components that
wrap the reactive functions and render data directly. These make it easy to
compose UIs from Store data:

```svelte
<script>
  import {createStore} from 'tinybase';
  import {CellView, RowView, TablesView} from 'tinybase/ui-svelte';

  const store = createStore().setTables({
    pets: {
      fido: {species: 'dog', color: 'brown'},
      felix: {species: 'cat', color: 'black'},
    },
  });
</script>

<!-- Renders the value of a single cell -->
<CellView tableId="pets" rowId="fido" cellId="species" {store} />

<!-- Renders all cells in a row concatenated -->
<RowView tableId="pets" rowId="fido" {store} />

<!-- Renders the entire tables structure -->
<TablesView {store} />
```

Like the ui-react module components, these have intentionally plain default
renderings. For example, RowView concatenates the rendered Cells in a Row, while
TablesView concatenates the rendered Tables in a Store. The `separator` and
`debugIds` props are often useful while prototyping:

```svelte
<RowView tableId="pets" rowId="fido" {store}>
  {#snippet separator()}
    <span>/</span>
  {/snippet}
</RowView>

<RowView tableId="pets" rowId="fido" {store} debugIds={true} />
```

## Customizing View Components

Instead of props like `cellComponent` or `rowComponent`, ui-svelte uses named
snippet props whose names match the level being customized: `cell`, `row`,
`table`, `value`, `slice`, or `checkpoint`.

This RowView example overrides how each Cell is rendered with a `cell` snippet:

```svelte
<script>
  import {CellView, RowView} from 'tinybase/ui-svelte';

  let {store} = $props();
</script>

<RowView tableId="pets" rowId="fido" {store}>
  {#snippet cell(cellId)}
    <span class="cell">
      {cellId}: <CellView tableId="pets" rowId="fido" {cellId} {store} />
    </span>
  {/snippet}
</RowView>
```

Since the snippet receives only the varying Id for that level, it stays concise
and idiomatic. If you need more context, close over the surrounding props, as
shown above with `tableId`, `rowId`, and `store`.

The full set of view components covers every level of the Store hierarchy and
the higher-level TinyBase objects. For the full API reference, see the
ui-svelte module documentation.

## Summary

The ui-svelte module is the Svelte 5 counterpart to ui-react. It favors
reactive handles, named snippets, and Provider-based context over hooks and
component override props.

If you want browser-oriented table components comparable to the ui-react-dom
module, proceed to the Using Svelte DOM Components guide.
