# Grouping Dice Rolls

In this demo, we use an IndexView component to group each Row of the Store
object based on the value in a Cell within it. We roll a dice 48 times and index
the rolls by result. We're making changes to the Averaging Dice Rolls demo.

[base]: # 'Averaging Dice Rolls'

We import the extra functions and components we need:

```diff-js
-const {MetricView, Provider, TableView, useCell} = TinyBaseUiReactDebug;
+const {IndexView, Provider, SliceView, useCell} = TinyBaseUiReactDebug;
-const {createMetrics, createStore} = TinyBase;
+const {createIndexes, createStore} = TinyBase;
```

To create the Indexes object, we use createIndexes, and configure an index
called `rolls` for the Table called `rolls`, based on the `result` Cell of each
roll Row. It sorts the dice rolls according to the color of the dice (ie `blue`,
then `green`, then `red` for each given result). We don't need metrics in this
demo:

```diff-js
-const metrics = createMetrics(store)
-  .setMetricDefinition('average', 'rolls', 'avg', 'result')
-  .setMetricDefinition('count', 'rolls', 'sum');
+const indexes = createIndexes(store).setIndexDefinition(
+  'rolls',
+  'rolls',
+  'result',
+  'color',
+);
```

As in the previous demo, each roll is going to be rendered as a dice Unicode
character, but we'll add color as a CSS class:

```diff-jsx
 const Roll = ({tableId, rowId}) => (
-  <span className="roll">
+  <span className={`roll ${useCell(tableId, rowId, 'color')}`}>
     {String.fromCharCode(9855 + useCell(tableId, rowId, 'result'))}
   </span>
 );
```

```diff-less
 .roll {
   display: inline-block;
   font-size: 3rem;
   padding: 0 1rem;
   line-height: 3rem;
+  &.red {
+    color: #900;
+  }
+  &.green {
+    color: #090;
+  }
+  &.blue {
+    color: #009;
+  }
 }
```

We create a component for each slice. Its main purpose is to put each SliceView
component on a new line and ensure the `Roll` component is used for each roll
Row:

```jsx
const Rolls = (props) => (
  <div className="rolls">
    <SliceView {...props} rowComponent={Roll} />
  </div>
);
```

```less
.rolls {
  white-space: nowrap;
}
```

We then change our React app to comprise an IndexView component which will render
the `Rolls` component for each slice in the index (in turn rendering the `Roll`
component for each roll Row):

```diff-jsx
-ReactDOM.createRoot(document.body).render(
-  <Provider store={store} metrics={metrics}>
-    <p>
-      Count: <MetricView metricId="count" />
-      <br />
-      Average: <MetricView metricId="average" />
-    </p>
-    <TableView tableId="rolls" rowComponent={Roll} />
-    <StoreInspector />
-  </Provider>,
-);
```

```jsx
ReactDOM.createRoot(document.body).render(
  <Provider store={store} indexes={indexes}>
    <IndexView indexId="rolls" sliceComponent={Rolls} />
    <StoreInspector />
  </Provider>,
);
```

To roll the dice, we again add a new Row every half second with the result, but
also add a random color:

```diff-js
 store.addRow('rolls', {
   result: Math.ceil(Math.random() * 6),
+  color: ['red', 'green', 'blue'][Math.floor(Math.random() * 3)],
 });
```

Next, we will build a minimum viable 'Todo' app. Please continue to the Todo App
v1 (the basics) demo.
