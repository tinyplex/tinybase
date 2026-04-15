# Using Svelte DOM Components

The reactive components in the ui-svelte-dom module let you declaratively
display parts of a Store in a web browser, where Svelte's DOM runtime is
available.

These are specifically designed to render HTML table content in a browser. Here
are a few representative examples:

The ValuesInHtmlTable component is the simplest way to render Store values:

![ValuesInHtmlTable example](/shots/valuesinhtmltable-svelte-demo.png
"ValuesInHtmlTable example")

The RelationshipInHtmlTable component renders related local and remote rows side
by side:

![RelationshipInHtmlTable example](/shots/relationshipinhtmltable-svelte-demo.png
"RelationshipInHtmlTable example")

Styling and class names are intentionally basic, since you are expected to style
them with CSS to fit your app's overall visual language.

The easiest way to understand these components is to see them all in action in
the UI Components (Svelte) demos. There are table-based components for
rendering Tables, sorted Tables, Values, and so on:

| Component                    | Purpose                                                    |                                                                          |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| ValuesInHtmlTable            | Renders Values.                                            | [demo](/demos/ui-components-svelte/valuesinhtmltable-svelte/)            |
| TableInHtmlTable             | Renders a Table.                                           | [demo](/demos/ui-components-svelte/tableinhtmltable-svelte/)             |
| SortedTableInHtmlTable       | Renders a sorted Table, with optional interactivity.       | [demo](/demos/ui-components-svelte/sortedtableinhtmltable-svelte/)       |
| SliceInHtmlTable             | Renders a Slice from an Index.                             | [demo](/demos/ui-components-svelte/sliceinhtmltable-svelte/)             |
| RelationshipInHtmlTable      | Renders the local and remote Tables of a relationship.     | [demo](/demos/ui-components-svelte/relationshipinhtmltable-svelte/)      |
| ResultTableInHtmlTable       | Renders a ResultTable.                                     | [demo](/demos/ui-components-svelte/resulttableinhtmltable-svelte/)       |
| ResultSortedTableInHtmlTable | Renders a sorted ResultTable, with optional interactivity. | [demo](/demos/ui-components-svelte/resultsortedtableinhtmltable-svelte/) |

There are also editable components for individual Cells and Values:

| Component         | Purpose                                                 |                                                               |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| EditableCellView  | Renders a Cell and lets you change its type and value.  | [demo](/demos/ui-components-svelte/editablecellview-svelte/)  |
| EditableValueView | Renders a Value and lets you change its type and value. | [demo](/demos/ui-components-svelte/editablevalueview-svelte/) |

The EditableValueView component shows the inline editing controls used by the
editable components:

![EditableValueView example](/shots/editablevalueview-svelte-demo.png
"EditableValueView example")

Like ui-svelte itself, the module uses Svelte components rather than React
components, so customization is done by passing component constructors, not
functions that return JSX.

Having said that, the demos intentionally mirror the React DOM set so it is easy
to compare the framework-specific code side by side.

If you also want a development overlay for inspecting and editing Stores,
Indexes, Relationships, Queries, and other TinyBase objects, use the
ui-svelte-inspector module and the <Inspector /> (Svelte) demo.

The final guide in this section shows how Provider context keeps TinyBase
objects out of your component props. Please proceed to the Using Context guide.
