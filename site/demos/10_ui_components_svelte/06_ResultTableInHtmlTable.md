# <ResultTableInHtmlTable /> (Svelte)

![ResultTableInHtmlTable demo thumbnail](/shots/resulttableinhtmltable-svelte-demo.png "Thumbnail: ResultTableInHtmlTable demo")

In this demo, we showcase the ResultTableInHtmlTable component, a way to
display the results of a query.

Rather than rebuilding the whole demo from scratch, we're going back and making
changes to the
[<TableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/tableinhtmltable-svelte/)
demo. Where that demo rendered a Table from a Store, this one displays the
results of a Query from a `Queries` object.

[base]: # '<TableInHtmlTable /> (Svelte)'

## Set Up

We switch the imports so we can create and provide a `Queries` object:

```diff-js
-import {createStore} from 'tinybase';
+import {createQueries, createStore} from 'tinybase';
```

```diff-js
 const init = async () => {
   const store = createStore();
   await loadTable(store, 'genres');
+  const queries = createQueries(store).setQueryDefinition(
+    'genresStartingWithA',
+    'genres',
+    ({select, where}) => {
+      select('name');
+      select((getCell) => getCell('name').length).as('length');
+      where((getCell) => getCell('name').startsWith('A'));
+    },
+  );
-  mount(App, {target: document.body, props: {store}});
+  mount(App, {target: document.body, props: {store, queries}});
 };
```

## Using the ResultTableInHtmlTable Component

The app body can then render the query result directly:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {ResultTableInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store, queries} = $props();
</script>

<Provider {store} {queries}>
  <ResultTableInHtmlTable queryId="genresStartingWithA" />
</Provider>
```

And because query results can also be sorted and paginated, the next demo is
[<ResultSortedTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/resultsortedtableinhtmltable-svelte/).
