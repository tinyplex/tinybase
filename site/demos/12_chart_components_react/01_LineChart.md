# <LineChart />

![Basic Chart](/shots/basic-chart-react-demo.png)

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
    createStore().setTable('sales', {
      jan: {month: 'Jan', order: 1, revenue: 12},
      feb: {month: 'Feb', order: 2, revenue: 18},
      mar: {month: 'Mar', order: 3, revenue: 15},
      apr: {month: 'Apr', order: 4, revenue: 24},
      may: {month: 'May', order: 5, revenue: 21},
      jun: {month: 'Jun', order: 6, revenue: 28},
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

The component gets its Store from Provider context. A table source uses
`tableId`, and the chart reads x and y values from the named Cells:

```jsx
const Body = () => (
  <main>
    <LineChart
      className="chart"
      tableId="sales"
      xCellId="month"
      yCellId="revenue"
      sortCellId="order"
    />
  </main>
);
```

(Chart components can also be bound to a Queries ResultTable using a `queryId`
prop instead of a `tableId` prop.)

## Styling

The chart components emit an SVG element. The only required CSS is enough
layout to give that SVG a visible size:

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
  display: block;
  font-size: 12px;
  height: 20rem;
  width: 100%;
}

@media (max-width: 40rem) {
  main {
    padding: 0 1rem;
  }
}
```

This produces a functional chart using the component's default SVG styles.

Let's move on to the Styled Chart (React) demo to see how the same chart can be
customized with CSS.
