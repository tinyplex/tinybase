# Sorting And Types

This demo shows how chart components handle common x value shapes: continuous
numeric values, ordered category labels, and boolean categories. In each case,
y values must be finite numbers.

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

We need a Store, a Provider, and the chart components:

```js
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'tinybase';
import {Provider, useCreateStore} from 'tinybase/ui-react';
import {
  BarChart,
  BarSeries,
  CartesianChart,
  LineChart,
} from 'tinybase/ui-react-dom-charts';
```

## The App

The Store contains three small Tables so each chart can focus on one data
binding behavior:

```jsx
const App = () => {
  const store = useCreateStore(() =>
    createStore()
      .setTable('measurements', {
        third: {x: 3, score: 17},
        first: {x: 1, score: 8},
        fifth: {x: 5, score: 27},
        second: {x: 2, score: 13},
        fourth: {x: 4, score: 22},
      })
      .setTable('channels', {
        organic: {channel: 'Organic', rank: 1, visits: 39},
        referral: {channel: 'Referral', rank: 3, visits: 24},
        paid: {channel: 'Paid', rank: 2, visits: 31},
        direct: {channel: 'Direct', rank: 4, visits: 18},
      })
      .setTable('flags', {
        active: {enabled: true, order: 1, accounts: 28},
        inactive: {enabled: false, order: 2, accounts: 11},
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

When the x values are all numbers, a LineChart uses a continuous x axis. String
and boolean x values are categories, and can be ordered with `sortCellId`:

```jsx
const Body = () => (
  <main>
    <header>
      <p>Sorting And Types</p>
      <h1>Numeric, string, and boolean x values</h1>
    </header>
    <section>
      <h2>Continuous Numbers</h2>
      <LineChart
        className="chart chart-numbers"
        tableId="measurements"
        xCellId="x"
        yCellId="score"
      />
    </section>
    <section>
      <h2>Sorted Categories</h2>
      <BarChart
        className="chart chart-categories"
        tableId="channels"
        xCellId="channel"
        yCellId="visits"
        sortCellId="rank"
      />
    </section>
    <section>
      <h2>Boolean Categories</h2>
      <CartesianChart className="chart chart-booleans" tableId="flags">
        <BarSeries
          className="series-accounts"
          label="Accounts"
          sortCellId="order"
          xCellId="enabled"
          yCellId="accounts"
        />
      </CartesianChart>
    </section>
  </main>
);
```

## Styling

The same CSS structure works across all three examples:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  background:
    radial-gradient(circle at 8% 10%, #d7f4e8 0 10rem, transparent 16rem),
    linear-gradient(135deg, #f8fbff, #e9f0f8);
  color: #172033;
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
  color: #2b8c67;
  font-weight: 700;
  text-transform: uppercase;
}

section {
  background: #fffffff2;
  border: 1px solid #d9e3df;
  border-radius: 0.9rem;
  box-shadow: 0 1rem 2rem #17203314;
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
  color: #dfe8e3;
  stroke-dasharray: 3 5;
}

.chart .axes {
  color: #7b8d82;
}

.chart .axes .title {
  fill: #172033;
  font-weight: 700;
}

.chart .area {
  fill: #2b8c67;
  fill-opacity: 0.12;
}

.chart .line {
  fill: none;
  stroke: #2b8c67;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.chart .points {
  fill: white;
  stroke: #2b8c67;
  stroke-width: 2;
}

.chart .bar {
  fill: #5367c9;
}

.chart-booleans .bar {
  fill: #d16b3f;
}

@media (max-width: 52rem) {
  main {
    grid-template-columns: 1fr;
  }
}
```

Numbers become a continuous x scale for line charts. Strings and booleans become
ordered categories, with boolean labels rendered as `true` and `false`.
