# <Inspector />

In this demo, we showcase the Inspector component, which allows you to view and
edit the content of a Store in a debug web environment.

Let's make changes to the <TableInHtmlTable /> demo so we can start with a
well-populated Store to inspect.

[base]: # '<TableInHtmlTable />'

## Set Up

Let's import the Inspector component:

```diff-html
 <script src="/umd/react.production.min.js"></script>
 <script src="/umd/react-dom.production.min.js"></script>
 <script src="/umd/tinybase/index.js"></script>
 <script src="/umd/tinybase/ui-react/index.js"></script>
-<script src="/umd/tinybase/ui-react-dom/index.js"></script>
+<script src="/umd/tinybase/ui-react-inspector/index.js"></script>
```

We're going to use the useTableIds hook briefly, and the Inspector from the
ui-react-inspector module:

```diff-js
-const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
+const {Provider, useCreateStore, useTableIds} = TinyBaseUiReact;
-const {TableInHtmlTable} = TinyBaseUiReactDom;
+const {Inspector} = TinyBaseUiReactInspector;
```

The inspector component is best showcased with a larger data set, so we load up
all four tables of the movie database data:

```diff-jsx
   useMemo(async () => {
-    await loadTable(store, 'genres');
+    store.startTransaction();
+    await Promise.all(
+      ['movies', 'genres', 'people', 'cast'].map((tableId) =>
+        loadTable(store, tableId),
+      ),
+    );
+    store.finishTransaction();
     setIsLoading(false);
   }, []);
```

Let's update the body of the app to show some very basic data about the Store:

```diff-jsx
 const Body = () => {
   return (
     <>
-      <TableInHtmlTable tableId='genres' />
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
+      <div id='info'>
+        Loaded tables: {useTableIds().join(', ')}
+      </div>
     </>
   );
 };
```

```less
#info {
  align-self: center;
}
```

OK, that's not much of an app! But at least we can now instantiate the Inspector
component.

## Using the Inspector Component

The Inspector component can appear anywhere in the app's virtual DOM and will
appear as an overlay. It is added to an app like so:

```diff-jsx
       <div id='info'>
        Loaded tables: {useTableIds().join(', ')}
       </div>
+      <Inspector open={true} />
     </>
   );
 };
```
