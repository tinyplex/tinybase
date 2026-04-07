# <Inspector /> (Svelte)

In this demo, we showcase the Inspector component, which allows you to view and
edit the content of a Store in a debug web environment.

## Initialization

We register TinyBase, ui-svelte, ui-svelte-inspector, and Svelte itself in the
import map:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-svelte": "https://esm.sh/tinybase@/ui-svelte",
      "tinybase/ui-svelte-inspector": "https://esm.sh/tinybase@/ui-svelte-inspector",
      "svelte": "https://esm.sh/svelte@"
    }
  }
</script>
```

The inspector component is best showcased with a larger data set, so we load up
all four tables of the movie database data before mounting the app:

```js
import {createStore} from 'tinybase';
import {mount} from 'svelte';
import App from './App.svelte';

const NUMERIC = /^[\d\.]+$/;

const loadTable = async (store, tableId) => {
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
};

const init = async () => {
  const store = createStore();
  store.startTransaction();
  await Promise.all(
    ['movies', 'genres', 'people', 'cast'].map((tableId) =>
      loadTable(store, tableId),
    ),
  );
  store.finishTransaction();
  mount(App, {target: document.body, props: {store}});
};

window.addEventListener('load', init);
```

The app renders a little status summary and opens the Inspector over the top:

```svelte file=src/App.svelte
<script>
  import {Provider, getTableIds} from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';

  let {store} = $props();
  const tableIds = getTableIds(() => store);
</script>

<Provider {store}>
  <div id="info">
    Loaded tables: {tableIds.current.join(', ')}
  </div>
  <Inspector open={true} />
</Provider>
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
  align-items: center;
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

#info {
  align-self: center;
  background: white;
  box-shadow: 0 0 1rem #0004;
  padding: 1rem 1.5rem;
}
```

This completes the Svelte demo set for the current UI components, including the
debugging overlay.
