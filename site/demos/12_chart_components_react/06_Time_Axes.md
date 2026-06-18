# Time Axes

![Time Axes](/shots/time-axes-react-demo.png)

This demo shows two ways to use time values on an x axis: ISO date strings that
can be detected automatically, and Unix second timestamps that need an explicit
XAxis component.

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
import {LineChart, XAxis} from 'tinybase/ui-react-dom-charts';
```

## The App

The first Table stores ISO date strings. The second stores Unix second
timestamps:

```jsx
const timestamp = (day) => Date.UTC(2026, 0, day) / 1000;

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

const App = () => {
  const store = useCreateStore(() =>
    createStore()
      .setTable('visits', {
        d1: {day: '2026-01-01', visits: 42},
        d2: {day: '2026-01-02', visits: 57},
        d3: {day: '2026-01-05', visits: 64},
        d4: {day: '2026-01-08', visits: 81},
      })
      .setTable('orders', {
        d1: {time: timestamp(1), orders: 12},
        d2: {time: timestamp(2), orders: 18},
        d3: {time: timestamp(5), orders: 21},
        d4: {time: timestamp(8), orders: 25},
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

## The Charts

When all x values are ISO date strings, LineChart infers a time scale. Numeric
timestamps are ordinary numbers unless an XAxis component declares them as time
values:

```jsx
const Body = () => (
  <main>
    <section>
      <LineChart
        className="chart chart-iso"
        tableId="visits"
        xCellId="day"
        yCellId="visits"
      />
    </section>
    <section>
      <LineChart
        className="chart chart-unix"
        tableId="orders"
        xCellId="time"
        yCellId="orders"
      >
        <XAxis
          className="axis-unix"
          scale="time"
          tickFormatter={formatDate}
          ticks={[timestamp(1), timestamp(3), timestamp(5), timestamp(7)]}
          timestampUnit="second"
          title="Order date"
        />
      </LineChart>
    </section>
  </main>
);
```

## Styling

The two charts share most styling, with separate colors to show that the same
time-axis behavior works with ordinary CSS customization:

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
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 2rem auto;
  max-width: 64rem;
  padding: 0 2rem;

  section {
    min-width: 0;
  }
}

.chart {
  background: #f7f9fb;
  border: 1px solid #dce5ee;
  border-radius: 0.5rem;
  color: #596779;
  display: block;
  font-size: 12px;
  height: 18rem;
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

  .line {
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-opacity: 0.9;
    stroke-width: 3;
  }

  .points {
    fill: white;
    stroke-width: 2;
  }
}

.chart-iso {
  .area {
    fill: #3b82a0;
    fill-opacity: 0.12;
  }

  .line,
  .points {
    stroke: #1f7799;
  }
}

.chart-unix {
  .area {
    fill: #2b8c67;
    fill-opacity: 0.12;
  }

  .line,
  .points {
    stroke: #2b8c67;
  }

  .axis-unix {
    fill: #2f6c4c;
  }
}

@media (max-width: 52rem) {
  main {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}
```

ISO strings can be used directly. Numeric timestamps need `scale="time"` so the
chart knows they are dates rather than large linear numbers.
