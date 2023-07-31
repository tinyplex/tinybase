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
-      <TableInHtmlTable tableId='genres' customCells={customCells} />
+      <SortedTableInHtmlTable
+        tableId='movies'
+      />
     </>
   );
 };
```

Take a look at the SortedTableInHtmlTableProps type and HtmlTableProps type to
see all the ways in which you can configure this component. We're going to use a
few here.

Firstly, since the Table is very wide (and contains a lengthy description), we
will first explicitly set the Cell Ids we want to display:

```diff-js
-const customCells = {name: {label: 'Name', component: DictionaryCell}};
+const customCells = {name: 'Name', year: 'Year', rating: 'Rating'};
```

(This configuration can simply be an array of the Cell Ids, an object with Cell
Id as key and label as value (like this), or an object made up of CustomCell
objects. See the HtmlTableProps type for more details.)

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
+        customCells={customCells}
       />
```

The SortedTableInHtmlTableProps component, much like the getSortedRowIds method,
can take props to indicate how the sorting should work. `cellId` indicates which
Cell to use to sort on, and `descending` indicates the direction. We can sort
the movies by rating accordingly:

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
         customCells={customCells}
+        cellId='rating'
+        descending={true}
+        limit={7}
       />
```

Note that we can also use the `limit` prop to paginate the data.

The component automatically adds two classes to the heading of the column that
is being used for the sorting. We can add styling to show which column it is,
and a small arrow to indicate the direction:

```less
th.sorted {
  background: #ddd;
}
```

## Interactivity

The SortedTableInHtmlTable component can be made to be interactive. By adding
the sortOnClick flag prop, you can make it such that users can click on the
column headings to change the sorting:

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
         customCells={customCells}
         cellId='rating'
         descending={true}
         limit={7}
+        sortOnClick={true}
       />
```

As this means the table's content can change, the columns might adjust their
widths and the table jumps around. We can quickly fix this by hinting about the
widths of the header row so that the layout is stable:

```less
thead th {
  width: 5rem;
  &:nth-of-type(2) {
    width: 28rem;
  }
}
```

Nice! It's still a simple table, but we have some useful interactivity out of
the box.

We can also add pagination controls, by adding the `paginator` prop. This either
takes `true` to enable the default SortedTablePaginator component, or a
paginator component of your own design that accepts SortedTablePaginatorProps.

```diff-jsx
       <SortedTableInHtmlTable
         tableId='movies'
         customCells={customCells}
         cellId='rating'
         descending={true}
         limit={7}
         sortOnClick={true}
+        paginator={true}
       />
```

This places the pagination controls in the `<caption>` element of the `<table>`,
and you can use CSS to position and style it. We are removing the default text
from

```less
table caption {
  caption-side: top;
  text-align: left;
  margin-bottom: 1rem;
  button {
    margin-right: 0.5rem;
  }
}
```

As well as rendering raw Tables from a Store, we can do the same for each
ResultTable of a Queries object, as you'll see in the next
<ResultTableInHtmlTable /> demo.
