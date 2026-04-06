# <RelationshipInHtmlTable /> (Svelte)

In this demo, we showcase the RelationshipInHtmlTable component, a way to
display the two Tables linked together by a Relationship.

## Initialization

We use the same import aliases as the earlier Svelte DOM demos:

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

The entry point loads the `genres` table, adds a second `metadata` table, wires
them together with a Relationship, and mounts the app:

```js
import {createRelationships, createStore} from 'tinybase';
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
  store.setTable('metadata', {
    g01_meta: {text: 'Dramatic movies to make you think', popularity: 6},
    g02_meta: {text: 'These ones make you laugh', popularity: 7},
    g03_meta: {text: 'Fun for all the family', popularity: 8},
    g04_meta: {text: 'For the romantics at heart', popularity: 5},
    g05_meta: {text: 'From cartoons to CGI', popularity: 5},
    g06_meta: {text: 'Escape to another world', popularity: 4},
    g07_meta: {text: 'Tales of the American West', popularity: 3},
    g08_meta: {text: 'Stay on the edge of your seat', popularity: 6},
    g09_meta: {text: 'For your inner explorer', popularity: 7},
    g10_meta: {text: 'Fast-paced action from start to finish', popularity: 8},
    g11_meta: {text: 'Jump scares to give you nightmares', popularity: 6},
    g12_meta: {text: 'Murders and mysteries', popularity: 5},
    g14_meta: {text: 'Take a step back in time', popularity: 3},
    g15_meta: {text: 'A glimpse of the future', popularity: 8},
    g16_meta: {text: 'Who did it?', popularity: 5},
  });
  const relationships = createRelationships(store).setRelationshipDefinition(
    'genresMetadata',
    'genres',
    'metadata',
    (_, rowId) => rowId + '_meta',
  );
  mount(App, {target: document.body, props: {store, relationships}});
};

window.addEventListener('load', init);
```

The app customizes the displayed columns and bolds the popularity score:

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

The custom Cell component reads the current Cell value and wraps it in bold
text:

```svelte file=src/Popularity.svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  let {tableId, rowId, cellId, store} = $props();
  const cell = getCell(() => tableId, () => rowId, () => cellId, () => store);
</script>

<b>{cell.current}</b>
```

And the table styling stays intentionally minimal:

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

The next step is to render a query result directly with the
[<ResultTableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/resulttableinhtmltable-svelte/)
demo.
