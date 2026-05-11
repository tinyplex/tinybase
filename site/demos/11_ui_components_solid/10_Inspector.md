# <Inspector /> (Solid)

![Inspector](/shots/inspector-solid-demo.png)

In this demo, we showcase the Inspector component, which allows you to view and
edit the content of a Store in a debug web environment.

Let's make changes to the <TableInHtmlTable /> (Solid) demo so we can start
with a well-populated Store to inspect.

[base]: # '<TableInHtmlTable /> (Solid)'

## Set Up

Let's import the Inspector component:

```diff-html
 <script type="importmap">
   {
     "imports": {
       "tinybase": "https://esm.sh/tinybase@",
       "tinybase/ui-solid": "https://esm.sh/tinybase/ui-solid@",
-       "tinybase/ui-solid-dom": "https://esm.sh/tinybase/ui-solid-dom@",
+       "tinybase/ui-solid-inspector": "https://esm.sh/tinybase/ui-solid-inspector@",
       "solid-js": "https://esm.sh/solid-js@",
              "solid-js/web": "https://esm.sh/solid-js/web@"
     }
   }
 </script>
```

We're going to use the useTableIds hook briefly, and the Inspector from the
ui-solid-inspector module:

```diff-js
-import {Provider, useCell, useCreateStore} from 'tinybase/ui-solid';
+import {Provider, useCreateStore, useTableIds} from 'tinybase/ui-solid';
-import {TableInHtmlTable} from 'tinybase/ui-solid-dom';
+import {Inspector} from 'tinybase/ui-solid-inspector';
```

The inspector component is best showcased with a larger data set, so we load up
all four tables of the movie database data:

```diff-jsx
   onMount(async () => {
-    await loadTable(store(), 'genres');
+    store().startTransaction();
+    await Promise.all(
+      ['movies', 'genres', 'people', 'cast'].map((tableId) =>
+        loadTable(store(), tableId),
+      ),
+    );
+    store().finishTransaction();
     setIsLoading(false);
   });
```

Let's update the body of the app to show some very basic data about the Store:

```diff-jsx
 const Body = () => {
+  const tableIds = useTableIds();
   return (
     <>
-      <TableInHtmlTable tableId='genres' />
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
+      <div id='info'>
+        Loaded tables: {tableIds().join(', ')}
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
        Loaded tables: {tableIds().join(', ')}
       </div>
+      <Inspector open={true} />
     </>
   );
 };
```
