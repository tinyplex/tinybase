# <SliceInHtmlTable /> (Svelte)

![SliceInHtmlTable](/shots/sliceinhtmltable-svelte-demo.png)

In this demo, we showcase the SliceInHtmlTable component, a way to display the
Slice portions of an Index.

Rather than rebuilding the whole demo from scratch, we're going back and making
changes to the
[<TableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/tableinhtmltable-svelte/)
demo. Where that demo rendered a Table from a Store, this one creates an Index
and displays one of its Slice objects.

[base]: # '<TableInHtmlTable /> (Svelte)'

## Set Up

We switch the main module imports so we can create and provide an `Indexes`
object:

```diff-js
-import {createStore} from 'tinybase';
+import {createIndexes, createStore} from 'tinybase';
```

```diff-js
 const init = async () => {
   const store = createStore();
   await loadTable(store, 'genres');
-  mount(App, {target: document.body, props: {store}});
+  const indexes = createIndexes(store).setIndexDefinition(
+    'genresByNameLength',
+    'genres',
+    (getCell) => 'length ' + getCell('name').length,
+  );
+  mount(App, {target: document.body, props: {store, indexes}});
 };
```

## Using the SliceInHtmlTable Component

The app body can then replace the table rendering with a single Slice from that
Index:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {SliceInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store, indexes} = $props();
</script>

<Provider {store} {indexes}>
  <SliceInHtmlTable indexId="genresByNameLength" sliceId="length 6" />
</Provider>
```

Next up, we can render linked local and remote Rows with the
[<RelationshipInHtmlTable /> (Svelte)](/demos/ui-components-svelte/relationshipinhtmltable-svelte/)
demo.
