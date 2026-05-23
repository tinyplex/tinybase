# <LineChart /> (React)

In this demo, we render a Store Table with the LineChart component from the
ui-react-dom-charts module.

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

We need a Store and the chart component:

```js
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'tinybase';
import {Provider, useCreateStore} from 'tinybase/ui-react';
import {LineChart} from 'tinybase/ui-react-dom-charts';
```

## The App

This top-level component creates a Store and puts it into a Provider context:

```jsx
const App = () => {
  const store = useCreateStore(() =>
    createStore().setTable('monthlySales', {
      jan: {month: 'Jan', sales: 12, costs: 8},
      feb: {month: 'Feb', sales: 18, costs: 11},
      mar: {month: 'Mar', sales: 15, costs: 9},
      apr: {month: 'Apr', sales: 24, costs: 15},
      may: {month: 'May', sales: 21, costs: 14},
      jun: {month: 'Jun', sales: 28, costs: 18},
    }),
  );

  return <Provider store={store}><Body /></Provider>;
};

addEventListener('load', () => createRoot(document.body).render(<App />));
```

## The Chart

The component gets its Store from Provider context. A table source uses
`tableId`:

```jsx
const Body = () => (
  <main>
    <LineChart
      className="chart"
      tableId="monthlySales"
      xCellId="month"
      yCellId="sales"
    />
  </main>
);
```

(Note that this chart is bound to a Store Table, but chart components can also be
bound to a Queries ResultTable using a `queryId` prop.)

## Styling

The chart components emit SVG elements with simple class names, so its visual
treatment is entirely created with CSS:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  background: #fff;
  font-family: Inter, sans-serif;
  margin: 0;
}

main {
  margin: 1.5rem auto;
  max-width: 52rem;
  padding: 0 2rem;
}

.chart {
  border: 1px solid #eee;
  box-shadow: 0 0 1rem #0004;
  height: 21rem;
  width: 100%;
}

.chart .line {
  fill: none;
  stroke: #2f6f73;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.chart .point {
  fill: #fff;
  stroke: #2f6f73;
  stroke-width: 1.5;
}

@media (max-width: 40rem) {
  main {
    padding: 0 1rem;
  }
}
```

Let's move on to the <BarChart /> (React) demo to see another chart component in action.
