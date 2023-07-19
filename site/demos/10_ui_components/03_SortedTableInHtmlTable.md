# <SortedTableInHtmlTable />

In this demo, we showcase the SortedTableInHtmlTable component, a more complex
and interactive way to render a TinyBase Table.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <TableInHtmlTable /> demo to support this new component.

[base]: # '<TableInHtmlTable />'

## Set Up

We switch out the TableInHtmlTable component and import the
SortedTableInHtmlTable component instead.

```diff-js
-const {TableInHtmlTable} = TinyBaseUiReactDom;
+const {SortedTableInHtmlTable} = TinyBaseUiReactDom;
```

This component is best showcased with a larger data set, so we load up movies
instead of genres:

```diff-jsx
   useMemo(async () => {
-    await loadTable(store, 'genres');
+    await loadTable(store, 'movies');
     setIsLoading(false);
   }, []);
```

## Using the SortedTableInHtmlTable Component

The SortedTableInHtmlTable component is similar to the TableInHtmlTable
component, requiring at least the Table Id:

```diff-jsx
 const Body = () => {
   return (
     <>
-      <TableInHtmlTable tableId='genres' />
-      <TableInHtmlTable tableId='genres' headerRow={false} idColumn={false} />
-      <TableInHtmlTable tableId='genres' cellComponent={DictionaryCell} />
+      <SortedTableInHtmlTable
+        tableId='movies'
+      />
     </>
   );
 };
```

Take a look at the SortedTableInHtmlTableProps type to see all the ways in which
you can configure this component. We're going to use a few here.

Firstly, since the Table is very wide (and contains a lengthy description), we
will first explicitly set the Cell Ids we want to display:

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
+        customCellIds={['name', 'year', 'rating']}
       />
```

The SortedTableInHtmlTableProps component, much like the getSortedRowIds method,
can take props to indicate how the sorting should work. `cellId` indicates which
Cell to use to sort on, and `descending` indicates the direction. We can sort
the movies by rating accordingly:

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
         customCellIds={['name', 'year', 'rating']}
+        cellId='rating'
+        descending={true}
       />
```

The component automatically adds two classes to the heading of the column that
is being used for the sorting. We can add styling to show which column it is,
and a small arrow to indicate the direction:

```less
th.sorted {
  background: #ddd;
  &::before {
    padding-right: 0.25rem;
  }
  &.ascending::before {
    content: '\2193';
  }
  &.descending::before {
    content: '\2191';
  }
}
```

## Interactivity

The SortedTableInHtmlTable component can be made to be interactive. By adding
the sortOnClick flag prop, you can make it such that users can click on the
column headings to change the sorting:

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
         customCellIds={['name', 'year', 'rating']}
         cellId='rating'
         descending={true}
+        sortOnClick={true}
       />
```

As this means the table's content can change, the columns might adjust their
widths and the table jumps around. We can quickly fix this by hinting about the
widths of the header row so that the layout is stable:

```less
thead th {
  min-width: 6rem;
}
```

Nice! It's still a simple table, but we have some useful interactivity out of
the box.
