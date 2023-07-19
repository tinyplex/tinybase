# <TableInHtmlTable />

In this demo, we showcase the TableInHtmlTable component.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <ValuesInHtmlTable /> demo to support this new component.

[base]: # '<ValuesInHtmlTable />'

## Set Up

We switch out the ValuesInHtmlTable component and import the TableInHtmlTable
component instead.

```diff-js
-const {ValuesInHtmlTable} = TinyBaseUiReactDom;
+const {TableInHtmlTable} = TinyBaseUiReactDom;
```

This component renders Table content rather than Values, so we change the load
sequence to asynchronously load some tabular data, stealing from the Movie
Database demo.

```diff-jsx
-  useMemo(() => {
-    loadValues(store);
+  useMemo(async () => {
+    await loadTable(store, 'genres');
     setIsLoading(false);
   }, []);
```

## Loading Data

We're loading a table of data in exactly the same way as we did in the Movie
Database demo:

```js
const NUMERIC = /^[\d\.]+$/;

const loadTable = async (store, tableId) => {
  store.startTransaction();
  const rows = (
    await (await fetch(`https://tinybase.org/assets/${tableId}.tsv`)).text()
  ).split('\n');
  const cellIds = rows.shift().split('\t');
  rows.forEach((row) => {
    const cells = row.split('\t');
    if (cells.length == cellIds.length) {
      const rowId = cells.shift();
      cells.forEach((cell, c) => {
        if (cell != '') {
          if (NUMERIC.test(cell)) {
            cell = parseFloat(cell);
          }
          store.setCell(tableId, rowId, cellIds[c + 1], cell);
        }
      });
    }
  });
  store.finishTransaction();
};
```

This is a small and narrow Table, with just Id and name for the sixteen movie
genres.

## Using the TableInHtmlTable Component

The TableInHtmlTable component is almost as simple as the ValuesInHtmlTable
component, though it will need one prop, the Table Id:

```diff-jsx
 const Body = () => {
   return (
     <>
-      <ValuesInHtmlTable />
-
-      <ValuesInHtmlTable headerRow={false} idColumn={false} />
+      <TableInHtmlTable tableId='genres' />
+      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
     </>
   );
 };
```

Again, that's it.

As before, you can see that you can disable the top header row and Id column on
the left with the `headerRow` and `idColumn` props respectively.

## Customizing Cells

This is a good opportunity to demonstrate how the table components can take
custom components for rendering the inside of the cells in the table. Let's
create a third table, where we pass in a custom `cellComponent` called
`DictionaryCell`:

```diff-jsx
       <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
+      <TableInHtmlTable tableId='genres' cellComponent={DictionaryCell} />
     </>
```

That component should accept props for the Table, Row, and Cell Ids (as well as
the Store) in order to create a different rendering. Here we create a link to an
online dictionary for each word in the column:

```jsx
const DictionaryCell = ({tableId, rowId, cellId, store}) => {
  const word = useCell(tableId, rowId, cellId, store);
  return (
    <a
      href={'https://www.merriam-webster.com/dictionary/' + word}
      target="_blank"
    >
      {word}
    </a>
  );
};
```

We need to update the imports to get access to the useCell hook:

```diff-js
-const {Provider, useCreateStore} = TinyBaseUiReact;
+const {Provider, useCell, useCreateStore} = TinyBaseUiReact;
```

And we can give the links some default styling.

```less
a {
  color: inherit;
}
```

Take a look at the TableInHtmlTableProps type to see all the ways in which you
can configure this component, and again, click the 'CodePen' link under the demo
above to try them out.

Let's move on to a slightly more complex component in the
<SortedTableInHtmlTable /> demo.
