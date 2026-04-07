# <Inspector /> (Svelte)

In this demo, we showcase the Inspector component, which allows you to view and
edit the content of a Store in a debug web environment.

Let's make changes to the <TableInHtmlTable /> (Svelte) demo so we can start
with a well-populated Store to inspect.

[base]: # '<TableInHtmlTable /> (Svelte)'

## Set Up

Let's import the Inspector component:

```diff-html
 <script type="importmap">
   {
     "imports": {
       "tinybase": "https://esm.sh/tinybase@",
       "tinybase/ui-svelte": "https://esm.sh/tinybase@/ui-svelte",
-      "tinybase/ui-svelte-dom": "https://esm.sh/tinybase@/ui-svelte-dom",
+      "tinybase/ui-svelte-inspector": "https://esm.sh/tinybase@/ui-svelte-inspector",
       "svelte": "https://esm.sh/svelte@"
     }
   }
 </script>
```

The inspector component is best showcased with a larger data set, so we load up
all four tables of the movie database data:

```diff-js
 const loadTable = async (store, tableId) => {
-  store.startTransaction();
   const rows = (
     await (await fetch(`https://tinybase.org/assets/${tableId}.tsv`)).text()
   ).split('\n');
   const cellIds = rows.shift().split('\t');
   rows.forEach((row) => {
      const cells = row.split('\t');
      if (cells.length == cellIds.length) {
        const rowId = cells.shift();
        cells.forEach((cell, c) => {
          if (cell != '') {
            store.setCell(
              tableId,
              rowId,
              cellIds[c + 1],
              NUMERIC.test(cell) ? parseFloat(cell) : cell,
            );
          }
        });
      }
    });
-  store.finishTransaction();
-};
+};
 
-const init = async () => {
-  const store = createStore();
-  await loadTable(store, 'genres');
-  mount(App, {target: document.body, props: {store}});
-};
+const init = async () => {
+  const store = createStore();
+  store.startTransaction();
+  await Promise.all(
+    ['movies', 'genres', 'people', 'cast'].map((tableId) =>
+      loadTable(store, tableId),
+    ),
+  );
+  store.finishTransaction();
+  mount(App, {target: document.body, props: {store}});
+};
```

Let's update the app to show some very basic data about the Store:

```diff-svelte file=src/App.svelte
 <script>
-  import {Provider} from 'tinybase/ui-svelte';
-  import {TableInHtmlTable} from 'tinybase/ui-svelte-dom';
-  import DictionaryCell from './DictionaryCell.svelte';
+  import {Provider, getTableIds} from 'tinybase/ui-svelte';
+  import {Inspector} from 'tinybase/ui-svelte-inspector';
 
   let {store} = $props();
- 
-  const customCells = {
-    name: {label: 'Name', component: DictionaryCell},
-  };
+  const tableIds = getTableIds(() => store);
 </script>
 
 <Provider {store}>
-  <TableInHtmlTable tableId="genres" />
-  <TableInHtmlTable tableId="genres" headerRow={false} idColumn={false} />
-  <TableInHtmlTable tableId="genres" customCells={customCells} />
+  <div id="info">
+    Loaded tables: {tableIds.current.join(', ')}
+  </div>
 </Provider>
```

```diff-less
+body {
+  align-items: center;
+  justify-content: center;
+}
```

```diff-less
+#info {
+  align-self: center;
+  background: white;
+  box-shadow: 0 0 1rem #0004;
+  padding: 1rem 1.5rem;
+}
```

OK, that's not much of an app! But at least we can now instantiate the
Inspector component.

## Using The Inspector Component

The Inspector component can appear anywhere in the app's DOM and will appear as
an overlay. It is added to an app like so:

```diff-svelte file=src/App.svelte
   <div id="info">
     Loaded tables: {tableIds.current.join(', ')}
   </div>
+  <Inspector open={true} />
 </Provider>
```

This completes the Svelte demo set for the current UI components, including the
debugging overlay.
