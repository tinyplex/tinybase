# Advanced Metric Definition

This guide describes how the metrics module let you create more complex types of
metrics based on the data in Store objects.

## Advanced Aggregations

The four standard aggregation types you can use when defining a Metric are
`sum`, `avg`, `min`, and `max`, but often you will want to create more
interesting aggregations of the data in your Table.

Instead of a string as the third parameter of the setMetricDefinition method,
you can provide an Aggregate parameter. This is simply a function that takes an
array of numbers and returns the aggregation. So for example, you could create a
Metric which is the hypotenuse of the numeric `distance` Cell values in every
Row:

```js
import {createMetrics, createStore} from 'tinybase';

const store = createStore().setTable('dimensions', {
  x: {distance: 1},
  y: {distance: 2},
  z: {distance: 2},
});

const metrics = createMetrics(store);
metrics.setMetricDefinition(
  'hypotenuse', //                            metricId
  'dimensions', //                            tableId to aggregate
  (distances) => Math.hypot(...distances), // custom aggregation
  'distance', //                              cellId to aggregate
);

console.log(metrics.getMetric('hypotenuse'));
// -> 3
```

Such a Metric will have a performance complexity linear with the size of the
Table, any time any value changes. But some aggregations have shortcuts: if a
contributing value is updated, you can sometimes calculate the new value for the
metric without scanning every value again. For example, if your aggregation is a
sum, and an additional Row is added, its value can simply be added to the
previous total.

There are three types of shortcuts you can add if the aggregation can benefit
from them, and they can be provided as the final three parameters of the
setMetricDefinition method. These describe how to change the overall Metric when
a number is added, removed, or replaced.

Our hypotenuse example can benefit. If a new value is added to the list of
numbers to be aggregated, square the current result, add the square of the new
number, and square root the total. This is then constant cost, regardless of the
number of Row objects being aggregated:

```js
const sqr = (num) => num * num;
const sqrt = Math.sqrt;
metrics.setMetricDefinition(
  'fasterHypotenuse', //                      metricId
  'dimensions', //                            tableId to aggregate
  (distances) => Math.hypot(...distances), // custom aggregation
  'distance', //                              cellId to aggregate
  (metric, add) => sqr(sqr(metric) + sqr(add)), //                 add
  (metric, rem) => sqr(sqr(metric) - sqr(rem)), //                 remove
  (metric, add, rem) => sqr(sqr(metric) + sqr(add) - sqr(rem)), // replace
);

store.setCell('dimensions', 'x', 'distance', 3);
store.setCell('dimensions', 'z', 'distance', 6);
console.log(metrics.getMetric('hypotenuse'));
// -> 7
```

## Getting Custom Values From Rows

By default, our Metric definitions have named a Cell in the Row which contains a
numeric value - like the `distance` Cell in the example above. Sometimes you may
wish to derive a number for each Row that is not in a single Cell, and in this
case you can replace the fourth parameter with a function which can process the
Row in any way you wish.

In this example, we average the density of a set of cuboids, which means that
each Row's contributory number needs to be the mass divided by the volume:

```js
store.setTable('cuboids', {
  0: {mass: 10, volume: 5},
  1: {mass: 12, volume: 3},
  2: {mass: 24, volume: 4},
});

metrics.setMetricDefinition(
  'averageDensity', //                                 metricId
  'cuboids', //                                        tableId to aggregate
  'avg', //                                            aggregation
  (getCell) => getCell('mass') / getCell('volume'), // => number to aggregate
);

console.log(metrics.getMetric('averageDensity'));
// -> 4
```

Of course it is possible to combine both advanced aggregations and getting
custom values from each Row:

```js
metrics.setMetricDefinition(
  'countOfDenseCuboids',
  'cuboids',
  (densities) => densities.filter((density) => density > 5).length,
  (getCell) => getCell('mass') / getCell('volume'),
);

console.log(metrics.getMetric('countOfDenseCuboids'));
// -> 1
```

And with that, we have covered most of the basics of using the metrics module.
Let's move on to a very similar module for indexing data, as covered in the
Indexes guide.
