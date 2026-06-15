# Axis Overrides

![Axis Overrides](/shots/axis-overrides-react-demo.png)

This demo shows how XAxis and YAxis component children can override the
inferred axis titles, bounds, ticks, tick formatting, and SVG classes in a
CartesianChart component.

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
  CartesianChart,
  LineSeries,
  XAxis,
  YAxis,
} from 'tinybase/ui-react-dom-charts';
```

## The App

The Store keeps dates as numeric timestamps so the x axis can remain continuous.
The XAxis component formats those numbers as readable dates:

```jsx
const date = (day) => Date.UTC(2026, 0, day);

const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

const App = () => {
  const store = useCreateStore(() =>
    createStore().setTable('sales', {
      d1: {date: date(1), revenue: 18},
      d2: {date: date(2), revenue: 26},
      d3: {date: date(3), revenue: 22},
      d4: {date: date(4), revenue: 39},
      d5: {date: date(5), revenue: 44},
      d6: {date: date(6), revenue: 41},
      d7: {date: date(7), revenue: 53},
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

## The Chart

The axis components are configuration children. They do not render separate
charts; instead they tell the parent CartesianChart component how to render its
shared axes:

```jsx
const Body = () => (
  <main>
    <CartesianChart className="chart chart-axes" tableId="sales">
      <XAxis
        className="axis-dates"
        max={date(7)}
        min={date(1)}
        tickFormatter={formatDate}
        ticks={[date(1), date(3), date(5), date(7)]}
        title="Sale date"
      />
      <YAxis
        className="axis-revenue"
        max={60}
        min={0}
        tickFormatter={(tick) => `$${tick}k`}
        ticks={[0, 20, 40, 60]}
        title="Revenue"
      />
      <LineSeries xCellId="date" yCellId="revenue" />
    </CartesianChart>
  </main>
);
```

## Styling

Because the axis components add their className values to the x-axis and y-axis
SVG groups, CSS can style them independently:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  background: white;
  font-family: Inter, sans-serif;
  margin: 0;
}

main {
  margin: 2rem auto;
  max-width: 52rem;
  padding: 0 2rem;
}

.chart {
  background: #f7f9fb;
  border: 1px solid #dce5ee;
  border-radius: 0.5rem;
  color: #596779;
  display: block;
  font-size: 12px;
  height: 20rem;
  padding: 1rem;
  width: 100%;

  .grid {
    color: #d7e0ea;
    stroke-dasharray: 4 6;
  }

  .axes {
    .title {
      fill: #1f2937;
      font-weight: 700;
    }
  }

  .axis-dates {
    fill: #275f83;
  }

  .axis-revenue {
    fill: #6f4a1c;
  }

  .area {
    fill: #3b82a0;
    fill-opacity: 0.12;
  }

  .line {
    stroke: #1f7799;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
  }

  .points {
    fill: white;
    stroke: #1f7799;
    stroke-width: 2;
  }
}

@media (max-width: 40rem) {
  main {
    padding: 0 1rem;
  }
}
```

Axis components make formatting and bounds explicit, while the series stays
focused on data binding.
