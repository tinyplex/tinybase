# Using Svelte Components

The view components in the ui-svelte module let you declaratively display parts
of a Store.

These components wrap the reactive functions we described in the previous guide
and render TinyBase data directly into a Svelte component tree. For common
rendering tasks, they make it easy to compose UIs from Store data:

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

The ui-svelte module favors named snippets over React-style component override
props, but it serves the same purpose: helping you render TinyBase data
declaratively. If you want browser-oriented table components next, proceed to
the Using Svelte DOM Components guide.
