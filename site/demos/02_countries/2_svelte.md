# Countries (Svelte)

![Countries (Svelte)](/shots/countries-svelte-demo.png)

In this demo, we build the same app as the Countries (React) demo, but with
Svelte 5 and the ui-svelte module.

## Initialization

First, we create the import aliases for TinyBase, the persister modules, the
Svelte inspector module, and Svelte:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/persisters/persister-browser": "https://esm.sh/tinybase/persisters/persister-browser@",
      "tinybase/persisters/persister-remote": "https://esm.sh/tinybase/persisters/persister-remote@",
      "tinybase/ui-svelte": "https://esm.sh/tinybase@/ui-svelte",
      "tinybase/ui-svelte-inspector": "https://esm.sh/tinybase@/ui-svelte-inspector",
      "svelte": "https://esm.sh/svelte@"
    }
  }
</script>
```

The main entry point creates the same three Store objects and the same two
Indexes objects as the React version, and then mounts a Svelte component.

`countryStore` loads the country data from a remote JSON file, `starStore`
persists the user's starred countries to local storage, and `viewStore`
persists the current slice selection to session storage:

```js
import {createIndexes, createStore, defaultSorter} from 'tinybase';
import {
  createLocalPersister,
  createSessionPersister,
} from 'tinybase/persisters/persister-browser';
import {createRemotePersister} from 'tinybase/persisters/persister-remote';
import {mount} from 'svelte';
import App from './App.svelte';

const init = async () => {
  const countryStore = createStore().setTablesSchema({
    countries: {emoji: {type: 'string'}, name: {type: 'string'}},
  });
  createRemotePersister(
    countryStore,
    'https://tinybase.org/assets/countries.json',
  ).load();

  const starStore = createStore().setTablesSchema({
    countries: {star: {type: 'boolean'}},
  });
  const starPersister = createLocalPersister(starStore, 'countries/starStore');
  await starPersister.startAutoLoad([{
    countries: {
      GB: {star: true},
      NZ: {star: true},
      AU: {star: true},
      SE: {star: true},
      IE: {star: true},
      IN: {star: true},
      BZ: {star: true},
      US: {star: true},
    },
  }]);
  await starPersister.startAutoSave();

  const viewStore = createStore().setValuesSchema({
    indexes: {type: 'string', default: 'countryIndexes'},
    indexId: {type: 'string', default: 'firstLetter'},
    sliceId: {type: 'string', default: 'A'},
  });
  await createSessionPersister(
    viewStore,
    'countries/viewStore',
  ).startAutoPersisting();

  const countryIndexes = createIndexes(countryStore).setIndexDefinition(
    'firstLetter',
    'countries',
    (getCell) => getCell('name')[0],
    'name',
    defaultSorter,
  );
  const starIndexes = createIndexes(starStore).setIndexDefinition(
    'star',
    'countries',
    'star',
  );

  mount(App, {
    target: document.body,
    props: {
      countryStore,
      starStore,
      viewStore,
      countryIndexes,
      starIndexes,
    },
  });
};

