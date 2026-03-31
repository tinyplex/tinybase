# Building UIs With Svelte

This guide describes how to use the `tinybase/ui-svelte` module to build
reactive user interfaces in Svelte 5 applications.

## Installation

Install TinyBase and Svelte together:

```bash
npm install tinybase svelte
```

Then import functions and components directly from the `tinybase/ui-svelte`
module in your component's `<script>` block.

## Reactive Functions

Every reactive function in the `ui-svelte` module returns a reactive object
with a `current` property. Any part of your template that reads it will
automatically update when the underlying Store data changes.

Here is the `getCell` function reading the color of a pet and displaying it in
a paragraph:

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

When `store.setCell('pets', 'fido', 'color', 'walnut')` is called anywhere, the
paragraph immediately re-renders to show `walnut`. No manual subscriptions, no
`$:` labels, no `onDestroy` cleanup. The reactive object registers and removes
TinyBase listeners automatically using Svelte's reactivity lifecycle.

There are reactive functions corresponding to every Store reading method:

- `getValues` — reactive equivalent of `getValues`
- `getValueIds` — reactive equivalent of `getValueIds`
- `getValue` — reactive equivalent of `getValue`
- `hasValues` — reactive equivalent of `hasValues`
- `getTables` — reactive equivalent of `getTables`
- `getTableIds` — reactive equivalent of `getTableIds`
- `getTable` — reactive equivalent of `getTable`
- `getRowIds` — reactive equivalent of `getRowIds`
- `getSortedRowIds` — reactive equivalent of `getSortedRowIds`
- `getRow` — reactive equivalent of `getRow`
- `getCellIds` — reactive equivalent of `getCellIds`
- `getCell` — reactive equivalent of `getCell`

There are also reactive functions for the higher-level TinyBase objects:
`getMetric`, `getMetricIds`, `getSliceIds`, `getSliceRowIds`,
`getResultCell`, `getResultRow`, `getResultTable`,
`getResultRowIds`, `getCheckpointIds`, `getCheckpoint`, and more.

Functions like `getStore`, `getMetrics`, and `getQueries` are different: they
return TinyBase objects directly from Provider context. The reactive `getX`
and `hasX` functions described here return reactive objects whose `.current`
tracks Store data.

## Reactive Parameters With R

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

Without the `() => rowId` wrapper, changing the `rowId` prop would not cause
the function to re-read the Store for the new row.

## Writable State With `getCell`

The `getCell` and `getValue` functions expose a writable `current`
property for scalar values. Writing to it calls `store.setCell()` or
`store.setValue()`. This makes Svelte's `bind:value` directive work for
two-way binding:

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

Typing in the `<input>` updates the Store, which is immediately reflected
in the paragraph — without any additional event handling.

## Context With Provider

For larger apps, passing the `store` object to every function as the last
argument gets repetitive. The `Provider` component sets a context that all
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
context at runtime using `provideStore`, `provideMetrics`, and similar
functions.

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

Components accept a `cellComponent` or `rowComponent` snippet prop to customize
how individual cells or rows are rendered:

```svelte
<script>
  import {RowView} from 'tinybase/ui-svelte';
</script>

<RowView tableId="pets" rowId="fido" {store}>
  {#snippet cellComponent(tableId, rowId, cellId)}
    <span class="cell">{cellId}</span>
  {/snippet}
</RowView>
```

The full set of view components covers every level of the Store hierarchy and
the higher-level TinyBase objects:

- `CellView`, `RowView`, `TableView`, `TablesView`
- `ValueView`, `ValuesView`
- `SliceView`, `IndexView`
- `ResultCellView`, `ResultRowView`, `ResultTableView`, `ResultSortedTableView`
- `SortedTableView`
- `MetricView`
- `CheckpointView`, `BackwardCheckpointsView`, `CurrentCheckpointView`,
  `ForwardCheckpointsView`
- `RemoteRowView`, `LocalRowsView`, `LinkedRowsView`

That completes the overview of the `ui-svelte` module. For API reference, see
the [ui-svelte](/api/ui-svelte/) documentation.
