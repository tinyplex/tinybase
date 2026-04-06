# Using Svelte DOM Components

The reactive components in the ui-svelte-dom module let you declaratively
display parts of a Store in a web browser, where Svelte's DOM runtime is
available.

These are generally implementations of the components we discussed in the
previous guide, but are specifically designed to render HTML table content in a
browser.

Styling and class names are intentionally basic, since you are expected to
style them with CSS to fit your app's overall visual language.

The easiest way to understand these components is to see them in action in the
UI Components Svelte demos:

| Component              | Purpose                                              |                                                                  |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| ValuesInHtmlTable      | Renders Values.                                      | [demo](/demos/ui-components-svelte/valuesinhtmltable/)           |
| TableInHtmlTable       | Renders a Table.                                     | [demo](/demos/ui-components-svelte/tableinhtmltable/)            |
| SortedTableInHtmlTable | Renders a sorted Table, with optional interactivity. | [demo](/demos/ui-components-svelte/sortedtableinhtmltable/)      |
| EditableValueView      | Renders a Value and lets you change its type/value.  | [demo](/demos/ui-components-svelte/editablevalueview/)           |
| EditableCellView       | Renders a Cell and lets you change its type/value.   | [demo](/demos/ui-components-svelte/editablecellview/)            |

Like ui-svelte itself, the module uses Svelte components rather than React
components, so customization is done by passing component constructors, not
functions that return JSX.

For example, a custom Cell renderer can still use TinyBase's reactive Svelte
functions internally:

```svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  let {tableId, rowId, cellId, store} = $props();
  const word = getCell(() => tableId, () => rowId, () => cellId, () => store);
</script>

<a href={'https://www.merriam-webster.com/dictionary/' + word.current}>
  {word.current}
</a>
```

These demos intentionally mirror the React DOM set so it is easy to compare the
framework-specific code side by side.

This concludes the UI-focused guides. Next we move on to schemas and
persistence in the Schemas guide.
