# <Inspector />

In this demo, we showcase the Inspector component, which allows you to view and
edit the content of a Store in a debug web environment.

Let's make changes to the <TableInHtmlTable /> demo so we can start with a
well-populated Store to inspect.

[base]: # '<TableInHtmlTable />'

## Set Up

Let's import the Inspector component:

```diff-html
 <script type="importmap">
   {
     "imports": {
       "tinybase": "https://esm.sh/tinybase@",
       "tinybase/ui-react": "https://esm.sh/tinybase/ui-react@",
-       "tinybase/ui-react-dom": "https://esm.sh/tinybase/ui-react-dom@",
+       "tinybase/ui-react-inspector": "https://esm.sh/tinybase/ui-react-inspector@",
       "react": "https://esm.sh/react@",
       "react/jsx-runtime": "https://esm.sh/react/jsx-runtime@",
       "react-dom/client": "https://esm.sh/react-dom/client@"
     }
   }
 </script>
```

We're going to use the useTableIds hook briefly, and the Inspector from the
ui-react-inspector module:

```diff-js
-import {Provider, useCell, useCreateStore} from 'tinybase/ui-react';
+import {Provider, useCreateStore, useTableIds} from 'tinybase/ui-react';
-import {TableInHtmlTable} from 'tinybase/ui-react-dom';
+import {Inspector} from 'tinybase/ui-react-inspector';
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
