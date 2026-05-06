# Building A UI With Queries

This guide covers how the ui-react module supports the Queries object.

As with the React-based bindings to a Store object, the ui-react module provides
both hooks and components to connect your queries to your interface.

## Queries Hooks

In previous guides, we've seen how the Queries methods follow the same
conventions as raw Table methods, such as how The getResultRow method is the
equivalent of the getRow method.

So it should be no surprise that the ui-react hooks follow the same convention,
and that the hooks correspond to each of the Query getter methods:

- The useResultTable hook is the reactive equivalent of the getResultTable
  method.
- The useResultRowIds hook is the reactive equivalent of the getResultRowIds
  method.
- The useResultSortedRowIds hook is the reactive equivalent of the
  getResultSortedRowIds method.
- The useResultRow hook is the reactive equivalent of the getResultRow method.
- The useResultCellIds hook is the reactive equivalent of the getResultCellIds
  method.
- The useResultCell hook is the reactive equivalent of the getResultCell method.

Each hook registers a listener so that any relevant changes will cause a
re-render. As an example:

```jsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createQueries, createStore} from 'tinybase';
import {useResultRowIds} from 'tinybase/ui-react';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});
const queries = createQueries(store).setQueryDefinition(
  'dogColors',
  'pets',
  ({select, where}) => {
    select('color');
    where('species', 'dog');
  },
);
const App = () => (
  <span>{JSON.stringify(useResultRowIds('dogColors', queries))}</span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>["fido","cujo"]</span>'

store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
console.log(app.innerHTML);
// -> '<span>["fido"]</span>'
```

The useCreateQueries hook is used to create a Queries object within a React
application with convenient memoization:

```jsx
import {useCreateQueries, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog', color: 'brown'},
      felix: {species: 'cat', color: 'black'},
      cujo: {species: 'dog', color: 'black'},
    }),
  );
  const queries = useCreateQueries(store, (store) =>
    createQueries(store).setQueryDefinition(
      'dogColors',
      'pets',
      ({select, where}) => {
        select('color');
        where('species', 'dog');
      },
    ),
  );
  return <span>{JSON.stringify(useResultRowIds('dogColors', queries))}</span>;
};

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span>["fido","cujo"]</span>'
```

## Queries Views

Entirely following convention, there are also components for rendering the
contents of queries: the ResultTableView component, the ResultSortedTableView
component, the ResultRowView component, and the ResultCellView component. Again,
simple prefix the component names with `Result`.

And of
course, each registers a listener so that any changes to that result will cause
a re-render.

Just like their Store equivalents, these components can be given a custom components to render
their children:

```jsx
import {ResultCellView, ResultTableView} from 'tinybase/ui-react';

const MyResultRowView = (props) => (
  <span>
    {props.rowId}: <ResultCellView {...props} cellId="color" />
  </span>
);

const App3 = () => (
  <div>
    <ResultTableView
      queryId="dogColors"
      resultRowComponent={MyResultRowView}
      queries={queries}
    />
  </div>
);

store.setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});

root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<div><span>fido: brown</span><span>cujo: black</span></div>'
```

## Queries Context

In the same way that other objects can be passed into a Provider component
context and used throughout the app, a Queries object can also be provided to be
used by default:

```jsx
import {Provider, ResultRowView, useRemoteRowId} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog', color: 'brown'},
      felix: {species: 'cat', color: 'black'},
      cujo: {species: 'dog', color: 'black'},
    }),
  );
  const queries = useCreateQueries(store, (store) =>
    createQueries(store).setQueryDefinition(
      'dogColors',
      'pets',
      ({select, where}) => {
        select('color');
        where('species', 'dog');
      },
    ),
  );

  return (
    <Provider queries={queries}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <ResultRowView queryId="dogColors" rowId="cujo" debugIds={true} />/
    {useRemoteRowId('dogColors', 'cujo')}
  </span>
);

root.render(<App4 />); // !act
console.log(app.innerHTML);
// -> '<span>cujo:{color:{black}}/</span>'
```

The `queriesById` prop can be used in the same way that the `storesById`
prop is, to let you reference multiple Queries objects by Id.

## Svelte And Solid

In Svelte, query results can be read with reactive functions and rendered with
the Result\* view components:

```svelte
<script>
  import {getResultRowIds, ResultCellView} from 'tinybase/ui-svelte';

  let {queries} = $props();
  const rowIds = getResultRowIds('dogColors', queries);
</script>

<span>{JSON.stringify(rowIds.current)}</span>
<ResultCellView queryId="dogColors" rowId="fido" cellId="color" {queries} />
```

In Solid, the equivalent primitive returns an Accessor, and query view
components can be used directly in JSX:

```tsx
import {createRoot as createSolidQueriesRoot} from 'solid-js';
import {render as renderSolidQueries} from 'solid-js/web';
import {createQueries as createSolidQueries} from 'tinybase';
import {createStore as createSolidQueriesStore} from 'tinybase';
import {
  ResultCellView as SolidResultCellView,
  useResultRowIds as useSolidResultRowIds,
} from 'tinybase/ui-solid';

const solidQueriesStore = createSolidQueriesStore().setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});
const solidQueries = createSolidQueries(solidQueriesStore).setQueryDefinition(
  'dogColors',
  'pets',
  ({select, where}) => {
    select('color');
    where('species', 'dog');
  },
);

createSolidQueriesRoot((dispose) => {
  const rowIds = useSolidResultRowIds('dogColors', solidQueries);
  console.log(JSON.stringify(rowIds()));
  // -> '["fido","cujo"]'

  solidQueriesStore.setCell('pets', 'cujo', 'species', 'wolf');
  console.log(JSON.stringify(rowIds()));
  // -> '["fido"]'
  dispose();
});

const solidQueriesApp = document.createElement('div');
const disposeSolidQueries = renderSolidQueries(
  () => (
    <SolidResultCellView
      queryId="dogColors"
      rowId="fido"
      cellId="color"
      queries={solidQueries}
    />
  ),
  solidQueriesApp,
);
console.log(solidQueriesApp.innerHTML);
// -> 'brown'
disposeSolidQueries();
```

## Summary

The support for Queries objects in the UI modules is very similar to that for
the Store object, making it easy to attach queries to your user interface.

We now move on to learning about the Inspector tool that TinyBase provides. Read
more about that in the Inspector Data guide.
