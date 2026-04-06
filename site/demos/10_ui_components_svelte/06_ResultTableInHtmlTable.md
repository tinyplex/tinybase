# <ResultTableInHtmlTable /> (Svelte)

In this demo, we showcase the ResultTableInHtmlTable component, a way to
display the results of a query.

## Initialization

We again use TinyBase, ui-svelte, ui-svelte-dom, and Svelte from the import
map:

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

The entry point loads the `genres` table, creates a Query, and mounts the app:

```js
import {createQueries, createStore} from 'tinybase';
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
  const queries = createQueries(store).setQueryDefinition(
    'genresStartingWithA',
    'genres',
    ({select, where}) => {
      select('name');
      select((getCell) => getCell('name').length).as('length');
      where((getCell) => getCell('name').startsWith('A'));
    },
  );
  mount(App, {target: document.body, props: {store, queries}});
};

window.addEventListener('load', init);
```

The app provides both the Store and the Queries object, then renders the query
result table:

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

And the styling remains the same as the other table demos:

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

And because query results can also be sorted and paginated, the next demo is
[<ResultSortedTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/resultsortedtableinhtmltable-svelte/).
