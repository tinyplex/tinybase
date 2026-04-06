# <SliceInHtmlTable /> (Svelte)

In this demo, we showcase the SliceInHtmlTable component, a way to display the
Slice portions of an Index.

## Initialization

We use the same TinyBase, ui-svelte, ui-svelte-dom, and Svelte import aliases
as the earlier demos:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-svelte": "https://esm.sh/tinybase@/ui-svelte",
      "tinybase/ui-svelte-dom": "https://esm.sh/tinybase@/ui-svelte-dom",
      "svelte": "https://esm.sh/svelte@"
    }
  }
</script>
```

The entry point loads the `genres` table, creates an Index on genre name
length, and mounts the app:

```js
import {createIndexes, createStore} from 'tinybase';
import {mount} from 'svelte';
import App from './App.svelte';

const NUMERIC = /^[\d\.]+$/;

const loadTable = async (store, tableId) => {
  store.startTransaction();
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
  store.finishTransaction();
};

const init = async () => {
  const store = createStore();
  await loadTable(store, 'genres');
  const indexes = createIndexes(store).setIndexDefinition(
    'genresByNameLength',
    'genres',
    (getCell) => 'length ' + getCell('name').length,
  );
  mount(App, {target: document.body, props: {store, indexes}});
};

window.addEventListener('load', init);
```

The app exposes both the Store and the Indexes object, and renders the Slice of
genre names that are six letters long:

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

And as before, we add some simple styling:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  align-items: flex-start;
  color: #333;
  display: flex;
  font-family: Inter, sans-serif;
  font-size: 0.8rem;
  justify-content: center;
  letter-spacing: -0.04rem;
  line-height: 1.5rem;
  margin: 0;
  min-height: 100vh;
}

table {
  background: white;
  border-collapse: collapse;
  box-shadow: 0 0 1rem #0004;
  font-size: inherit;
  line-height: inherit;
  margin: 2rem;
  table-layout: fixed;
  th,
  td {
    border-color: #eee;
    border-style: solid;
    border-width: 1px 0;
    overflow: hidden;
    padding: 0.25rem 0.5rem;
    text-align: left;
    white-space: nowrap;
  }
  thead th {
    border-bottom-color: #ccc;
  }
}
```

Next up, we can render linked local and remote Rows with the
[<RelationshipInHtmlTable /> (Svelte)](/demos/ui-components-svelte/relationshipinhtmltable-svelte/)
demo.
