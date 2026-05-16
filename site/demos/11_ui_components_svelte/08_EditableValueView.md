# <EditableValueView /> (Svelte)

![EditableValueView](/shots/editablevalueview-svelte-demo.png)

In this demo, we showcase the EditableValueView component, which allows you to
edit Values in a Store from a Svelte-based web UI.

Rather than rebuilding the whole demo from scratch, we're making changes to the
[<ValuesInHtmlTable /> (Svelte)](/demos/ui-components-svelte/valuesinhtmltable-svelte/)
demo to show this editing component.

[base]: # '<ValuesInHtmlTable /> (Svelte)'

## Using the EditableValueView Component

The app body can keep the original table, make it editable, and replace the
second table with a standalone editor for one Value:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {EditableValueView, ValuesInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store} = $props();
</script>

<Provider {store}>
  <ValuesInHtmlTable editable={true} />
  <div id="edit">Username:<EditableValueView valueId="username" /></div>
</Provider>
```

And we add the extra CSS needed for the editor panel and invalid JSON state:

```diff-less
+#edit {
+  background: white;
+  box-shadow: 0 0 1rem #0004;
+  margin: 2rem;
+  min-width: 16rem;
+  padding: 0.5rem 1rem 1rem;
+}
+
+.editableValue button {
+  margin-right: 0.5rem;
+  width: 4rem;
+}
+
+input.invalid {
+  background: #fdd;
+}
```

There is a matching component for Cells too, which we cover next in the
[<EditableCellView /> (Svelte)](/demos/ui-components-svelte/editablecellview-svelte/)
demo.
