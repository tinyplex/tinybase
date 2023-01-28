# Averaging Dice Rolls

In this demo, we use a Metrics object to keep a count (and a rolling average) of
the values in each Cell in a Store. We roll a dice 48 times and keep track of
the average.

First, we pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase.js"></script>
<script src="/umd/ui-react.js"></script>
```

We import the functions and components we need, and create the Store object:

```js
const {MetricView, Provider, TableView, useCell} = TinyBaseUiReact;
const {createMetrics, createStore} = TinyBase;
const store = createStore();
```

To create the Metrics object, we use the createMetrics function, and configure
two definitions for it:

```js
const metrics = createMetrics(store)
  .setMetricDefinition('average', 'rolls', 'avg', 'result')
  .setMetricDefinition('count', 'rolls', 'sum');
```

Each roll is going to be rendered as a dice Unicode character:

```jsx
const Roll = ({tableId, rowId}) => (
  <span className="roll">
    {String.fromCharCode(9855 + useCell(tableId, rowId, 'result'))}
  </span>
);
```

The dice require a little styling:

```less
.roll {
  display: inline-block;
  font-size: 3rem;
  padding: 0 1rem;
  line-height: 3rem;
}
```

We then create a React app comprising two MetricView components and a TableView
component which will render the `Roll` components:

```jsx
ReactDOM.createRoot(document.body).render(
  <Provider store={store} metrics={metrics}>
    <p>
      Count: <MetricView metricId="count" />
      <br />
      Average: <MetricView metricId="average" />
    </p>
    <TableView tableId="rolls" rowComponent={Roll} />
  </Provider>,
);
```

To roll the dice, we add a new Row every half second with the result, until the
count of rolls reaches 48:

```js
let rolls = 0;
const interval = setInterval(() => {
  if (rolls++ == 48) {
    clearInterval(interval);
  } else {
    store.addRow('rolls', {
      result: Math.ceil(Math.random() * 6),
    });
  }
}, 500);
```

Add a little styling, and we're done!

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

body {
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  margin: 0;
}
p {
  margin: 1rem;
}
```

Next, we will use an IndexView component to group each Row of the Store object
based on the value in a Cell within it. Please continue to the Grouping Dice
Rolls demo.
