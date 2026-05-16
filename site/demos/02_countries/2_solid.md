# Countries (Solid)

![Countries (Solid)](/shots/countries-solid-demo.png)

In this demo, we build the same app as the Countries (React) demo, but with
Solid and the ui-solid module.

## Initialization

First, we create the import aliases for TinyBase, the persister modules, the
Solid inspector module, and Solid:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/persisters/persister-browser": "https://esm.sh/tinybase/persisters/persister-browser@",
      "tinybase/persisters/persister-remote": "https://esm.sh/tinybase/persisters/persister-remote@",
      "tinybase/ui-solid": "https://esm.sh/tinybase/ui-solid@",
      "tinybase/ui-solid-inspector": "https://esm.sh/tinybase/ui-solid-inspector@",
      "solid-js": "https://esm.sh/solid-js@",
      "solid-js/web": "https://esm.sh/solid-js/web@"
    }
  }
</script>
```

We import the functions, primitives, and components we need:

```jsx
import {For, Show} from 'solid-js';
import {render} from 'solid-js/web';
import {createIndexes, createStore, defaultSorter} from 'tinybase';
import {
  createLocalPersister,
  createSessionPersister,
} from 'tinybase/persisters/persister-browser';
import {createRemotePersister} from 'tinybase/persisters/persister-remote';
import {
  CellView,
  Provider,
  useCellState,
  useCreateIndexes,
  useCreatePersister,
  useCreateStore,
  useSetValuesCallback,
  useSliceIds,
  useSliceRowIds,
  useValue,
} from 'tinybase/ui-solid';
import {Inspector} from 'tinybase/ui-solid-inspector';
```

We also set up some string constants for showing star emojis:

```jsx
const STAR = '\u2605';
const UNSTAR = '\u2606';
```

## Starting The App

We have a top-level `App` component, in which we initialize the same three
Store objects as the React and Svelte versions:

- `countryStore` contains a list of the world's countries, loaded once from a
  JSON file using a remote Persister object.
- `starStore` contains a list of the countries that the user has starred. This
  is persisted to the browser's local storage and starts with eight default
  starred countries.
- `viewStore` contains the Id of an Indexes object, the Id of an index, and
  the Id of a slice, persisted as keyed values to session storage. These three
  ids represent the 'current slice' view the user is looking at and we default
  the app to start showing the countries starting with the letter 'A'.

```jsx
const App = () => {
  const countryStore = useCreateStore(() =>
    createStore().setTablesSchema({
      countries: {emoji: {type: 'string'}, name: {type: 'string'}},
    }),
  );
  useCreatePersister(
    countryStore,
    (store) =>
      createRemotePersister(store, 'https://tinybase.org/assets/countries.json'),
    (persister) => persister.load(),
  );

  const starStore = useCreateStore(() =>
    createStore().setTablesSchema({countries: {star: {type: 'boolean'}}}),
  );
  useCreatePersister(
    starStore,
    (store) => createLocalPersister(store, 'countries/starStore'),
    async (persister) => {
      await persister.startAutoLoad([{
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
      await persister.startAutoSave();
    },
  );

  const viewStore = useCreateStore(() =>
    createStore().setValuesSchema({
      indexes: {type: 'string', default: 'countryIndexes'},
      indexId: {type: 'string', default: 'firstLetter'},
      sliceId: {type: 'string', default: 'A'},
    }),
  );
  useCreatePersister(
    viewStore,
    (store) => createSessionPersister(store, 'countries/viewStore'),
    (persister) => persister.startAutoPersisting(),
  );
  // ...
```

We also create two Indexes objects with the `useCreateIndexes` primitive:

- `countryIndexes` contains a single Index of countries in `countryStore` by
  their first letter, sorted alphabetically.
- `starIndexes` contains a single Index of the countries in `starStore`.

The code looks like this:

```jsx
// ...
const countryIndexes = useCreateIndexes(countryStore, (store) =>
  createIndexes(store).setIndexDefinition(
    'firstLetter',
    'countries',
    (getCell) => getCell('name')[0],
    'name',
    defaultSorter,
  ),
);

const starIndexes = useCreateIndexes(starStore, (store) =>
  createIndexes(store).setIndexDefinition('star', 'countries', 'star'),
);
// ...
```

To start the app, we render the left-hand side `Filter` component and the main
`Countries` component, wrapped in a Provider component that references the
Store objects and the Indexes objects:

```jsx
  // ...
  return (
    <Show when={countryIndexes() && starIndexes()}>
      <Provider
        storesById={{
          countryStore: countryStore(),
          starStore: starStore(),
          viewStore: viewStore(),
        }}
        indexesById={{
          countryIndexes: countryIndexes(),
          starIndexes: starIndexes(),
        }}
      >
        <Filters />
        <Countries />
        <Inspector />
      </Provider>
    </Show>
  );
};
```

We also added the Inspector component at the end there so you can inspect what
is going on with the data during this demo. Simply click the TinyBase logo in
the corner.

We also use the same simple grid layout as the React and Svelte versions:

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
```

Finally, when the window loads, we render the `App` component into the demo
`div` to start the app:

```jsx
window.addEventListener('load', () => render(() => <App />, document.body));
```

## The 'Current Slice'

At the heart of this app is the concept of the 'current slice': at any one
time, the app is displaying the countries present in a specific sliceId of a
specific indexId of a specific Indexes object. We store these three ids in the
`viewStore` as keyed values so they persist between reloads.

Since both the left-hand and right-hand panels of the app need to read these
parameters, we provide three small primitives that get those keyed values out
of the `viewStore`:

```jsx
const useCurrentIndexes = () => useValue('indexes', 'viewStore');
const useCurrentIndexId = () => useValue('indexId', 'viewStore');
const useCurrentSliceId = () => useValue('sliceId', 'viewStore');
```

## The `Filters` Component

This component provides the list of countries' first letters down the left-hand
side of the app. We build this as a `For` loop over the slice Ids in the
`countryIndexes` index, but also add an explicit item at the top of the list to
allow the user to select starred countries from the `starIndexes` index.

The current slice primitives are used to determine whether a Filter is
selected, and that flag is passed down as the `selected` prop to each child
Filter component:

```jsx
const Filters = () => {
  const currentIndexes = useCurrentIndexes();
  const currentIndexId = useCurrentIndexId();
  const currentSliceId = useCurrentSliceId();
  const firstLetters = useSliceIds('firstLetter', 'countryIndexes');

  const isCurrent = (indexes, indexId, sliceId) =>
    currentIndexes() == indexes &&
    currentIndexId() == indexId &&
    currentSliceId() == sliceId;

  return (
    <div id="filters">
      <Filter
        indexes="starIndexes"
        indexId="star"
        sliceId="true"
        label={STAR}
        selected={isCurrent('starIndexes', 'star', 'true')}
      />
      <For each={firstLetters()}>
        {(sliceId) => (
          <Filter
            indexes="countryIndexes"
            indexId="firstLetter"
            sliceId={sliceId}
            selected={isCurrent('countryIndexes', 'firstLetter', sliceId)}
          />
        )}
      </For>
    </div>
  );
};
```

Each letter in the left hand `Filters` component is a `Filter` component, which
knows which Indexes object the app needs to show, along with the index and
slice Ids. This is set with the callback returned by the
`useSetValuesCallback` primitive.

For example, clicking the letter 'N' will set the current named Indexes object
to be `countryIndexes`, the current indexId to be `firstLetter`, and the
current sliceId to be 'N'. Clicking the star at the top of the list will set
the current named Indexes object to be `starIndexes`, the current indexId to be
`star`, and the current sliceId to be 'true'.

We also display the number of countries in the slice of the relevant index.
Instead of setting up a Metrics object to track this, it's simpler to just use
the `useSliceRowIds` primitive and show the `length` of the resulting array:

```jsx
const Filter = (props) => {
  const rowIds = useSliceRowIds(
    () => props.indexId,
    () => props.sliceId,
    () => props.indexes,
  );
  const setCurrentSlice = useSetValuesCallback(
    () => ({
      indexes: props.indexes,
      indexId: props.indexId,
      sliceId: props.sliceId,
    }),
    'viewStore',
  );

  return (
    <div
      class={'filter' + (props.selected ? ' current' : '')}
      onClick={setCurrentSlice}
    >
      <span className="label">{props.label ?? props.sliceId}</span>
      <span className="count">{rowIds().length}</span>
    </div>
  );
};
```

These filters also have some straightforward styling:

```less
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
```

## The `Countries` Component

The main right-hand side of the app is a panel that shows the view selected
with the left-hand `Filters` component. We pass the current indexes Id, index
Id, and slice Id accessors directly to `useSliceRowIds`, and then render the
country cards with a Solid `For` loop:

```jsx
const Countries = () => {
  const currentIndexes = useCurrentIndexes();
  const currentIndexId = useCurrentIndexId();
  const currentSliceId = useCurrentSliceId();
  const rowIds = useSliceRowIds(currentIndexId, currentSliceId, currentIndexes);

  return (
    <div id="countries">
      <For each={rowIds()}>
        {(rowId) => <Country tableId="countries" rowId={rowId} />}
      </For>
    </div>
  );
};
```

Each Row that is present in the specified slice is a country, and the `Country`
component renders a small panel for each.

As well as rendering the name and flag of the country (from the `countryStore`
store), we also add a small 'star' at the top of each country panel. Clicking
this will toggle the `star` value to favorite or unfavorite the country:

```jsx
const Country = (props) => {
  const [star, setStar] = useCellState(
    () => props.tableId,
    () => props.rowId,
    'star',
    'starStore',
  );

  return (
    <div className="country">
      <div className="star" onClick={() => setStar(!star())}>
        {star() ? STAR : UNSTAR}
      </div>
      <div className="flag">
        <CellView
          tableId={props.tableId}
          rowId={props.rowId}
          cellId="emoji"
          store="countryStore"
        />
      </div>
      <div className="name">
        <CellView
          tableId={props.tableId}
          rowId={props.rowId}
          cellId="name"
          store="countryStore"
        />
      </div>
    </div>
  );
};
```

The styling for the main panel of the app is the same as the other Countries
demos:

```less
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

And that's it: the same country browser, but written idiomatically with Solid
primitives, components, and the ui-solid module.
