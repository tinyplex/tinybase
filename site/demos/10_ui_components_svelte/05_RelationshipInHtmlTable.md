# <RelationshipInHtmlTable /> (Svelte)

In this demo, we showcase the RelationshipInHtmlTable component, a way to
display the two Tables linked together by a Relationship.

Rather than rebuilding the whole demo from scratch, we're going back and making
changes to the
[<TableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/tableinhtmltable-svelte/)
demo again. Where that demo rendered a Table from a Store, this one creates a
`Relationships` object and displays one defined Relationship from it.

[base]: # '<TableInHtmlTable /> (Svelte)'

## Set Up

We switch the imports so we can create and provide a `Relationships` object:

```diff-js
-import {createStore} from 'tinybase';
+import {createRelationships, createStore} from 'tinybase';
```

```diff-js
 const init = async () => {
   const store = createStore();
   await loadTable(store, 'genres');
+  store.setTable('metadata', {
+    g01_meta: {text: 'Dramatic movies to make you think', popularity: 6},
+    g02_meta: {text: 'These ones make you laugh', popularity: 7},
+    g03_meta: {text: 'Fun for all the family', popularity: 8},
+    g04_meta: {text: 'For the romantics at heart', popularity: 5},
+    g05_meta: {text: 'From cartoons to CGI', popularity: 5},
+    g06_meta: {text: 'Escape to another world', popularity: 4},
+    g07_meta: {text: 'Tales of the American West', popularity: 3},
+    g08_meta: {text: 'Stay on the edge of your seat', popularity: 6},
+    g09_meta: {text: 'For your inner explorer', popularity: 7},
+    g10_meta: {text: 'Fast-paced action from start to finish', popularity: 8},
+    g11_meta: {text: 'Jump scares to give you nightmares', popularity: 6},
+    g12_meta: {text: 'Murders and mysteries', popularity: 5},
+    g14_meta: {text: 'Take a step back in time', popularity: 3},
+    g15_meta: {text: 'A glimpse of the future', popularity: 8},
+    g16_meta: {text: 'Who did it?', popularity: 5},
+  });
+  const relationships = createRelationships(store).setRelationshipDefinition(
+    'genresMetadata',
+    'genres',
+    'metadata',
+    (_, rowId) => rowId + '_meta',
+  );
-  mount(App, {target: document.body, props: {store}});
+  mount(App, {target: document.body, props: {store, relationships}});
 };
```

## Using the RelationshipInHtmlTable Component

The app body can then replace the original table with the joined view, while
also customizing the visible columns:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {RelationshipInHtmlTable} from 'tinybase/ui-svelte-dom';
  import Popularity from './Popularity.svelte';

  let {store, relationships} = $props();

  const customCells = {
    'genres.name': 'Genre',
    'metadata.popularity': {
      label: 'Popularity',
      component: Popularity,
    },
    'metadata.text': 'Description',
  };
</script>

<Provider {store} {relationships}>
  <RelationshipInHtmlTable
    relationshipId="genresMetadata"
    {customCells}
    idColumn={false}
  />
</Provider>
```

The custom popularity Cell just wraps the current value in bold text:

```svelte file=src/Popularity.svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  let {tableId, rowId, cellId, store} = $props();
  const cell = getCell(() => tableId, () => rowId, () => cellId, () => store);
</script>

<b>{cell.current}</b>
```

The next step is to render a query result directly with the
[<ResultTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/resulttableinhtmltable-svelte/)
demo.
