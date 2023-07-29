# <ResultSortedTableInHtmlTable />

In this demo, we showcase the ResultSortedTableInHtmlTable component, a more
complex and interactive way to render the results of a query.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <SortedTableInHtmlTable /> demo to support this new component.
Basically, where we previously displayed a Table from a Store, we are now
displaying the result of a query from a Queries object.

[base]: # '<SortedTableInHtmlTable />'

## Set Up

We switch out the TableInHtmlTable component and import the
SortedTableInHtmlTable component instead.

```diff-js
-const {createStore} = TinyBase;
+const {createQueries, createStore} = TinyBase;
-const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
+const {Provider, useCell, useCreateQueries, useCreateStore} = TinyBaseUiReact;
-const {SortedTableInHtmlTable} = TinyBaseUiReactDom;
+const {ResultSortedTableInHtmlTable} = TinyBaseUiReactDom;
```

We need to register the query we are going to use. In the main `App` component,
we can create the memoized Queries object, query a few columns for movies made
since 2018...

```diff-js
 const store = useCreateStore(createStore);
+const queries = useCreateQueries(store, (store) =>
+  createQueries(store).setQueryDefinition(
+    'recentMovies',
+    'movies',
+    ({select, where}) => {
+      select('name').as('Name');
+      select('year').as('Year');
+      select('rating').as('Rating');
+      where((getCell) => getCell('year') >= 2018);
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

## Using the ResultSortedTableInHtmlTable Component

The ResultSortedTableInHtmlTable component is very similar to the
SortedTableInHtmlTable component, but instead of taking a tableId, we provide it
with the queryId:

```diff-jsx
 const Body = () => {
   return (
     <>
-      <SortedTableInHtmlTable
-        tableId='movies'
-        customCells={customCells}
-        cellId='rating'
+      <ResultSortedTableInHtmlTable
+        queryId='recentMovies'
+        cellId='Rating'
         descending={true}
         limit={7}
         sortOnClick={true}
         paginator={true}
       />
     </>
   );
 };
```

Note that we explicitly picked and labelled which columns were in the query, so
we don't need the `customCells` prop any more.

```diff-js
-const customCells = {name: 'Name', year: 'Year', rating: 'Rating'};
```

We are using the same `sortOnClick` props from the <SortedTableInHtmlTable />
demo so you should find it to be interactive just as before.

Let's next look at components that let you edit Store data, starting with the
<EditableValueView /> demo.
