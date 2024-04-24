# Countries

In this demo, we build a simple app that uses React and a simple Store object to
load and display country data.

## Initialization

First, we pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase.js"></script>
<script src="/umd/persister-browser.js"></script>
<script src="/umd/persister-remote.js"></script>
<script src="/umd/ui-react.js"></script>
<script src="/umd/ui-react-dom-debug.js"></script>
```

We're adding the debug version of the ui-react-dom module so that we can use the
StoreInspector component for the purposes of seeing how the data is structured.

We import the functions and components we need:

```js
const {createIndexes, createStore, defaultSorter} = TinyBase;
const {createLocalPersister, createSessionPersister} = TinyBasePersisterBrowser;
const {
  CellView,
  IndexView,
  Provider,
  SliceView,
  useCell,
  useCreateIndexes,
  useCreatePersister,
  useCreateStore,
  useDelCellCallback,
  useSetCellCallback,
  useSetRowCallback,
  useSetValuesCallback,
  useSliceRowIds,
  useValues,
} = TinyBaseUiReact;
const {createRemotePersister} = TinyBasePersisterRemote;
const {useCallback} = React;
const {StoreInspector} = TinyBaseUiReactDomDebug;
```

We also set up some string constants for showing star emojis:

```js
const STAR = '\u2605';
const UNSTAR = '\u2606';
```

## Starting The App

We have a top-level `App` component, in which we initialize our data, and
render the parts of the app. Firstly, we create and memoize a set of three Store
objects with their schemas:

- `countryStore` contains a list of the world's countries, loaded once from a
  JSON file using a remote Persister object.
- `starStore` contains a list of the countries that the user has starred. This
  is persisted to the browser's local storage and starts with eight default
  starred countries.
- `viewStore` contains the Id of an Indexes object, the Id of an index, and
  the Id of a slice, persisted as keyed values to session storage. These three
  ids represent the 'current slice' view the user is looking at and we default
  the app to start showing the countries starting with the letter 'A'.

```js
const App = () => {
  const countryStore = useCreateStore(() =>
    createStore().setTablesSchema({
      countries: {emoji: {type: 'string'}, name: {type: 'string'}},
    }),
  );
  useCreatePersister(
    countryStore,
    (store) =>
      createRemotePersister(
        store,
        'https://tinybase.org/assets/countries.json',
      ),
    [],
    async (persister) => await persister.load(),
  );

  const starStore = useCreateStore(() =>
    createStore().setTablesSchema({countries: {star: {type: 'boolean'}}}),
  );
  useCreatePersister(
    starStore,
    (store) => createLocalPersister(store, 'countries/starStore'),
    [],
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
    [],
    async (persister) => {
      await persister.startAutoLoad();
      await persister.startAutoSave();
    },
  );
  // ...
```

We also create and memoize two Indexes objects with the useCreateIndexes hook:

- `countryIndexes` contains a single Index of countries in `countryStore` by
  their first letter, sorted alphabetically.
- `starIndexes` contains a single Index of the countries in `starStore`.

The code looks like this:

```js
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
`Countries` component, wrapped in a Provider component that references the Store
objects, and the Indexes objects:

```jsx
  // ...
  return (
    <Provider
      storesById={{countryStore, starStore, viewStore}}
      indexesById={{countryIndexes, starIndexes}}
    >
      <Filters />
      <Countries />
      <StoreInspector />
    </Provider>
  );
};
```

We also added the StoreInspector component at the end there so you can inspect
what is going on with the data during this demo. Simply click the TinyBase logo
in the corner.

We also use a simple grid layout to arrange the app:

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

```js
window.addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## The 'Current Slice'

At the heart of this app is the concept of the 'current slice': at any one time,
the app is displaying the countries present in a specific sliceId of a specific
indexId of a specific Indexes object. We store these three ids in the
`viewStore` as keyed values so they persist between reloads.

Since both the left-hand and right-hand panels of the app need to read these
parameters, we provide a custom `useCurrentSlice` hook to get those three Cell
values out of the `viewStore`:

```js
const useCurrentSlice = () => useValues('viewStore');
```

When a user clicks on the letters on the left-hand side of the app, we need to
write these values too. So we also provide a custom `useSetCurrentSlice` hook
that provides a callback to set the three Cell values:

```js
const useSetCurrentSlice = (indexes, indexId, sliceId) =>
  useSetValuesCallback(
    () => ({indexes, indexId, sliceId}),
    [indexes, indexId, sliceId],
    'viewStore',
  );
```

## The `Filters` Component

This component provides the list of countries' first letters down the left-hand
side of the app. We actually build this as an IndexView component that lists all
the `sliceIds` in the `countryIndexes` index, but also add an explicit item at
the top of the list to allow the user to select starred countries from the
`starIndexes` index.

The custom `useCurrentSlice` hook is used to get the current Indexes object
name, current indexId, and current sliceId. We use these to determine whether a
Filter is selected, and that flag is passed down as the `selected` prop to each
of the child Filter components so they know whether to display themselves as
selected or not. We could have each letter of the side bar listening for changes
to the current slice, but in this case it is more efficient to do it once and
pass down the `currentSlice` as a prop, using the `getSliceComponentProps`
callback:

```jsx
const Filters = () => {
  const {
    indexes: currentIndexes,
    indexId: currentIndexId,
    sliceId: currentSliceId,
  } = useCurrentSlice();

  return (
    <div id="filters">
      <Filter
        indexes="starIndexes"
        indexId="star"
        sliceId="true"
        label={STAR}
        selected={
          currentIndexes == 'starIndexes' &&
          currentIndexId == 'star' &&
          currentSliceId == 'true'
        }
      />
      <IndexView
        indexId="firstLetter"
        indexes="countryIndexes"
        sliceComponent={Filter}
        getSliceComponentProps={useCallback(
          (sliceId) => ({
            selected:
              currentIndexes == 'countryIndexes' &&
              currentIndexId == 'firstLetter' &&
              currentSliceId == sliceId,
          }),
          [currentIndexes, currentIndexId, currentSliceId],
        )}
      />
    </div>
  );
};
```

Each letter in the left hand `Filters` component is a `Filter` component, which
knows which Indexes object the app needs to show, along with the index and slice
Ids. This is set with the callback returned by the `useSetCurrentSlice` custom
hook.

For example, clicking the letter 'N' will set the current named Indexes object
to be `countryIndexes`, the current indexId to be `firstLetter`, and the current
sliceId to be 'N'. Clicking the star at the to of the list will set the current
named Indexes object to be `starIndexes`, the current indexId to be `star`, and
the current sliceId to be 'true'.

The `currentSlice` prop passed down from the `Filters` component is used to
decide whether to style the letter as the 'current' selection.

We also display the number of countries in the slice of the relevant index.
Instead of setting up a Metrics object to track this, it's simpler to just use
the useSliceRowIds hook and show the `length` of the resulting array. Only the
count of starred countries changes during the life of the app anyway:

```jsx
const Filter = ({
  indexes = 'countryIndexes',
  indexId,
  sliceId,
  selected,
  label = sliceId,
}) => {
  const handleClick = useSetCurrentSlice(indexes, indexId, sliceId);
  const className = 'filter' + (selected ? ' current' : '');
  const rowIdCount = useSliceRowIds(indexId, sliceId, indexes).length;

  return (
    <div className={className} onClick={handleClick}>
      <span className="label">{label}</span>
      <span className="count">{rowIdCount}</span>
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

The main right-hand side of the app is a panel that shows the view selected with
the left-hand `Filters` component. As we have seen, that component is setting
the 'current slice' to be shown, comprising the name of the Indexes object in
focus, an indexId, and a sliceId. We use those three parameters directly as the
props for the SliceView component that forms the main part of the app:

```jsx
const Countries = () => (
  <div id="countries">
    <SliceView {...useCurrentSlice()} rowComponent={Country} />
  </div>
);
```

Each Row that is present in the specified slice is a country, and the `Country`
component renders a small panel for each.

As well as rendering the name and flag of the country (from the `countryStore`
store), we also add a small 'star' at the top of each country panel. Clicking
this will either call the `setStar` callback to favorite the country by adding
it to the `starStore`, or it will call the `setUnstar` callback to unfavorite it
and remove it again:

```jsx
const Country = (props) => {
  const {tableId, rowId} = props;
  const star = useCell(tableId, rowId, 'star', 'starStore');
  const setStar = useSetCellCallback(
    tableId,
    rowId,
    'star',
    () => true,
    [],
    'starStore',
  );
  const setUnstar = useDelCellCallback(
    tableId,
    rowId,
    'star',
    true,
    'starStore',
  );
  const handleClick = star ? setUnstar : setStar;

  return (
    <div className="country">
      <div className="star" onClick={handleClick}>
        {star ? STAR : UNSTAR}
      </div>
      <div className="flag">
        <CellView {...props} cellId="emoji" store="countryStore" />
      </div>
      <div className="name">
        <CellView {...props} cellId="name" store="countryStore" />
      </div>
    </div>
  );
};
```

Removing a country from the `starStore` store rather than setting the `star`
flag to false prevents the `starStore` store from growing to include all the
countries that were _ever_ starred, even if no longer so. Since we are storing
this in the browser, it's more efficient just to remove it.

The styling for the main panel of the app is a little more complex, but we want
the country cards and flags to look good!

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

And that's it! A simple app, all in all, but one that demonstrates using Indexes
objects and passing down props to build a useful stateful user interface.
