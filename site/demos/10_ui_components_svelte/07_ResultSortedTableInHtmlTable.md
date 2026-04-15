# <ResultSortedTableInHtmlTable /> (Svelte)

![ResultSortedTableInHtmlTable demo thumbnail](/shots/resultsortedtableinhtmltable-svelte-demo.png "Thumbnail: ResultSortedTableInHtmlTable demo")

In this demo, we showcase the ResultSortedTableInHtmlTable component, a more
interactive way to render the results of a query.

Rather than rebuilding the whole demo from scratch, we're making changes to the
[<SortedTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/sortedtableinhtmltable-svelte/)
demo to support this query-backed variant.

[base]: # '<SortedTableInHtmlTable /> (Svelte)'

## Set Up

We switch the imports so we can create a `Queries` object instead of just
rendering rows directly from the Store:

```diff-js
-import {createStore} from 'tinybase';
+import {createQueries, createStore} from 'tinybase';
```

```diff-js
 const init = async () => {
   const store = createStore();
   await loadTable(store, 'movies');
+  const queries = createQueries(store).setQueryDefinition(
+    'recentMovies',
+    'movies',
+    ({select, where}) => {
+      select('name').as('Name');
+      select('year').as('Year');
+      select('rating').as('Rating');
+      where((getCell) => getCell('year') >= 2018);
+    },
+  );
-  mount(App, {target: document.body, props: {store}});
+  mount(App, {target: document.body, props: {store, queries}});
 };
```

## Using the ResultSortedTableInHtmlTable Component

The app body can then swap in the query-backed sorted table:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {ResultSortedTableInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store, queries} = $props();
</script>

<Provider {store} {queries}>
  <ResultSortedTableInHtmlTable
    queryId="recentMovies"
    cellId="Rating"
    descending={true}
    limit={7}
    sortOnClick={true}
    paginator={true}
  />
</Provider>
```

That completes the query-table side of the set, so the next demo is
[<EditableValueView /> (Svelte)](/demos/ui-components-svelte/editablevalueview-svelte/).
