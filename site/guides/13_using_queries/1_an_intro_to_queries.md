# An Intro To Queries

This guide describes how the queries module gives you the ability to create
queries against Tables in the Store - such as selecting specific Row and Cell
combinations from each Table, or performing powerful features like grouping and
aggregation.

The main entry point to using the queries module is the createQueries function,
which returns a new Queries object. That object in turn has methods that let you
create new query definitions, access their results directly, and register
listeners for when those results change.

The Queries module provides a generalized query concept for Store data. If you
just want to create and track metrics, indexes, or relationships between rows,
you may prefer to use the dedicated Metrics, Indexes, and Relationships objects,
which have simpler APIs.

## The Basics

Here's a simple example to show a Queries object in action. The `pets` Table has
three Row objects, each with two Cells. We create a query definition called
`dogColors` which selects just one of those, and filters the Rows based on the
value in the other:

```js
import {createQueries, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});

const queries = createQueries(store);
queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
  select('color');
  where('species', 'dog');
});

console.log(queries.getResultTable('dogColors'));
// -> {fido: {color: 'brown'}, cujo: {color: 'black'}}
```

The key to understanding how the Queries API works is in the
`setQueryDefinition` line above. You provide a function which will be called
with a selection of 'keyword' functions that you can use to define the query.
These include `select`, `join`, `where`, `group`, and `having` and are described
in the TinyQL guide.

Note that, for getting data out, the Queries object has methods analogous to
those in the Store object, prefixed with the word 'Result':

- The getResultTable method is the Queries equivalent of the getTable method.
- The getResultRowIds method is the Queries equivalent of the getRowIds method.
- The getResultSortedRowIds method is the Queries equivalent of the getSortedRowIds method.
- The getResultRow method is the Queries equivalent of the getRow method.
- The getResultCellIds method is the Queries equivalent of the getCellIds method.
- The getResultCell method is the Queries equivalent of the getCell method.

The same conventions apply for registering listeners with the Queries object, as
described in the following section.

## Queries Reactivity

As with Metrics, Indexes, and Relationships, Queries objects take care of
tracking changes that will affect the query results. The familiar paradigm is
used to let you add a listener to the Queries object. The listener fires when
there's a change to any of the resulting data:

```js
const listenerId = queries.addResultTableListener('dogColors', () => {
  console.log(queries.getResultTable('dogColors'));
});
store.setCell('pets', 'cujo', 'species', 'wolf');
// -> {fido: {color: 'brown'}}
```

Hopefully the pattern of the method naming is now familiar:

- The addResultTableListener method is the Queries equivalent of the addTableListener method.
- The addResultRowIdsListener method is the Queries equivalent of the addRowIdsListener method.
- The addResultSortedRowIdsListener method is the Queries equivalent of the addSortedRowIdsListener method.
- The addResultRowListener method is the Queries equivalent of the addRowListener method.
- The addResultCellIdsListener method is the Queries equivalent of the addCellIdsListener method.
- The addResultCellListener method is the Queries equivalent of the addCellListener method.

You can set multiple query definitions on each Queries object. However, a given
Store can only have one Queries object associated with it. If you call this
function twice on the same Store, your second call will return a reference to
the Queries object created by the first.

Let's find out how to create different types of queries in the TinyQL guide.
