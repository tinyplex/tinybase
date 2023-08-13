# Using React DOM Components

The reactive components in the ui-react-dom module let you declaratively display
parts of a Store in a web browser, where the ReactDOM module is available.

These are generally implementations of the components we discussed in the
previous guide, but are specifically designed to render HTML content in a
browser.

Styling and class names are very basic, since you are expected to style them
with CSS to fit your app's overall styling.

The easiest way to understand these components is to see them all in action in
the UI Components demos. There are table-based components for rendering Tables,
sorted Tables, Values, and so on:

| Component                    | Purpose                                                    |                                                           |
| ---------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| ValuesInHtmlTable            | Renders Values.                                            | [demo](/demos/ui-components/valuesinhtmltable)            |
| TableInHtmlTable             | Renders a Table.                                           | [demo](/demos/ui-components/tableinhtmltable)             |
| SliceInHtmlTable             | Renders a Slice from an Index.                             | [demo](/demos/ui-components/sliceinhtmltable)             |
| RelationshipInHtmlTable      | Renders the local and remote Tables of a relationship      | [demo](/demos/ui-components/relationshipinhtmltable)      |
| SortedTableInHtmlTable       | Renders a sorted Table, with optional interactivity.       | [demo](/demos/ui-components/sortedtableinhtmltable)       |
| ValuesInHtmlTable            | Renders Values.                                            | [demo](/demos/ui-components/valuesinhtmltable)            |
| ResultTableInHtmlTable       | Renders a ResultTable.                                     | [demo](/demos/ui-components/resulttableinhtmltable)       |
| ResultSortedTableInHtmlTable | Renders a sorted ResultTable, with optional interactivity. | [demo](/demos/ui-components/resultsortedtableinhtmltable) |

There are also editable components for individual Cells and Values:

| Component         | Purpose                                                 |                                                |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------- |
| EditableCellView  | Renders a Cell and lets you change its type and value.  | [demo](/demos/ui-components/editablecellview)  |
| EditableValueView | Renders a Value and lets you change its type and value. | [demo](/demos/ui-components/editablevalueview) |

We finish off this section with a best practice to avoid passing the global
Store down into components. Please proceed to to the Using Context guide!
