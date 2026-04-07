# Using Svelte DOM Components

The reactive components in the ui-svelte-dom module let you declaratively
display parts of a Store in a web browser, where Svelte's DOM runtime is
available.

These are generally implementations of the components we discussed in the
previous guide, but are specifically designed to render HTML table content in a
browser.

Styling and class names are intentionally basic, since you are expected to style
them with CSS to fit your app's overall visual language.

The easiest way to understand these components is to see them in action in the
UI Components (Svelte) demos:

| Component                                                                                                     | Purpose                                                    |                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| [ValuesInHtmlTable](/api/ui-svelte-dom/functions/store-components/valuesinhtmltable/)                         | Renders Values.                                            | [demo](/demos/ui-components-svelte/valuesinhtmltable-svelte/)            |
| [TableInHtmlTable](/api/ui-svelte-dom/functions/store-components/tableinhtmltable/)                           | Renders a Table.                                           | [demo](/demos/ui-components-svelte/tableinhtmltable-svelte/)             |
| [SortedTableInHtmlTable](/api/ui-svelte-dom/functions/store-components/sortedtableinhtmltable/)               | Renders a sorted Table, with optional interactivity.       | [demo](/demos/ui-components-svelte/sortedtableinhtmltable-svelte/)       |
| [SliceInHtmlTable](/api/ui-svelte-dom/functions/indexes-components/sliceinhtmltable/)                         | Renders a Slice from an Index.                             | [demo](/demos/ui-components-svelte/sliceinhtmltable-svelte/)             |
| [RelationshipInHtmlTable](/api/ui-svelte-dom/functions/relationships-components/relationshipinhtmltable/)     | Renders the local and remote Tables of a relationship.     | [demo](/demos/ui-components-svelte/relationshipinhtmltable-svelte/)      |
| [ResultTableInHtmlTable](/api/ui-svelte-dom/functions/queries-components/resulttableinhtmltable/)             | Renders a ResultTable.                                     | [demo](/demos/ui-components-svelte/resulttableinhtmltable-svelte/)       |
| [ResultSortedTableInHtmlTable](/api/ui-svelte-dom/functions/queries-components/resultsortedtableinhtmltable/) | Renders a sorted ResultTable, with optional interactivity. | [demo](/demos/ui-components-svelte/resultsortedtableinhtmltable-svelte/) |
| [EditableValueView](/api/ui-svelte-dom/functions/store-components/editablevalueview/)                         | Renders a Value and lets you change its type/value.        | [demo](/demos/ui-components-svelte/editablevalueview-svelte/)            |
| [EditableCellView](/api/ui-svelte-dom/functions/store-components/editablecellview/)                           | Renders a Cell and lets you change its type/value.         | [demo](/demos/ui-components-svelte/editablecellview-svelte/)             |

Like ui-svelte itself, the module uses Svelte components rather than React
components, so customization is done by passing component constructors, not
functions that return JSX.

The demos intentionally mirror the React DOM set so it is easy to compare the
framework-specific code side by side.

If you also want a development overlay for inspecting and editing Stores,
Indexes, Relationships, Queries, and other TinyBase objects, use the
ui-svelte-inspector module and the <Inspector /> (Svelte) demo.

This concludes the UI-focused guides. Next we move on to schemas and persistence
in the Schemas guide.
