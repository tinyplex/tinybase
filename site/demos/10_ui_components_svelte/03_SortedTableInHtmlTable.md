# <SortedTableInHtmlTable /> (Svelte)

In this demo, we showcase the SortedTableInHtmlTable component, which adds
sorting and pagination behavior to an HTML table rendered from TinyBase data.

## Initialization

As before, we register TinyBase, ui-svelte, ui-svelte-dom, and Svelte:

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

We load the wider `movies` table so there is something meaningful to sort:

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
  await loadTable(store, 'movies');
  mount(App, {target: document.body, props: {store}});
};

window.addEventListener('load', init);
```

The app uses a narrow set of columns, sorts by rating by default, and enables
interactive sorting and pagination:

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

And then we add just enough CSS to make the sorted column and paginator stand
out:

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
    width: 6rem;
    &:nth-of-type(2) {
      width: 24rem;
    }
  }
  caption {
    caption-side: top;
    margin-bottom: 1rem;
    text-align: left;
    button {
      margin-right: 0.5rem;
    }
  }
}

th.sorted {
  background: #ddd;
}
```

Next, let's look at making the same Values table editable with
[<EditableValueView /> (Svelte)](/demos/ui-components-svelte/editablevalueview-svelte/).
