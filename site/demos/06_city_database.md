# City Database

In this demo, we build an app that loads over 140,000 records to push the size
and performance limits of TinyBase.

We use [Opendatasoft
GeoNames](https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000)
as the source of the information in this app. Thank you for a great data set to
demonstrate TinyBase!

## Boilerplate

As per usual, we first pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase/index.js"></script>
<script src="/umd/tinybase/ui-react/index.js"></script>
<script src="/umd/tinybase/ui-react-dom/index.js"></script>
<script src="/umd/tinybase/ui-react-inspector/index.js"></script>
```

We're using the Inspector component for the purposes of seeing how the data is
structured.

We need the following parts of the TinyBase API, the ui-react module, and React
itself:

```js
const {createQueries, createStore} = TinyBase;
const {Provider, useCreateStore} = TinyBaseUiReact;
const {createElement, useMemo, useState} = React;
const {Inspector} = TinyBaseUiReactInspector;
const {SortedTableInHtmlTable} = TinyBaseUiReactDom;
```

## Initializing The Application

In the main part of the application, we initialize a default Store (called
`store`) that contains a single Table of cities.

The Store object is memoized by the useCreateStore method so it only created the
first time the app is rendered.

```jsx
const App = () => {
  const store = useCreateStore(createStore);
  // ...
```

This application depends on loading data into the main Store the first time it
is rendered. We do this by having an `isLoading` flag in the application's
state, and setting it to `false` only once the asynchronous loading sequence in
the (soon-to-be described) `loadCities` function has completed. Until then, a
loading spinner is shown.

```jsx
  // ...
  const [isLoading, setIsLoading] = useState(true);
  useMemo(async () => {
    await loadCities(store);
    setIsLoading(false);
  }, []);

  return (
    <Provider store={store}>
      {isLoading ? <Loading /> : <Body />}
      <Inspector />
    </Provider>
  );
}
```

We added the Inspector component at the end there so you can inspect what is
going on with the data during this demo. Simply click the TinyBase logo in the
corner.

With simple boilerplate code to load the component, off we go:

```jsx
addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## Loading Spinner

Let's quickly dispatch with the loading spinner, a plain element with some CSS.

```jsx
const Loading = () => <div id="loading" />;
```

This is styled as a 270° arc with a spinning animation:

```less
#loading {
  animation: spin 1s infinite linear;
  height: 2rem;
  margin: 40vh auto;
  width: 2rem;
  &::before {
    content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 100 100"><path d="M50 10A40 40 0 1 1 10 50" stroke="black" fill="none" stroke-width="4" /></svg>');
  }
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## Main Body

The main body of the application is shown once the loading has completed and the
spinner has disappeared. It simply contains the city table.

```jsx
const Body = () => {
  return (
    <main>
      <CityTable />
    </main>
  );
};
```

Again, this component has minimal styling:

```less
main {
  padding: 0.5rem;
}
```

## Loading The Data

The city data for the application has been converted into a tab-separated
variable format. TSV files are smaller and faster than JSON to load over the
wire.

We extract the column names from the top of the TSV, coerce numeric Cell values,
and load everything into a standard Table called `cities`. Everything is wrapped
in a transaction for performance.

```js
const NUMERIC = /^[\d\.-]+$/;

const loadCities = async (store) => {
  const rows = (
    await (await fetch(`https://tinybase.org/assets/cities.tsv`)).text()
  ).split('\n');
  const cellIds = rows.shift().split('\t');
  store.transaction(() =>
    rows.forEach((row, rowId) =>
      row
        .split('\t')
        .forEach((cell, c) =>
          store.setCell(
            'cities',
            rowId,
            cellIds[c],
            NUMERIC.test(cell) ? parseFloat(cell) : cell,
          ),
        ),
    ),
  );
};
```

`loadCities` was the function referenced in the [main `App`
component](#initializing-the-application), so once this completes, the data is
loaded and we're ready to go.

Finally, since the structure of the Table is well known, we create a constant
list of column names for use when rendering:

```js
const CUSTOM_CELLS = [
  'Name',
  'Country',
  'Population',
  'Latitude',
  'Longitude',
  'Elevation',
];
```

Now let's render this data!

## The `CityTable` Component

This is the component that renders city data in a table. Previously there was a
whole table implementation in this demo, but as of TinyBase v4.1, we just use
the SortedTableInHtmlTable component from the new ui-react-dom module straight
out of the box!

```jsx
const CityTable = () => (
  <SortedTableInHtmlTable
    tableId="cities"
    cellId="Population"
    descending={true}
    limit={10}
    sortOnClick={true}
    paginator={true}
    customCells={CUSTOM_CELLS}
    idColumn={false}
  />
);
```

In other words, it starts off sorting cities by population in descending order,
has interactive column headings to change the sorting, and has a paginator for
going through cities in pages of ten.

The table benefits from some light styling for the pagination buttons and the
table itself:

```less
table {
  border-collapse: collapse;
  font-size: inherit;
  line-height: inherit;
  margin-top: 0.5rem;
  table-layout: fixed;
  width: 100%;
  caption {
    text-align: left;
    button {
      border: 0;
      margin-right: 0.25rem;
    }
  }
  th,
  td {
    overflow: hidden;
    padding: 0.15rem 0.5rem 0.15rem 0;
    white-space: nowrap;
  }
  th {
    border: solid #ddd;
    border-width: 1px 0;
    cursor: pointer;
    text-align: left;
    width: 15%;
    &:nth-child(1) {
      width: 25%;
    }
  }
  td {
    border-bottom: 1px solid #eee;
  }
}
```

That's it for the components.

## Default Styling

We finish off with the default CSS styling and typography that the app uses:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  user-select: none;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  font-size: 0.8rem;
  line-height: 1.5rem;
  margin: 0;
  color: #333;
}
```

## Conclusion

When run, you will see the spinner while the application loads the data. The
time taken will depend to a large degree on your network connection since the
data is 5 megabytes or so.

But once loaded, the app remains reasonably responsive. Even on a slow device,
sorting by a high cardinality string column (such as name) typically takes well
less than a second. A high cardinality numeric column (such as population) takes
a few hundred milliseconds. Low cardinality columns (like country) are even
faster - and pagination is also sub-hundred milliseconds.
