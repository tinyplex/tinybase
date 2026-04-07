# <EditableCellView /> (Svelte)

In this demo, we showcase the EditableCellView component, which allows you to
edit Cell values from a Svelte-based web UI.

## Initialization

We again use the same import aliases:

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

This demo loads the `genres` table and mounts the app:

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

The app renders the full editable table and a focused editor for one specific
Cell:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {EditableCellView, TableInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store} = $props();
</script>

<Provider {store}>
  <TableInHtmlTable tableId="genres" editable={true} />
  <div id="edit">
    Genre g05 name:
    <EditableCellView tableId="genres" rowId="g05" cellId="name" />
  </div>
</Provider>
```

And the CSS mirrors the editable Value demo:

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
  button,
  input {
    border: 1px solid #ccc;
  }
}

#edit {
  align-self: flex-start;
  background: white;
  box-shadow: 0 0 1rem #0004;
  margin: 2rem;
  min-width: 16rem;
  padding: 0.5rem 1rem 1rem;
}

.editableCell button {
  margin-right: 0.5rem;
  width: 4rem;
}

input.invalid {
  background: #fdd;
}
```

We finish off the demos of the UI components with the debugging tool. Let's
proceed to the [<Inspector /> (Svelte)](/demos/ui-components-svelte/inspector-svelte/)
demo.