window.addEventListener('load', init);
```

## The App Component

The top-level Svelte component wraps everything in a Provider component so its
child components can refer to the Stores by their Ids. It also uses three
reactive `getValue` handles to read and write the current Indexes object name,
`indexId`, and `sliceId` from the `viewStore`.

For the actual slice calculations, this version passes the `countryIndexes` and
`starIndexes` objects directly into `getSliceIds` and `getSliceRowIds`, and
then renders the filters and country cards with normal Svelte `{#each}`
blocks:

```svelte file=src/App.svelte
<script>
  import {
    Provider,
    getSliceIds,
    getSliceRowIds,
    getValue,
  } from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';
  import Country from './Country.svelte';
  import Filter from './Filter.svelte';

  const STAR = '\u2605';

  let {
    countryStore,
    starStore,
    viewStore,
    countryIndexes,
    starIndexes,
  } = $props();

  const currentIndexes = getValue('indexes', viewStore);
  const currentIndexId = getValue('indexId', viewStore);
  const currentSliceId = getValue('sliceId', viewStore);
  const firstLetters = getSliceIds('firstLetter', countryIndexes);
  const getCurrentIndexes = () =>
    currentIndexes.current == 'countryIndexes' ? countryIndexes : starIndexes;
  const currentRowIds = getSliceRowIds(
    () => currentIndexId.current,
    () => currentSliceId.current,
    getCurrentIndexes,
  );

  const setCurrentSlice = (indexes, indexId, sliceId) => {
    currentIndexes.current = indexes;
    currentIndexId.current = indexId;
    currentSliceId.current = sliceId;
  };

  const isCurrent = (indexes, indexId, sliceId) =>
    currentIndexes.current == indexes &&
    currentIndexId.current == indexId &&
    currentSliceId.current == sliceId;
</script>

<Provider
  storesById={{countryStore, starStore, viewStore}}
  indexesById={{countryIndexes, starIndexes}}
>
  <div id="filters">
    <Filter
      indexes={starIndexes}
      indexesId="starIndexes"
      indexId="star"
      sliceId="true"
      label={STAR}
      selected={isCurrent('starIndexes', 'star', 'true')}
      {setCurrentSlice}
    />
    {#each firstLetters.current as sliceId (sliceId)}
      <Filter
        indexes={countryIndexes}
        indexesId="countryIndexes"
        indexId="firstLetter"
        {sliceId}
        label={sliceId}
        selected={isCurrent('countryIndexes', 'firstLetter', sliceId)}
        {setCurrentSlice}
      />
    {/each}
  </div>
  <div id="countries">
    {#each currentRowIds.current as rowId (rowId)}
      <Country tableId="countries" {rowId} />
    {/each}
  </div>
  <Inspector />
</Provider>
```

Like the React version, this Svelte version can now also include the Inspector
component, so you can inspect the Stores and Indexes that drive the UI while
you interact with it.

## The `Filter` Component

Each filter needs to know which Indexes object, `indexId`, and `sliceId` it
should switch to. It also shows the number of Row Ids currently in that slice,
which we can get with the `getSliceRowIds` reactive function:

```svelte file=src/Filter.svelte
<script>
  import {getSliceRowIds} from 'tinybase/ui-svelte';

  let {
    indexes,
    indexesId,
    indexId,
    sliceId,
    label,
    selected = false,
    setCurrentSlice,
  } = $props();

  const rowIds = getSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
</script>

<div
  class="filter"
  class:current={selected}
  onclick={() => setCurrentSlice(indexesId, indexId, sliceId)}
>
  <span class="label">{label}</span><span class="count">{rowIds.current.length}</span>
</div>
```

## The `Country` Component

Each country card uses a writable `getCell` handle for the `star` cell in the
`starStore`, and `CellView` components to render the flag and the country name
from the `countryStore`:

```svelte file=src/Country.svelte
<script>
  import {CellView, getCell} from 'tinybase/ui-svelte';

  const STAR = '\u2605';
  const UNSTAR = '\u2606';

  let {tableId, rowId} = $props();

  const star = getCell(
    () => tableId,
    () => rowId,
    'star',
    'starStore',
  );
</script>

<div class="country">
  <div class="star" onclick={() => (star.current = !star.current)}>
    {star.current ? STAR : UNSTAR}
  </div>
  <div class="flag">
    <CellView {tableId} {rowId} cellId="emoji" store="countryStore" />
  </div>
  <div class="name">
    <CellView {tableId} {rowId} cellId="name" store="countryStore" />
  </div>
</div>
```

The layout and styling are the same as the React version:

```less
@accentColor: #d81b60;
@spacing: 0.5rem;
@border: 1px solid #ccc;
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}
body {
  box-sizing: border-box;
  display: flex;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  margin: 0;
  height: 100vh;
  text-align: center;
}
#filters {
  overflow-y: scroll;
  border-right: @border;
  padding: @spacing;
  .filter {
    cursor: pointer;
    &.current {
      color: @accentColor;
    }
    .label,
    .count {
      display: inline-block;
      width: 2em;
    }
    .count {
      color: #777;
      font-size: 0.8rem;
      text-align: left;
    }
  }
}
#countries {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: max-content;
  gap: @spacing;
  padding: @spacing * 2;
  overflow-y: scroll;
  .country {
    background: #fff;
    border: @border;
    padding: @spacing;
    position: relative;
    height: fit-content;
    .star {
      cursor: pointer;
      display: inline;
      left: 8px;
      position: absolute;
      top: 5px;
      user-select: none;
    }
    .flag {
      font-size: 5rem;
      line-height: 1em;
    }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: top;
      white-space: nowrap;
    }
  }
}
```

And that's it: the same country browser, but written idiomatically with Svelte
reactive handles, snippets, and the ui-svelte module.
