# Using Solid DOM Components

The reactive components in the ui-solid-dom module let you declaratively display
parts of a Store in a web browser, where Solid's DOM runtime is available.

These are specifically designed to render HTML table content in a browser. Here
are a few representative examples:

The ui-solid-dom module is client-only: its package export is available under
the `browser` condition, and these components do not support server-side
rendering.

The ValuesInHtmlTable component is the simplest way to render Store values:

![ValuesInHtmlTable example](/shots/valuesinhtmltable-solid-demo.png 'ValuesInHtmlTable example')

The RelationshipInHtmlTable component renders related local and remote rows side
by side:

![RelationshipInHtmlTable example](/shots/relationshipinhtmltable-solid-demo.png 'RelationshipInHtmlTable example')

Styling and class names are intentionally basic, since you are expected to style
them with CSS to fit your app's overall visual language.

The easiest way to understand these components is to see them all in action in
the UI Components (Solid) demos. There are table-based components for rendering
Tables, sorted Tables, Values, and so on:

| Component                    | Purpose                                                    |                                                                        |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| ValuesInHtmlTable            | Renders Values.                                            | [demo](/demos/ui-components-solid/valuesinhtmltable-solid/)            |
| TableInHtmlTable             | Renders a Table.                                           | [demo](/demos/ui-components-solid/tableinhtmltable-solid/)             |
| SortedTableInHtmlTable       | Renders a sorted Table, with optional interactivity.       | [demo](/demos/ui-components-solid/sortedtableinhtmltable-solid/)       |
| SliceInHtmlTable             | Renders a Slice from an Index.                             | [demo](/demos/ui-components-solid/sliceinhtmltable-solid/)             |
| RelationshipInHtmlTable      | Renders the local and remote Tables of a relationship.     | [demo](/demos/ui-components-solid/relationshipinhtmltable-solid/)      |
| ResultTableInHtmlTable       | Renders a ResultTable.                                     | [demo](/demos/ui-components-solid/resulttableinhtmltable-solid/)       |
| ResultSortedTableInHtmlTable | Renders a sorted ResultTable, with optional interactivity. | [demo](/demos/ui-components-solid/resultsortedtableinhtmltable-solid/) |

There are also editable components for individual Cells and Values:

| Component         | Purpose                                                 |                                                             |
| ----------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| EditableCellView  | Renders a Cell and lets you change its type and value.  | [demo](/demos/ui-components-solid/editablecellview-solid/)  |
| EditableValueView | Renders a Value and lets you change its type and value. | [demo](/demos/ui-components-solid/editablevalueview-solid/) |

The EditableValueView component shows the inline editing controls used by the
editable components:

![EditableValueView example](/shots/editablevalueview-solid-demo.png 'EditableValueView example')

Like ui-solid itself, the module uses Solid components and Accessors, so
customization is done by passing component functions that fit Solid's JSX
model.

Having said that, the demos intentionally mirror the React DOM set so it is easy
to compare the framework-specific code side by side.

If you also want a development overlay for inspecting and editing Stores,
Indexes, Relationships, Queries, and other TinyBase objects, use the
ui-solid-inspector module and the <Inspector /> (Solid) demo.

The final guide in this section shows how Provider context keeps TinyBase
objects out of your component props. Please proceed to the Using Context guide.
