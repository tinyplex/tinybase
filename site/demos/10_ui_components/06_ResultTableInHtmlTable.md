# <ResultTableInHtmlTable />

In this demo, we showcase the ResultTableInHtmlTable component, a way to display
the results of a query.

Rather than building the whole demo and boilerplate from scratch, we're going
back and making changes to the <TableInHtmlTable /> demo to demonstrate this new
component. Basically, where we previously displayed a Table from a Store, we are
now displaying the results of a query from a Queries object.

[base]: # '<TableInHtmlTable />'

## Set Up

We switch out the TableInHtmlTable component and import the
ResultTableInHtmlTable component instead. We'll also need the createQueries
function and useCreateQueries hook:

```diff-js
-const {createStore} = TinyBase;
+const {createQueries, createStore} = TinyBase;
-const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
+const {Provider, useCell, useCreateQueries, useCreateStore} = TinyBaseUiReact;
-const {TableInHtmlTable} = TinyBaseUiReactDom;
+const {ResultTableInHtmlTable} = TinyBaseUiReactDom;
```

We need to define the query we are going to use. In the main `App` component, we
can create the memoized Queries object, query for genres starting with the
letter 'A' (and the length of the word)...

```diff-js
 const store = useCreateStore(createStore);
+const queries = useCreateQueries(store, (store) =>
+  createQueries(store).setQueryDefinition(
+    'genresStartingWithA',
+    'genres',
+    ({select, where}) => {
+      select('name');
+      select((getCell) => getCell('name').length).as('length');
+      where((getCell) => getCell('name').startsWith('A'));
+    },
+  ),
+);
```

...and expose it into the app-wide context:

```diff-js
   return (
-    <Provider store={store}>{isLoading ? <Loading /> : <Body />}</Provider>
+    <Provider store={store} queries={queries}>
+      {isLoading ? <Loading /> : <Body />}
+    </Provider>
   );
```

## Using the ResultTableInHtmlTable Component

The ResultTableInHtmlTable component is very similar to the TableInHtmlTable
component, but instead of taking a tableId, we provide it with the queryId:

```diff-jsx
 const Body = () => {
   return (
-    <>
-      <TableInHtmlTable tableId='genres' />
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
-    </>
+    <ResultTableInHtmlTable queryId='genresStartingWithA' />
   );
 };
```

Hopefully that is eminently straightforward! You won't be surprised to learn
that you can also use sorting and interactivity on query results, and for that,
let's look at the next <ResultSortedTableInHtmlTable /> demo.
