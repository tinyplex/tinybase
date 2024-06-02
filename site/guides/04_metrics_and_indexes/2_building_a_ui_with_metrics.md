# Building A UI With Metrics

This guide covers how the ui-react module supports the Metrics object.

As with the React-based bindings to a Store object, the ui-react module provides
both hooks and components to connect your metrics to your interface.

## Metrics Hooks

The useMetric hook is very simple. It gets the current value of a Metric, and
registers a listener so that any changes to that result will cause a re-render:

```jsx
import {createMetrics, createStore} from 'tinybase';
import {useMetric} from 'tinybase/ui-react';
import React from 'react';
import {createRoot} from 'react-dom/client';

const store = createStore().setTable('species', {
  dog: {price: 5},
  cat: {price: 4},
  worm: {price: 1},
});
const metrics = createMetrics(store);
metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
const App = () => <span>{useMetric('highestPrice', metrics)}</span>;

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>5</span>'

store.setCell('species', 'horse', 'price', 20); // !act
console.log(app.innerHTML);
// -> '<span>20</span>'
```

The useCreateMetrics hook is used to create a Metrics object within a React
application with convenient memoization:

```jsx
import {useCreateMetrics, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('species', {
      dog: {price: 5},
      cat: {price: 4},
      worm: {price: 1},
    }),
  );
  const metrics = useCreateMetrics(store, (store) =>
    createMetrics(store).setMetricDefinition(
      'highestPrice',
      'species',
      'max',
      'price',
    ),
  );
  return <span>{metrics?.getMetric('highestPrice')}</span>;
};

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span>5</span>'
```

## Metrics View

The MetricView component renders the current value of a Metric, and registers a
listener so that any changes to that result will cause a re-render.

```jsx
import {MetricView} from 'tinybase/ui-react';

const App3 = () => (
  <div>
    <MetricView metricId="highestPrice" metrics={metrics} />
  </div>
);

root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<div>20</div>'
```

## Metrics Context

In the same way that a Store can be passed into a Provider component context and
used throughout the app, a Metrics object can also be provided to be used by
default:

```jsx
import {Provider} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('species', {
      dog: {price: 5},
      cat: {price: 4},
      worm: {price: 1},
    }),
  );
  const metrics = useCreateMetrics(store, (store) =>
    createMetrics(store).setMetricDefinition(
      'highestPrice',
      'species',
      'max',
      'price',
    ),
  );

  return (
    <Provider metrics={metrics}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <MetricView metricId="highestPrice" />,{useMetric('highestPrice')}
  </span>
);

root.render(<App4 />); // !act
console.log(app.innerHTML);
// -> '<span>5,5</span>'
```

The `metricsById` prop can be used in the same way that the `storesById` prop
is, to let you reference multiple Metrics objects by Id.

## Summary

The support for Metrics objects in the ui-react module is very similar to that
for the Store object, making it easy to attach Metric results to your user
interface.

We finish off this section about the metrics module with the Advanced Metric
Definition guide.
