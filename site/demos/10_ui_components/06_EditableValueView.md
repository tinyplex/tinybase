# <EditableValueView />

In this demo, we showcase the EditableValueView component, which allows you to
edit Values in the Store in a web environment.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <ValuesInHtmlTable /> demo to show this new component.

[base]: # '<ValuesInHtmlTable />'

## Set Up

We start off by simply adding the component to the imports:

```diff-js
-const {ValuesInHtmlTable} = TinyBaseUiReactDom;
+const {EditableValueView, ValuesInHtmlTable} = TinyBaseUiReactDom;
```

## Using the EditableValueView Component

The EditableValueView component simply needs the valueId to render and make
editable. We replace one of the tables from the original demo to add the
control:

```diff-jsx
 const Body = () => {
   return (
     <>
      <ValuesInHtmlTable />

-     <ValuesInHtmlTable headerRow={false} idColumn={false} />
+     <div id='edit'>
+       Username:
+       <EditableValueView valueId='username' />
+     </div>
     </>
   );
 };
```

We can style its container and the button that lets you change type:

```less
#edit {
  background: white;
  box-shadow: 0 0 1rem #0004;
  margin: 2rem;
  min-width: 16rem;
  outline: 1px solid #aaa;
  padding: 0.5rem 1rem 1rem;
}
.editableValue {
  button {
    width: 4rem;
    margin-right: 0.5rem;
  }
}
```

And finally, we can enable the `editable` prop on the original ValuesInHtmlTable
component so that it uses this view for its own rendering:

```diff-jsx
-     <ValuesInHtmlTable />
+     <ValuesInHtmlTable editable={true}/>
```

And just like that you have an internally consistent editing experience!

There's a very similar component for Cells that we will now explore in the equivalent
<EditableCellView /> demo.
