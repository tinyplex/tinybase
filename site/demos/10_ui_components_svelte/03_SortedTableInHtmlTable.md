# <SortedTableInHtmlTable /> (Svelte)

![SortedTableInHtmlTable demo thumbnail](/shots/sortedtableinhtmltable-svelte-demo.png "Thumbnail: SortedTableInHtmlTable demo")

In this demo, we showcase the `SortedTableInHtmlTable` component.

Rather than rebuilding the whole demo from scratch, we're making changes to the
[<TableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/tableinhtmltable-svelte/)
demo to support this more interactive component.

[base]: # '<TableInHtmlTable /> (Svelte)'

## Set Up

We switch out the table component itself to use
`SortedTableInHtmlTable`.

This component is best shown with a much wider data set, so we load the
`movies` table instead of `genres`:

```diff-js
   const store = createStore();
-  await loadTable(store, 'genres');
+  await loadTable(store, 'movies');
   mount(App, {target: document.body, props: {store}});
 };
```

## Using the SortedTableInHtmlTable Component

The app can then swap in a single sorted table, choose the visible columns, and
turn on both interactive sorting and pagination:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {SortedTableInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store} = $props();

  const customCells = {name: 'Name', year: 'Year', rating: 'Rating'};
</script>

<Provider {store}>
  <SortedTableInHtmlTable
    tableId="movies"
    customCells={customCells}
    cellId="rating"
    descending={true}
    limit={7}
    sortOnClick={true}
    paginator={true}
  />
</Provider>
```

The base styling mostly still works, so we only add the pieces needed for the
sorted column and paginator:

```diff-less
+table {
+  thead th {
+    width: 5rem;
+    &:nth-of-type(2) {
+      width: 28rem;
+    }
+  }
+  caption {
+    caption-side: top;
+    margin-bottom: 1rem;
+    text-align: left;
+    button {
+      margin-right: 0.5rem;
+    }
+  }
+}
+
+th.sorted {
+  background: #ddd;
+}
```

Next, let's use the same pattern with an Index in the
[<SliceInHtmlTable /> (Svelte)](/demos/ui-components-svelte/sliceinhtmltable-svelte/)
demo.
