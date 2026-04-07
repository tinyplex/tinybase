# <TableInHtmlTable /> (Svelte)

In this demo, we showcase the TableInHtmlTable component.

Rather than rebuilding the whole demo from scratch, we're making changes to the
[<ValuesInHtmlTable /> (Svelte)](/demos/ui-components-svelte/valuesinhtmltable-svelte/)
demo to support this new component.

[base]: # '<ValuesInHtmlTable /> (Svelte)'

## Set Up

We switch out the `ValuesInHtmlTable` component and use
`TableInHtmlTable` instead.

This component renders Table content rather than Values, so we replace the
static Value loading with an asynchronous table loader:

```diff-js
 import {createStore} from 'tinybase';
 import {mount} from 'svelte';
 import App from './App.svelte';

-const store = createStore()
-  .setValue('username', 'John Appleseed')
-  .setValue('email address', 'john.appleseed@example.com')
-  .setValue('dark mode', true)
-  .setValue('font size', 14);
+const NUMERIC = /^[\d\.]+$/;
+
+const loadTable = async (store, tableId) => {
+  store.startTransaction();
+  const rows = (
+    await (await fetch(`https://tinybase.org/assets/${tableId}.tsv`)).text()
+  ).split('\n');
+  const cellIds = rows.shift().split('\t');
+  rows.forEach((row) => {
+    const cells = row.split('\t');
+    if (cells.length == cellIds.length) {
+      const rowId = cells.shift();
+      cells.forEach((cell, c) => {
+        if (cell != '') {
+          store.setCell(
+            tableId,
+            rowId,
+            cellIds[c + 1],
+            NUMERIC.test(cell) ? parseFloat(cell) : cell,
+          );
+        }
+      });
+    }
+  });
+  store.finishTransaction();
+};

-mount(App, {target: document.body, props: {store}});
+const init = async () => {
+  const store = createStore();
+  await loadTable(store, 'genres');
+  mount(App, {target: document.body, props: {store}});
+};
+
+window.addEventListener('load', init);
```

## Using the TableInHtmlTable Component

We can replace the body of the app with a full Table view, including the same
headerless variant from the first demo:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {TableInHtmlTable} from 'tinybase/ui-svelte-dom';
  import DictionaryCell from './DictionaryCell.svelte';

  let {store} = $props();

  const customCells = {
    name: {label: 'Name', component: DictionaryCell},
  };
</script>

<Provider {store}>
  <TableInHtmlTable tableId="genres" />
  <TableInHtmlTable tableId="genres" headerRow={false} idColumn={false} />
  <TableInHtmlTable tableId="genres" customCells={customCells} />
</Provider>
```

That custom third table uses a named Svelte file to render each genre name as a
dictionary link:

```svelte file=src/DictionaryCell.svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  let {tableId, rowId, cellId, store} = $props();
  const word = getCell(() => tableId, () => rowId, () => cellId, () => store);
</script>

<a
  href={'https://www.merriam-webster.com/dictionary/' + word.current}
  target="_blank"
>
  {word.current}
</a>
```

And we add one small CSS tweak so those links keep the default table styling:

```diff-less
+a {
+  color: inherit;
+}
```

Now let's move on to the more interactive
[<SortedTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/sortedtableinhtmltable-svelte/)
demo.
