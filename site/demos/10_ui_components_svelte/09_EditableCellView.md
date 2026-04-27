# <EditableCellView /> (Svelte)

![EditableCellView](/shots/editablecellview-svelte-demo.png)

In this demo, we showcase the EditableCellView component, which allows you to
edit Cell values from a Svelte-based web UI.

Rather than rebuilding the whole demo from scratch, we're making changes to the
[<TableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/tableinhtmltable-svelte/)
demo to show this editing component.

[base]: # '<TableInHtmlTable /> (Svelte)'

## Using the EditableCellView Component

The app body can keep the original table, make it editable, and replace the
other two tables with a focused editor for one specific Cell:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {EditableCellView, TableInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store} = $props();
</script>

<Provider {store}>
  <TableInHtmlTable tableId="genres" editable={true} />
  <div id="edit">
    Genre 5 name:<EditableCellView
      tableId="genres"
      rowId="g05"
      cellId="name"
    />
  </div>
</Provider>
```

And we add the extra CSS for the editor panel and invalid JSON state:

```diff-less
+#edit {
+  align-self: flex-start;
+  background: white;
+  box-shadow: 0 0 1rem #0004;
+  margin: 2rem;
+  min-width: 16rem;
+  padding: 0.5rem 1rem 1rem;
+}
+
+.editableCell button {
+  margin-right: 0.5rem;
+  width: 4rem;
+}
+
+input.invalid {
+  background: #fdd;
+}
```

We finish off the demos of the UI components with the debugging tool. Let's
proceed to the [<Inspector /> (Svelte)](/demos/ui-components-svelte/inspector-svelte/)
demo.
