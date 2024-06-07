# Car Analysis

In this demo, we build an app that showcases the query capabilities of TinyBase
v2.0, grouping and sorting dimensional data for lightweight analytical usage.

The data from this demo is derived from `cars.json` in the [Vega
datasets](https://github.com/vega/vega-datasets) - thank you [UW Interactive
Data Lab](https://idl.cs.washington.edu/)!

## An Overview Of The Data

Before looking at code, let's familiarize ourselves with the data used in this
application.

The raw data is loaded from a TSV file into one single Table object: `cars`, and
comprises almost 400 records of cars made in the 1970s and 1980s.

For each, the data includes the manufacturer, the car name, year, and region.
These Cell values are 'dimensions' with which the data can be grouped.

Each record also includes a number of quantitative fields, including the car's
miles-per-gallon (MPG), the number of cylinders, their displacement, its
horsepower, weight, and acceleration. These Cell values are 'measures' which can
be aggregated together - in this basic app, to find their average, maximum, or
minimum.

The app is oriented around one single query. As the user picks different
dimensions or measures in the app's sidebar, that query is re-run and the
results (either in graphical or tabular form) reactively update immediately.

## Boilerplate

As per usual, we first pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase/index.js"></script>
<script src="/umd/tinybase/ui-react/index-debug.js"></script>
<script src="/umd/tinybase/ui-react-dom/index-debug.js"></script>
```

We're adding the debug version of the ui-react-dom module so that we can use the
StoreInspector component for the purposes of seeing how the data is structured.

We need the following parts of the TinyBase API, the ui-react module, and React
itself:

```js
const {createQueries, createStore} = TinyBase;
const {
  Provider,
  useCreateQueries,
  useCreateStore,
  useQueries,
  useResultCell,
  useResultSortedRowIds,
  useResultTable,
} = TinyBaseUiReactDebug;
const {createElement, useCallback, useEffect, useMemo, useRef, useState} =
  React;
const {ResultSortedTableInHtmlTable, StoreInspector} = TinyBaseUiReactDomDebug;
```

For simplicity, we set up a few convenience arrays that distinguish the columns
present in the data. In a more comprehensive app, these could certainly be
programmatically determined.

```js
const DIMENSION_CELL_IDS = ['Manufacturer', 'Name', 'Year', 'Region'];

const MEASURE_CELL_IDS = [
  'MPG',
  'Cylinders',
  'Displacement',
  'Horsepower',
  'Weight',
  'Acceleration',
];
```

We also set up the list of aggregations that are available in the user interface:

```js
const AGGREGATES = {
  Maximum: 'max',
  Average: 'avg',
  Minimum: 'min',
};
```

We set up some constants that we'll use in the app to help arrange the
graph elements, and to detect numeric values in the imported files so that they
can added to the Store as numbers:

```js
const GRAPH_FONT = 11;
const GRAPH_PADDING = 5;
const NUMERIC = /^[\d\.]+$/;
```

And finally, while we are here, we create a handy little function to round down
numbers to two significant figures. Nothing clever but sufficient for this basic
application.

```js
const round = (value) => Math.round(value * 100) / 100;
```

## Initializing The Application

In the main part of the application, we want to initialize a default Store
(called `store`) and a default Queries object. At this point, we are not
configuring any queries yet.

The two Store objects and the Queries object are memoized by the useCreateStore
method and useCreateQueries method so they are only created the first time the
app is rendered.

```jsx
const App = () => {
  const store = useCreateStore(createStore);
  const queries = useCreateQueries(store, createQueries);
  // ...
```

This application depends on loading data into the main Store the first time it
is rendered. We do this by having an `isLoading` flag in the application's
state, and setting it to `false` only once the asynchronous loading sequence in
the (soon-to-be described) `loadStore` function has completed. Until then, a
loading spinner is shown.

```jsx
  // ...
  const [isLoading, setIsLoading] = useState(true);
  useMemo(async () => {
    await loadTable(store);
    setIsLoading(false);
  }, []);

  return (
    <Provider store={store} queries={queries}>
      {isLoading ? <Loading /> : <Body />}
      <StoreInspector />
    </Provider>
  );
}
```

We also added the StoreInspector component at the end there so you can inspect
what is going on with the data during this demo. Simply click the TinyBase logo
in the corner.

The loading spinner itself is a plain element with some CSS.

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

And finally this simple boilerplate code loads the main `App` component to start
things off:

```jsx
addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## Loading The Data

The car data has been converted into a tab-separated variable format. TSV files
are smaller and faster than JSON to load over the wire.

In this loading function, we extract the column names from the top of the TSV,
check each row has a matching cardinality, use the first column as the Row Id,
coerce numeric Cell values, and load everything into a standard Table.

```js
const loadTable = async (store) => {
  const rows = (
    await (await fetch(`https://tinybase.org/assets/cars.tsv`)).text()
  ).split('\n');
  const cellIds = rows.shift().split('\t');
  store.transaction(() =>
    rows.forEach((row, rowId) => {
      const cells = row.split('\t');
      if (cells.length == cellIds.length) {
        cells.forEach((cell, c) => {
          if (cell != '') {
            if (NUMERIC.test(cell)) {
              cell = parseFloat(cell);
            }
            store.setCell('cars', rowId, cellIds[c], cell);
          }
        });
      }
    }),
  );
};
```

Remember, `loadStore` was the function referenced in the [main `App`
component](#initializing-the-application), so once this completes, the data is
loaded and we're ready to go.

## The `Body` Component

The user interface of the application has two modes: a graphical rendering of
aggregated data, and a tabular one. In both cases there is a sidebar down the
left hand side that allows the user to select dimensions, measures, and the
aggregation to be used.

The `Body` component wraps the sidebar and the field selection state, and then
the `ResultGraph` and `ResultTable` components render the two modes.

The state of the application is based on selected dimensions and measures, which
aggregate is used, and whether the data is rendered as a table. This is
set up with the following hooks:

```js
const Body = () => {
  const [dimensions, setDimensions] = useState(['Manufacturer']);
  const [measures, setMeasures] = useState(['MPG', 'Horsepower']);
  const [aggregate, setAggregate] = useState('Average');
  const [showTable, setAsGraph] = useState(false);
  // ...
```

The first three of these state variables - `dimensions`, `measures`, and
`aggregate` - are used to create a query from the `cars` Table, and group the
fields accordingly. We run the memoized creation of the query in a separate
hook (which we'll come to shortly), and get its Id so we can use it in the UI:

```js
const queryId = useBuildQuery(dimensions, measures, aggregate);
```

Here we render the left-hand sidebar, showing the available dimensions,
measures, and aggregates. We also show a toggle for the tabular view, and offer
a link to the source of the data. (We'll also cover the simple `Select`
component later.)

```jsx
return (
  <>
    <aside>
      <b>Dimensions</b>
      <Select
        options={DIMENSION_CELL_IDS}
        selected={dimensions}
        onOptionsChange={setDimensions}
      />
      <hr />
      <b>Measures</b>
      <Select
        options={MEASURE_CELL_IDS}
        selected={measures}
        onOptionsChange={setMeasures}
      />
      <hr />
      <b>Aggregate</b>
      <Select
        options={Object.keys(AGGREGATES)}
        selected={[aggregate]}
        onOptionsChange={setAggregate}
        multiple={false}
      />
      <hr />
      <input
        id="showTable"
        type="checkbox"
        checked={showTable}
        onChange={useCallback(({target}) => setAsGraph(target.checked), [])}
      />
      <label for="showTable">Show table</label>
      <br />
      <small>
        <a href="https://github.com/vega/vega-datasets/blob/next/data/cars.json">
          Source
        </a>
      </small>
    </aside>
    {/* ... */}
```

We complete the `Body` component with a simple toggle between the two main
views, which of course we will also shortly explore in detail. Both take the
query Id and the columns to display:

```jsx
      {/* ... */}
      {showTable ? (
        <ResultTable
          queryId={queryId}
          columns={[...dimensions, ...measures]}
        />
      ) : (
        <ResultGraph
          queryId={queryId}
          dimensions={dimensions}
          measures={measures}
        />
      )}
    </>
  );
};
```

That's the main outer structure of the application, but a lot of the magic is in
the `useBuildQuery` hook we mentioned earlier. Whenever the dimensions,
measures, or aggregate selections change, we want to run a new query on the data
accordingly. Here's the implementation:

```js
const useBuildQuery = (dimensions, measures, aggregate) =>
  useMemo(() => {
    useQueries().setQueryDefinition('query', 'cars', ({select, group}) => {
      dimensions.forEach((cellId) => select(cellId));
      measures.forEach((cellId) => {
        select(cellId);
        group(cellId, AGGREGATES[aggregate]);
      });
    });
    return 'query';
  }, [dimensions, measures, aggregate]);
