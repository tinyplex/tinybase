# Sorting And Types

![Sorting And Types](/shots/sorting-and-types-react-demo.png)

This demo shows how chart components handle common x value shapes: continuous
numeric values, ISO date strings, ordered category labels, and boolean
categories. In each case, y values must be finite numbers.

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
      .setTable('daily', {
        d1: {day: '2026-01-01', signups: 11},
        d2: {day: '2026-01-02', signups: 17},
        d3: {day: '2026-01-05', signups: 21},
        d4: {day: '2026-01-08', signups: 28},
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

When the x values are all numbers, a LineChart component uses a continuous
linear x axis. ISO date strings use a time x axis. Other strings and boolean x
values are categories, and can be ordered with `sortCellId`:

```jsx
const Body = () => (
  <main>
    <section>
      <LineChart
        className="chart chart-numbers"
        tableId="measurements"
        xCellId="x"
        yCellId="score"
      />
    </section>
    <section>
      <LineChart
        className="chart chart-dates"
        tableId="daily"
        xCellId="day"
        yCellId="signups"
      />
    </section>
    <section>
      <BarChart
        className="chart chart-categories"
        tableId="channels"
        xCellId="channel"
        yCellId="visits"
        sortCellId="rank"
      />
    </section>
    <section>
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
  font-family: Inter, sans-serif;
  margin: 0;
}

main {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 2rem auto;
  max-width: 88rem;
  padding: 0 2rem;

  section {
    min-width: 0;
  }
}

.chart {
  display: block;
  font-size: 12px;
  height: 14rem;
  width: 100%;

  .grid {
    color: #d8e1eb;
    stroke-dasharray: 4 6;
  }

  .axes {
    color: #677489;

    .title {
      fill: #1f2937;
      font-weight: 700;
    }
  }

  .area {
    fill: #2b8c67;
    fill-opacity: 0.12;
  }

  .line {
    fill: none;
    stroke: #2b8c67;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
  }

  .points {
    fill: white;
    stroke: #2b8c67;
    stroke-width: 2;
  }

  .bar {
    fill: #5367c9;
  }

  &-booleans {
    .bar {
      fill: #d16b3f;
    }
  }
}

@media (max-width: 52rem) {
  main {
    grid-template-columns: 1fr;
  }
}
```

Numbers become a continuous x scale for line charts. Strings and booleans become
ordered categories, with boolean labels rendered as `true` and `false`. ISO
date strings become a time scale with UTC tick labels.
