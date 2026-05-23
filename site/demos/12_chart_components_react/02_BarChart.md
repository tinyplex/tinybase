# <BarChart /> (React)

In this demo, we render a Store Table with the BarChart component.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <LineChart /> (React) demo to support this new component.

[base]: # '<LineChart /> (React)'

## Set Up

We switch the chart component import:

```diff-js
-import {LineChart} from 'tinybase/ui-react-dom-charts';
+import {BarChart} from 'tinybase/ui-react-dom-charts';
```

## The Chart

This time, the component still gets its Store from Provider context, but renders
bars instead of a line:

```diff-jsx
 const Body = () => (
   <main>
-      <LineChart
+      <BarChart
         className="chart"
```

Like LineChart, BarChart can also be bound to a Queries ResultTable with a
`queryId` prop instead of a `tableId` prop.

And finally, we need to add some styling for the bars:

```diff-less
 .chart .point {
   fill: #fff;
   stroke: #2f6f73;
   stroke-width: 1.5;
 }
+
+.chart .bar {
+  fill: #ba5a31;
+}
```