```

The whole hook is memoized so that the query is not run every time the `Body`
component is run. The query is (imaginatively) called `query`, and is against
the `cars` Table in the main Store. The query simply selects every selected
dimension, and every selected measure. Each measure is then grouped with the
selected aggregate.

And that's it! Enough to query the dataset such that both the graphical and
tabular views work. We'll dive into _their_ implementations next.

The styling for the main part of the application is simple:

```less
body {
  display: flex;
  height: 100vh;
}

aside {
  background: #ddd;
  flex: 0;
  padding: 0.5rem 0.5rem 0;
}

main {
  background: #fff;
  flex: 1;
  max-height: 100vh;
  padding: 0.5rem;
}

input {
  height: 1.5rem;
  margin: 0 0.25rem 0 0;
  vertical-align: bottom;
}

hr {
  margin: 0.5rem 0 0.1rem;
}
```

## The `ResultTable` Component

We start with the tabular view since it's a little simpler than the graph.
There's a slightly more generalized version of this component described in the
TinyMovies demo. This one is quite simple.

Previously there was a whole table implementation in this demo, but as of
TinyBase v4.1, we just use the ResultSortedTableInHtmlTable component from the
new ui-react-dom module straight out of the box. The only extra step is
transforming the array of selected columns into the customCells prop to render.

```jsx
const ResultTable = ({queryId, columns}) => (
  <ResultSortedTableInHtmlTable
    queryId={queryId}
    sortOnClick={true}
    paginator={true}
    limit={10}
    idColumn={false}
    customCells={useMemo(
      () =>
        Object.fromEntries(
          columns.map((column) => [column, {component: CustomCell}]),
        ),
      [...columns],
    )}
  />
);
```

We're using a slightly custom component for the table cells. If a Cell has a
numeric value, we crudely round it to two decimal places. Also we give it the
cellId as className so we can color the left-hand border.

```jsx
// ...
const CustomCell = ({queryId, rowId, cellId}) => {
  const cell = useResultCell(queryId, rowId, cellId);
  return (
    <span className={cellId}>{Number.isFinite(cell) ? round(cell) : cell}</span>
  );
};
```

The styling for the grid is as follows:

```less
table {
  width: 100%;
  table-layout: fixed;
  font-size: inherit;
  line-height: inherit;
  border-collapse: collapse;
  align-self: flex-start;
  margin: 0.5rem;
  caption {
    text-align: left;
    height: 1.75rem;
    button {
      border: 0;
      margin-right: 0.25rem;
    }
  }
  th,
  td {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  th {
    padding: 0.25rem;
    cursor: pointer;
    border: solid #ddd;
    border-width: 1px 0;
    text-align: left;
  }
  td {
    border-bottom: 1px solid #eee;
    span {
      border-left: 2px solid transparent;
      padding: 0.25rem;
      line-height: 1.75rem;
    }
  }
}
```

Before we go any further, click around in the tabular view to get a sense of how
this component works.

## The `ResultGraph` Component

The graph view has a little bit more going on, but has the same principle as the
grid: it takes the query Id, and the list of columns to use - this time
distinguished as dimensions (for the x-axis) and measures (against the y-axis).

The graph is rendered in SVG, and to lay it out effectively, we need to know the
size of the component on the screen. To track this, we use the browser's
`ResizeObserver` API, and set width and height state variables whenever it changes:

```jsx
const ResultGraph = ({queryId, dimensions, measures}) => {
  const ref = useRef(null);
  const [{width = 0, height = 0}, setDimensions] = useState({});
  useEffect(() => {
    const observer = new ResizeObserver(([{contentRect}]) =>
      setDimensions(contentRect),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  // ...
```

Next we scan the data from the query to put it into the structure we need for
the graph. We want a list of all the compound x-axis labels, and a series of
y values for every measure. We also use this phase to get the maximum y value
present so we can decide how high to make the y-axis:

```jsx
// ...
const [xAllLabels, yValueSets, yMax] = useGraphData(
  queryId,
  dimensions,
  measures,
);
// ...
```

We'll look at the `useGraphData` implementation shortly.

Next we take those values and prepare the configuration of the graph itself. The
`useGraphSetup` hook (which we will also look at shortly) returns two functions
we'll use to lay the SVG elements out. It also returns the exact labels to
display on both axes, for example, which take into account how many can be
shown, and at a suitable frequency.

```jsx
// ...
const [xToPixel, yToPixel, xLabels, yLabels, xRange] = useGraphSetup(
  width,
  height,
  xAllLabels,
  yMax,
);
// ...
```

At this point, we can bail out if the page hasn't fully rendered and the width
and height aren't set yet:

```jsx
// ...
if (width == 0 || height == 0) {
  return <main ref={ref} />;
}
// ...
```

But if they are, we can go ahead and build the SVG chart. Firstly the bounding
box and x-axis:

```jsx
// ...
return (
  <main ref={ref}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={`M${xToPixel(0)} ${yToPixel(0)}H${xToPixel(xRange)}`} />
```

Next, the x-axis labels, offset a little and rotated 90°:

```jsx
<>
  {xLabels.map((xLabel, x) => {
    const textX = xToPixel(x) - GRAPH_FONT / 2;
    const textY = yToPixel(0) + GRAPH_PADDING;
    return (
      xLabel && (
        <text transform={`translate(${textX} ${textY}) rotate(90)`} key={x}>
          {xLabel}
        </text>
      )
    );
  })}
</>
```

Then, the y-axis labels, right-aligned:

```jsx
<>
  {yLabels.map((yLabel) => {
    const textX = xToPixel(0) - GRAPH_PADDING;
    const textY = yToPixel(yLabel) + GRAPH_FONT / 2;
    return (
      <text
        transform={`translate(${textX} ${textY})`}
        text-anchor="end"
        key={yLabel}
      >
        {yLabel}
      </text>
    );
  })}
</>
```

And finally a `<path />` for each measure, as well as series of (by default
hidden) `<circle />` and `<text />` elements tht serve as hover-over labels for
each data point:

```jsx
        {/* ... */}
        {yValueSets.map((yValueSet, s) => (
          <g className={measures[s]} key={s}>
            <path
              d={yValueSet
                .map(
                  (y, x) =>
                    `${x == 0 ? 'M' : 'L'}${xToPixel(x)} ${yToPixel(y)}`,
                )
                .join('')}
            />
            {yValueSet.map((y, x) => (
              <>
                <circle cx={xToPixel(x)} cy={yToPixel(y)} r={GRAPH_PADDING} />
                <text x={xToPixel(x)} y={yToPixel(y) - GRAPH_FONT}>
                  {xAllLabels[x]} {measures[s]}: {round(y)}
                </text>
              </>
            ))}
          </g>
        ))}
      </svg>
    </main>
  );
};
```

There's some styling for the SVG chart, which also takes care of the behavior of
the hover-over tooltips.

```less
svg {
  stroke: #666;
  stroke-width: 1;
  fill: #333;
  text {
    stroke: #fff;
    stroke-width: 4;
    paint-order: stroke;
    font-size: 12;
  }
  path {
    fill: none;
  }
  circle {
    stroke-width: 2;
    fill: #fff;
    opacity: 0;
    & + text {
      text-anchor: middle;
      display: none;
    }
    &:hover {
      opacity: 1;
      & + text {
        display: block;
      }
    }
  }
}
```

We have also had a cheeky convention of setting the CSS class names to be Cell
Ids. This allows us to have a consistent color scheme for the measures, across
both the sidebar, the table, and the graph:

```less
.measure(@color) {
  stroke-width: 2;
  stroke: @color;
  border-color: @color;
  fill: @color;
}

.MPG {
  .measure(#FFB300);
}
.Cylinders {
  .measure(#803e75);
}
.Displacement {
  .measure(#FF6800);
}
.Horsepower {
  .measure(#A6BDD7);
}
.Weight {
  .measure(#C10020);
}
.Acceleration {
  .measure(#98ce62);
}
```

## Structuring the Graph Data

The following two hooks are needed to configure the data and layout for
the graph.

The first takes the query and the two types of columns. For each Row, it
concatenates the dimensional cells together (to create the labels on the
x-axis) and puts the quantitative measure cells into columnar series so we can
plot each line. It also determines the maximum y value to be displayed on the
chart.

Note that the Row Ids are sorted according to the values of the first measure
selected. In a real analytical scenario, this would be better to be configurable.

```js
const useGraphData = (queryId, dimensions, measures) => {
  const table = useResultTable(queryId);
  const sortedRowIds = useResultSortedRowIds(queryId, measures[0] ?? undefined);
  return useMemo(() => {
    const yAll = [1];
    const xAllLabels = [];
    const yValueSets = measures.map(() => []);
    sortedRowIds.forEach((rowId) => {
      const row = table[rowId];
      xAllLabels.push(
        dimensions.map((dimensionColumn) => row[dimensionColumn]).join(', '),
      );
      measures.forEach((measureColumn, m) => {
        yAll.push(row[measureColumn]);
        yValueSets[m].push(row[measureColumn]);
      });
    });
    return [xAllLabels, yValueSets, Math.max(...yAll)];
  }, [table, sortedRowIds, measures, dimensions]);
};
```

The second hook is responsible for configuring the graph's layout. It takes the
width and height of the containing element, all the available x-axis labels, and
the maximum y value. It then returns two functions for mapping from x/y values
to SVG pixels, the set of actual labels to display on each axis (taking into
account spacing them so they don't overlap), and the ranges of the two axes.

It's not particularly important to understand the mathematics of this hook to
understand TinyBase! These are mostly just to create well-spaced labels on the
axes, and in a real-world application, you'd be more likely to use more powerful
charting support from something like D3 or Vega.

```js
const useGraphSetup = (width, height, xAllLabels, yMax) =>
  useMemo(() => {
    const xOffset = height / 4;
    const yOffset = width / 15;
    const xWidth = width - yOffset - GRAPH_PADDING;
    const yHeight = height - xOffset - GRAPH_PADDING;

    const xRange = xAllLabels.length - 1;
    const xLabels = xAllLabels.map((label, x) =>
      x % Math.ceil((GRAPH_FONT * xRange) / xWidth) == 0 ? label : null,
    );

    const yMaxMagnitude = Math.pow(10, Math.floor(Math.log10(yMax)));
    const yRange = Math.ceil(yMax / yMaxMagnitude) * yMaxMagnitude;
    const yMajorSteps = Math.ceil(yMax / yMaxMagnitude);
    const yMinorSteps = yMajorSteps <= 2 ? 5 : yMajorSteps <= 5 ? 2 : 1;
    const yLabels = Array(yMinorSteps * yMajorSteps + 1)
      .fill()
      .map((_, i) => (i * yMaxMagnitude) / yMinorSteps);

    return [
      (x) => yOffset + (x * xWidth) / xRange,
      (y) => GRAPH_PADDING + yHeight - (y * yHeight) / yRange,
      xLabels,
      yLabels,
      xRange,
      yRange,
    ];
  }, [width, height, xAllLabels, yMax]);
```

## The `Select` Component

To build the `Body` application sidebar, we use some `<select />` elements. This
simple `Select` component provides a wrapper around that to callback with either
the array of values, or a single value, when selected.

```jsx
const Select = ({options, selected, onOptionsChange, multiple = true}) => {
  const handleOptionsChange = useCallback(
    ({target}) =>
      onOptionsChange(
        multiple
          ? [...target.selectedOptions].map((option) => option.value)
          : target.value,
      ),
    [onOptionsChange],
  );
  return (
    <select
      multiple={multiple}
      size={options.length}
      onChange={handleOptionsChange}
    >
      {options.map((option) => (
        <option
          value={option}
          selected={selected.includes(option)}
          className={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
};
```

Note that each option is given a CSS class so that we can display the consistent
colors for each measure.

The `Select` component has some styling of its own:

```less
select {
  border: 1px solid #ccc;
  display: block;
  font: inherit;
  letter-spacing: inherit;
  width: 10rem;
  option {
    border-left: 2px solid transparent;
  }
}
```

## Default Styling

We finish off with a few final pieces of CSS that are applied across the application.

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  color: #333;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  font-size: 0.8rem;
  line-height: 1.4rem;
  margin: 0;
  user-select: none;
}
```
