# Composing Charts

This demo shows how CartesianChart can render multiple child series from the
same Table. Each child series owns its own Cell bindings, while the parent chart
coordinates the shared axes and layout.

## Boilerplate

First, we create the import aliases for TinyBase and React modules we'll need:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-react": "https://esm.sh/tinybase/ui-react@",
      "tinybase/ui-react-dom-charts": "https://esm.sh/tinybase/ui-react-dom-charts@",
      "react": "https://esm.sh/react@",
      "react/jsx-runtime": "https://esm.sh/react/jsx-runtime@",
      "react-dom/client": "https://esm.sh/react-dom/client@"
    }
  }
</script>
```

We need a Store, a Provider, and the composable chart components:

```js
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'tinybase';
import {Provider, useCreateStore} from 'tinybase/ui-react';
import {
  BarSeries,
  CartesianChart,
  LineSeries,
} from 'tinybase/ui-react-dom-charts';
```

## The App

The Store has one row per month. Different y Cells can then become different
series in the same chart:

```jsx
const App = () => {
  const store = useCreateStore(() =>
    createStore().setTable('sales', {
      jan: {month: 'Jan', order: 1, revenue: 62, profit: 33, orders: 18},
      feb: {month: 'Feb', order: 2, revenue: 48, profit: 24, orders: 14},
      mar: {month: 'Mar', order: 3, revenue: 31, profit: 19, orders: 10},
      apr: {month: 'Apr', order: 4, revenue: 73, profit: 41, orders: 24},
      may: {month: 'May', order: 5, revenue: 39, profit: 22, orders: 12},
      jun: {month: 'Jun', order: 6, revenue: 55, profit: 30, orders: 17},
    }),
  );

  return (
    <Provider store={store}>
      <Body />
    </Provider>
  );
};

addEventListener('load', () => createRoot(document.body).render(<App />));
```

## The Chart Gallery

Each CartesianChart supplies the source and frame. LineSeries and BarSeries
children then declare their own `xCellId`, `yCellId`, `sortCellId`, labels, and
CSS classes:

```jsx
const Body = () => (
  <main>
    <header>
      <p>Composition</p>
      <h1>One source, multiple series</h1>
    </header>
    <section>
      <h2>Two Lines</h2>
      <CartesianChart className="chart chart-lines" tableId="sales">
        <LineSeries
          className="series-revenue"
          label="Revenue"
          sortCellId="order"
          xCellId="month"
          yCellId="revenue"
        />
        <LineSeries
          className="series-profit"
          label="Profit"
          sortCellId="order"
          xCellId="month"
          yCellId="profit"
        />
      </CartesianChart>
    </section>
    <section>
      <h2>Grouped Bars</h2>
      <CartesianChart className="chart chart-bars" tableId="sales">
        <BarSeries
          className="series-orders"
          label="Orders"
          sortCellId="order"
          xCellId="month"
          yCellId="orders"
        />
        <BarSeries
          className="series-profit"
          label="Profit"
          sortCellId="order"
          xCellId="month"
          yCellId="profit"
        />
      </CartesianChart>
    </section>
    <section>
      <h2>Bars With A Line</h2>
      <CartesianChart className="chart chart-mixed" tableId="sales">
        <BarSeries
          className="series-orders"
          label="Orders"
          sortCellId="order"
          xCellId="month"
          yCellId="orders"
        />
        <LineSeries
          className="series-revenue"
          label="Revenue"
          sortCellId="order"
          xCellId="month"
          yCellId="revenue"
        />
      </CartesianChart>
    </section>
  </main>
);
```

## Styling

Because every series has a className, CSS can style each series independently:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  background: #f6f1e7;
  color: #1f2937;
  font-family: Inter, sans-serif;
  margin: 0;
}

main {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 1.5rem;
}

header {
  grid-column: 1 / -1;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  letter-spacing: -0.06em;
}

h2 {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

p {
  color: #c05f35;
  font-weight: 700;
  text-transform: uppercase;
}

section {
  background: white;
  border: 1px solid #eadfce;
  border-radius: 0.9rem;
  box-shadow: 0 1rem 2rem #1f29371a;
  min-width: 0;
  padding: 1rem;
}

.chart {
  display: block;
  font-size: 12px;
  height: 19rem;
  padding: 0.75rem;
  width: 100%;
}

.chart .grid {
  color: #e1d7c7;
  stroke-dasharray: 3 5;
}

.chart .axes {
  color: #8b8173;
}

.chart .axes .title {
  fill: #1f2937;
  font-weight: 700;
}

.chart .area {
  fill-opacity: 0.1;
}

.chart .line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.chart .points {
  fill: white;
  stroke-width: 2;
}

.series-revenue .area {
  fill: #2b8c67;
}

.series-revenue .line,
.series-revenue .points {
  stroke: #2b8c67;
}

.series-profit .area {
  fill: #d16b3f;
}

.series-profit .line,
.series-profit .points {
  stroke: #d16b3f;
}

.series-profit .bar {
  fill: #d16b3f;
}

.series-orders .bar {
  fill: #5367c9;
}

.chart-mixed .series-revenue .area {
  fill: none;
}

.chart-mixed .series-revenue .line {
  stroke-width: 4;
}

@media (max-width: 52rem) {
  main {
    grid-template-columns: 1fr;
  }
}
```

Composition keeps data binding local to each series, while the parent chart
still handles shared bounds, axes, grid lines, and tooltips.
