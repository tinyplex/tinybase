# An Intro To Metrics

This guide describes how the metrics module gives you the ability to create and
track metrics based on the data in Store objects.

The main entry point to using the metrics module is the createMetrics function,
which returns a new Metrics object. That object in turn has methods that let you
create new Metric definitions, access the values of those metrics directly, and
register listeners for when they change.

## The Basics

Here's a simple example to show a Metrics object in action. The `species` Table
has three Row objects, each with a numeric `price` Cell. We create a Metric
definition called `highestPrice` which is the maximum value of that Cell across
the whole Table:

```js
import {createMetrics, createStore} from 'tinybase';

const store = createStore().setTable('species', {
  dog: {price: 5},
  cat: {price: 4},
  worm: {price: 1},
});

const metrics = createMetrics(store);
metrics.setMetricDefinition(
  'highestPrice', // metricId
  'species', //      tableId to aggregate
  'max', //          aggregation
  'price', //        cellId to aggregate
);

console.log(metrics.getMetric('highestPrice'));
// -> 5
```

The out-of-the-box aggregations you can use in the third parameter are `sum`,
`avg`, `min`, and `max`, each of which should be self-explanatory.

## Metric Reactivity

Things get interesting when the underlying data changes. The Metrics object
takes care of tracking changes that will affect the Metric. A similar paradigm
to that used on the Store is used to let you add a listener to the Metrics
object. The listener fires when there's a new highest price:

```js
const listenerId = metrics.addMetricListener('highestPrice', () => {
  console.log(metrics.getMetric('highestPrice'));
});
store.setCell('species', 'horse', 'price', 20);
// -> 20
```

You can set multiple Metric definitions on each Metrics object. However, a given
Store can only have one Metrics object associated with it. If you call this
function twice on the same Store, your second call will return a reference to
the Metrics object created by the first.

Let's find out how to include metrics in a user interface in the Building A UI
With Metrics guide.
