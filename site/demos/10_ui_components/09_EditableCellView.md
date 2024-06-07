# <EditableCellView />

In this demo, we showcase the EditableCellView component, which allows you to
edit Cell values in the Store in a web environment.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <TableInHtmlTable /> demo to show this new component.

[base]: # '<TableInHtmlTable />'

## Set Up

We start off by simply adding the component to the imports:

```diff-js
-const {TableInHtmlTable} = TinyBaseUiReactDom;
+const {EditableCellView, TableInHtmlTable} = TinyBaseUiReactDom;
```

## Using the EditableCellView Component

The EditableCellView component simply needs a tableId, rowId, and cellId to
render the Cell and make it editable. We replace two of the tables from the
original demo to add the control:

```diff-jsx
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
+     <div id='edit'>
+       Genre 5 name:
+       <EditableCellView tableId='genres' rowId='5' cellId='name' />
+     </div>
     </>
   );
 };
```

We can style its container and the button that lets you change type:

```less
#edit {
  align-self: flex-start;
  background: white;
  box-shadow: 0 0 1rem #0004;
  margin: 2rem;
  min-width: 16rem;
  padding: 0.5rem 1rem 1rem;
}
.editableCell {
  button {
    width: 4rem;
    margin-right: 0.5rem;
  }
}
```

And finally, we can enable the `editable` prop on the original TableInHtmlTable
component so that it uses this view for its own rendering:

```diff-jsx
-     <TableInHtmlTable tableId='genres' />
+     <TableInHtmlTable tableId='genres' editable={true}/>
```

And again, we now have editable data across the Table!

We finish off the demos of the UI components with the debugging tool. Let's
proceed to the <Inspector /> demo.
