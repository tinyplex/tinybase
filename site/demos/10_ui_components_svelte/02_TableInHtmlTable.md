# <TableInHtmlTable /> (Svelte)

In this demo, we showcase the TableInHtmlTable component from the
ui-svelte-dom module.

## Initialization

We register TinyBase, ui-svelte, ui-svelte-dom, and Svelte itself in the import
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

This time, we asynchronously load a small tabular data set and mount the app
once ready:

```js
import {createStore} from 'tinybase';
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
  mount(App, {target: document.body, props: {store}});
};

window.addEventListener('load', init);
```

The app renders three variants of the same table, including one with a custom
Cell component:

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

The custom Cell component uses the ui-svelte `getCell` function to render a
dictionary link for each genre name:

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

And some basic styling:

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
  justify-content: space-around;
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

a {
  color: inherit;
}
```

Now let's move on to the more interactive
[<SortedTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/sortedtableinhtmltable-svelte/)
demo.
