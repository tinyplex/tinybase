# <RelationshipInHtmlTable />

In this demo, we showcase the RelationshipInHtmlTable component, a way to
display the remote Rows according to a Relationship.

Rather than building the whole demo and boilerplate from scratch, we're going
back and making changes to the <TableInHtmlTable /> demo again to demonstrate
this new component. Basically, where we previously displayed a Table from a
Store, we are now creating an Relationships object and displaying one a defined
Relationship from it.

[base]: # '<TableInHtmlTable />'

## Set Up

We switch out the TableInHtmlTable component and import the
RelationshipInHtmlTable component instead. We'll also need the
createRelationships function and useCreateRelationships hook:

```diff-js
-const {createStore} = TinyBase;
+const {createRelationships, createStore} = TinyBase;
-const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
+const {
+  Provider,
+  useCell,
+  useCreateRelationships,
+  useCreateStore,
+} = TinyBaseUiReact;
-const {TableInHtmlTable} = TinyBaseUiReactDom;
+const {RelationshipInHtmlTable} = TinyBaseUiReactDom;
```

We need to define the Relationship we are going to use. For the sake of this
demo we are going to hand-create a second table which the genres table links to
to get extra metadata. Note how metadata is missing for genre 13.

```diff-js
   useMemo(async () => {
     await loadTable(store, 'genres');
+    store.setTable('metadata', {
+      genre1: {text: 'Dramatic movies to make you think', popularity: 6},
+      genre2: {text: 'These ones make you laugh', popularity: 7},
+      genre3: {text: 'Fun for all the family', popularity: 8},
+      genre4: {text: 'For the romantics at heart', popularity: 5},
+      genre5: {text: 'From cartoons to CGI', popularity: 5},
+      genre6: {text: 'Escape to another world', popularity: 4},
+      genre7: {text: 'Tales of the American West', popularity: 3},
+      genre8: {text: 'Stay on the edge of your seat', popularity: 6},
+      genre9: {text: 'For your inner explorer', popularity: 7},
+      genre10: {text: 'Fast-paced action from start to finish', popularity: 8},
+      genre11: {text: 'Jump scares to give you nightmares', popularity: 6},
+      genre12: {text: 'Murders and mysteries', popularity: 5},
+      genre14: {text: 'Take a step back in time', popularity: 3},
+      genre15: {text: 'A glimpse of the future', popularity: 8},
+      genre16: {text: 'Who did it?', popularity: 5},
+   });
    setIsLoading(false);
  }, []);
```

In the main `App`
component, we can create the memoized Relationships object, and create the
relationship between the the genres Table and the 'remote' metadata Table. Note
that we concatenate the word 'genre' and the genre Id to get the remote Row Id
in the metadata table.

```diff-js
 const store = useCreateStore(createStore);
+const relationships = useCreateRelationships(store, (store) =>
+  createRelationships(store).setRelationshipDefinition(
+    'genresMetadata',
+    'genres',
+    'metadata',
+    (_, rowId) => 'genre' + rowId,
+  ),
+);
```

We expose the Relationships object into the app-wide context:

```diff-js
   return (
-    <Provider store={store}>{isLoading ? <Loading /> : <Body />}</Provider>
+    <Provider store={store} relationships={relationships}>
+      {isLoading ? <Loading /> : <Body />}
+    </Provider>
   );
```

## Using the RelationshipInHtmlTable Component

The RelationshipInHtmlTable component is very similar to the TableInHtmlTable
component, but instead of taking a tableId, we provide it with the
relationshipId:

```diff-jsx
 const Body = () => {
   return (
-    <>
-      <TableInHtmlTable tableId='genres' />
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
-    </>
+    <RelationshipInHtmlTable relationshipId='genresMetadata' />
   );
 };
```

Note how both the local ('genre') and remote ('metadata') Ids are shown in the
table, as well as the Row content from the remote Table. Also note how the Row
with Id of 13 has empty content since there is no remote Row for the
Relationship to join to.

As per usual, take a look at the RelationshipInHtmlTableProps type and
HtmlTableProps type to see all the ways in which you can configure this
component, and again, click the 'CodePen' link under the demo above to try them
out.

As well as displaying a Relationship from an Indexes object, you can also render
the ResultTable of a Queries object, as you'll see next up in the
<ResultTableInHtmlTable /> demo.
