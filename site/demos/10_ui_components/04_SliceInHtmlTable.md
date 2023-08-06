# <SliceInHtmlTable />

In this demo, we showcase the SliceInHtmlTable component, a way to display
the Slice portions of an Index.

Rather than building the whole demo and boilerplate from scratch, we're going
back and making changes to the <TableInHtmlTable /> demo to demonstrate this new
component. Basically, where we previously displayed a Table from a Store, we are
now creating an Index and displaying one of its Slice objects.

[base]: # '<TableInHtmlTable />'

## Set Up

We switch out the TableInHtmlTable component and import the SliceInHtmlTable
component instead. We'll also need the createIndexes function and
useCreateIndexes hook:

```diff-js
-const {createStore} = TinyBase;
+const {createIndexes, createStore} = TinyBase;
-const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
+const {Provider, useCell, useCreateIndexes, useCreateStore} = TinyBaseUiReact;
-const {TableInHtmlTable} = TinyBaseUiReactDom;
+const {SliceInHtmlTable} = TinyBaseUiReactDom;
```

We need to define the Index we are going to use. In the main `App` component, we
can create the memoized Indexes object, and index the genres by the length of
their name.

```diff-js
 const store = useCreateStore(createStore);
+const indexes = useCreateIndexes(store, (store) =>
+  createIndexes(store).setIndexDefinition(
+    'genresByNameLength',
+    'genres',
+    (getCell) => 'length ' + getCell('name').length,
+  ),
+);
```

...and expose it into the app-wide context:

```diff-js
   return (
-    <Provider store={store}>{isLoading ? <Loading /> : <Body />}</Provider>
+    <Provider store={store} indexes={indexes}>
+      {isLoading ? <Loading /> : <Body />}
+    </Provider>
   );
```

## Using the SliceInHtmlTable Component

The SliceInHtmlTable component is very similar to the TableInHtmlTable
component, but instead of taking a tableId, we provide it with the indexId and
the sliceId we want to display (here, the names that are 6 letters long):

```diff-jsx
 const Body = () => {
   return (
-    <>
-      <TableInHtmlTable tableId='genres' />
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
-    </>
+    <SliceInHtmlTable indexId='genresByNameLength' sliceId='length 6' />
   );
 };
```

For fun we could add the 'editable' prop to this table, but of course as soon as
you add to or delete from the name of the genre, it will get reindexed into a
different Slice and disappear! So maybe not.

As well as displaying a Slice from an Indexes object, you can also render the
ResultTable of a Queries object, as you'll see next up in the
<ResultTableInHtmlTable /> demo.
