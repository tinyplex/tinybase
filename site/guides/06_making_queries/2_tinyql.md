# TinyQL

This guide describes how to build a query against Store data, using the API
provided by the setQueryDefinition method in the Queries object.

This guide is called 'TinyQL', rather flippantly. Queries to TinyBase are not
made with a standard parsable language in the same way you would use SQL to
access a traditional relational database. Rather, the API is typed and
programmatic, making it a performant, unambiguous, and composable way to
transform data.

```js
import {createQueries, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});

const queries = createQueries(store);
queries.setQueryDefinition('query', 'pets', (keywords) => {
  // TinyQL goes here
});
```

One downside might seem that you can't directly use your experience of SQL
syntax to work with TinyBase queries - but, as you'll see, many of the similar
concepts will be very familiar.

You define a query with the setQueryDefinition method. It takes an Id, you'd
like to assign to the query, and the `root` Table from which the data will be
queried. The root table is like the first table that is named in a traditional
SQL query, except that only 'left' joins can be made from it. (This means that
the result of a query can never have more Rows than that underlying Table did.)

The third parameter, `build`, is where the magic happens: you provide a function
to define the query. that will be called with with an object that contains the
five named 'keyword' functions for the query:

- `select`: a function that lets you specify a Cell or calculated value for
  including into the query's result.
- `join` describes a function that lets you specify a Cell or calculated value
  to join the main query Table to others, by Row Id.
- `where` describes a function that lets you specify conditions to filter
  results, based on the underlying Cells of the main or joined Tables.
- `group` describes a function that lets you specify that the values of a Cell
  in multiple result Rows should be aggregated together.
- `having` describes a function that lets you specify conditions to filter
  results, based on the grouped Cells resulting from a Group clause.

All five can be destructured from the callback's single parameter:

```js
queries.setQueryDefinition(
  'query',
  'pets',
  ({select, join, where, group, having}) => {
    select(/* ... */);
    select(/* ... */);
    join(/* ... */);
    where(/* ... */);
    group(/* ... */);
    having(/* ... */);
    // and so on...
  },
);
```

Any of these keyword functions can be called multiple times (even imperatively,
such as in a loop). The only requirement for a valid query is that at least one
`select` function call is made.

Here's a quick summary of each of the five keyword functions. Some of them are
overloaded and have different effects based on the number of arguments, but they
are all fully typed with TypeScript and well documented with examples.

## Select

The Select type describes the `select` function that lets you specify a Cell or
calculated value for including into the query's result. You can chain the `as`
function to change the name of the Cell.

Calling this function with one Id parameter will indicate that the query should
select the value of that specified Cell from the query's main Table:

```js
queries.setQueryDefinition('query', 'pets', ({select}) => select('color'));

console.log(queries.getResultTable('query'));
// -> {fido: {color: 'brown'}, felix: {color: 'black'}, cujo: {color: 'black'}}
```

Calling this function with one _callback_ parameter will indicate that the query
should select a calculated value, based on one or more Cell values:

```js
queries.setQueryDefinition('query', 'pets', ({select}) =>
  select((getCell) => getCell('color')?.toUpperCase()).as('COLOR'),
);

console.log(queries.getResultTable('query'));
// -> {fido: {COLOR: 'BROWN'}, felix: {COLOR: 'BLACK'}, cujo: {COLOR: 'BLACK'}}
```

If you are joining multiple Tables in the query, use an additional first
parameter to indicate which the Cell should come from:

```js
store
  .setTable('pets', {
    fido: {species: 'dog', ownerId: '1'},
    felix: {species: 'cat', ownerId: '2'},
    cujo: {species: 'dog', ownerId: '3'},
  })
  .setTable('owners', {
    1: {name: 'Alice'},
    2: {name: 'Bob'},
    3: {name: 'Carol'},
  });

queries.setQueryDefinition('query', 'pets', ({select, join}) => {
  select('species');
  select('owners', 'name');
  join('owners', 'ownerId');
});

queries.forEachResultRow('query', (rowId) => {
  console.log({[rowId]: queries.getResultRow('query', rowId)});
});
// -> {fido: {species: 'dog', name: 'Alice'}}
// -> {felix: {species: 'cat', name: 'Bob'}}
// -> {cujo: {species: 'dog', name: 'Carol'}}
```

## Join

We just saw the `join` keyword in action. The Join type describes a function
that lets you specify a Cell or calculated value to join the main query Table to
other Tables, by their Row Id.

Calling this function with two Id parameters will indicate that the join to a
Row in an adjacent Table is made by finding its Id in a Cell of the query's main
Table, as in the example above.

You can join zero, one, or many Tables. You can even join the same underlying
Table multiple times, (though in that case you will need to use the 'as'
function to distinguish them from each other):

```js
store
  .setTable('pets', {
    fido: {species: 'dog', buyerId: '1', sellerId: '2'},
    felix: {species: 'cat', buyerId: '2'},
    cujo: {species: 'dog', buyerId: '3', sellerId: '1'},
  })
  .setTable('humans', {
    1: {name: 'Alice'},
    2: {name: 'Bob'},
    3: {name: 'Carol'},
  });

queries.setQueryDefinition('query', 'pets', ({select, join}) => {
  select('buyers', 'name').as('buyer');
  select('sellers', 'name').as('seller');
  join('humans', 'buyerId').as('buyers');
  join('humans', 'sellerId').as('sellers');
});

queries.forEachResultRow('query', (rowId) => {
  console.log({[rowId]: queries.getResultRow('query', rowId)});
});
// -> {fido: {buyer: 'Alice', seller: 'Bob'}}
// -> {felix: {buyer: 'Bob'}}
// -> {cujo: {buyer: 'Carol', seller: 'Alice'}}
```

Because a Join clause is used to identify which unique Row Id of the joined
Table will be joined to each Row of the main Table, queries follow the 'left
join' semantics you may be familiar with from SQL.

By default, each join is made from the main query Table to the joined table, but
it is also possible to connect via an intermediate join Table to a more distant
join Table.

The Join type documentation provides many more examples of joining in queries.

## Where

The Where type describes the `where` function that lets you specify conditions
to filter results, based on the underlying Cells of the main or joined Tables.

Calling this function with two parameters is used to include only those Rows for
which a specified Cell in the query's main Table has a specified value:

```js
queries.setQueryDefinition('query', 'pets', ({select, where}) => {
  select('species');
  where('species', 'dog');
});

console.log(queries.getResultTable('query'));
// -> {fido: {species: 'dog'}, cujo: {species: 'dog'}}
```

A Where condition has to be true for a Row to be included in the results. Each
Where class is additive, as though combined with a logical 'and'.

If you wish to create an 'or' expression, or just create a more complex
criterion, use the single parameter that allows arbitrary programmatic
conditions:

```js
queries.setQueryDefinition('query', 'pets', ({select, where}) => {
  select('species');
  where((getCell) => getCell('species')?.[0] == 'c');
});

console.log(queries.getResultTable('query'));
// -> {felix: {species: 'cat'}}
```

## Group

The Group type describes the `group` function that lets you specify that the
values of a Cell in multiple result Rows should be aggregated together. This is
applied after any joins or where-based filtering.

If you provide a Group for every Select, the result will be a single Row with
every Cell having been aggregated. If you provide a Group for only one, or some,
of the Select clauses, the _others_ will be automatically used as dimensional
values (analogous to the 'group by` semantics in SQL), within which the
aggregations of Group Cells will be performed.

You can join the same underlying Cell multiple times, but in that case you will
need to use the 'as' function to distinguish them from each other.

```js
store.setTable('pets', {
  fido: {species: 'dog', price: 5},
  felix: {species: 'cat', price: 4},
  cujo: {species: 'dog', price: 4},
  tom: {species: 'cat', price: 3},
  carnaby: {species: 'parrot', price: 3},
  polly: {species: 'parrot', price: 3},
});

queries.setQueryDefinition('query', 'pets', ({select, group}) => {
  select('species');
  select('price');
  group('price', 'count').as('count');
  group('price', 'avg').as('avgPrice');
});

queries.forEachResultRow('query', (rowId) => {
  console.log({[rowId]: queries.getResultRow('query', rowId)});
});
// -> {0: {species: 'dog', count: 2, avgPrice: 4.5}}
// -> {1: {species: 'cat', count: 2, avgPrice: 3.5}}
// -> {2: {species: 'parrot', count: 2, avgPrice: 3}}
```

You can also provide your own aggregate function, with optional 'shortcut'
functions if you can avoid calculating the new value for the result without
scanning every value again (much like you can with calculated Metrics). See the
Group documentation for more details and examples.

## Having

The Having type describes the `having` function that lets you specify conditions
to filter results, based on the grouped Cells resulting from a Group clause.

Like the `where` function, call this with two parameters is used to include only
those Rows for which a specified Cell in the query's main Table has a specified
value.

_Unlike_ the `where` function, this filtering is applied _after_ the grouping
has been performed, much like you would use `HAVING` instead of `WHERE` in a
classic SQL environment.

```js
queries.setQueryDefinition('query', 'pets', ({select, group, having}) => {
  select('pets', 'species');
  select('pets', 'price');
  group('price', 'min').as('minPrice');
  group('price', 'max').as('maxPrice');
  having('minPrice', 3);
});

queries.forEachResultRow('query', (rowId) => {
  console.log({[rowId]: queries.getResultRow('query', rowId)});
});
// -> {0: {species: 'cat', minPrice: 3, maxPrice: 4}}
// -> {1: {species: 'parrot', minPrice: 3, maxPrice: 3}}
```

(Note that you shouldn't make any assumptions about the Row Ids on a result
Table that has been grouped.)

Again, multiple `having` functions will behave as though combined with a logical
'and'. If you wish to create an 'or' expression, or just create a more complex
criterion, use the single parameter version that allows arbitrary programmatic
conditions

```js
queries.setQueryDefinition('query', 'pets', ({select, group, having}) => {
  select('pets', 'species');
  select('pets', 'price');
  group('price', 'min').as('minPrice');
  group('price', 'max').as('maxPrice');
  having((getCell) => getCell('minPrice') == getCell('maxPrice'));
});

console.log(queries.getResultTable('query'));
// -> {0: {species: 'parrot', minPrice: 3, maxPrice: 3}}
```

## Putting It All Together

To finish off, let's look at a more complex complex TinyQL query that includes
all the keywords in use together, and shows how something similar might have
been expressed in SQL.

First let's build an interesting dataset:

```js
store
  .setTable('pets', {
    fido: {speciesId: '1', colorId: '1', ownerId: '1'},
    rex: {speciesId: '1', colorId: '2', ownerId: '6'},
    cujo: {speciesId: '1', colorId: '3', ownerId: '3'},
    felix: {speciesId: '2', colorId: '2', ownerId: '2'},
    tom: {speciesId: '2', colorId: '1', ownerId: '5'},
    lowly: {speciesId: '3', colorId: '1', ownerId: '4'},
    smaug: {speciesId: '3', colorId: '4', ownerId: '1'},
  })
  .setTable('species', {
    1: {name: 'dog', price: 5},
    2: {name: 'cat', price: 4},
    3: {name: 'worm', price: 1},
  })
  .setTable('color', {
    1: {name: 'brown', premium: 1.0},
    2: {name: 'black', premium: 1.5},
    3: {name: 'white', premium: 2},
    4: {name: 'silver', premium: 4},
  })
  .setTable('owner', {
    1: {name: 'Alice', regionId: '1'},
    2: {name: 'Bob', regionId: '1'},
    3: {name: 'Carol', regionId: '2'},
    4: {name: 'Dennis', regionId: '2'},
    5: {name: 'Errol', regionId: '3'},
    6: {name: 'Fiona', regionId: '4'},
  })
  .setTable('region', {
    1: {name: 'California', country: 'US'},
    2: {name: 'New York', country: 'US'},
    3: {name: 'Washington', country: 'US'},
    4: {name: 'British Columbia', country: 'CA'},
  });
```

And then an interesting query against it:

```js
queries.setQueryDefinition(
  'query',
  'pets',
  ({select, join, where, group, having}) => {
    // SELECT...
    select('state', 'name').as('stateName');
    select(
      (getTableCell) =>
        getTableCell('species', 'price') * getTableCell('color', 'premium'),
    ).as('fullPrice');

    // FROM...
    ['species', 'color', 'owner'].forEach((table) => join(table, `${table}Id`));
    join('region', 'owner', 'regionId').as('state');

    // WHERE...
    where('state', 'country', 'US');

    // GROUP
    group('fullPrice', 'avg').as('avgFullPrice');

    // HAVING
    having((getCell) => getCell('avgFullPrice') >= 5);
  },
);
```

(Notice how the joins to the `species`, `color`, and `owner` tables are performed
programmatically here - just to prove a point! - because there's a useful
convention on the Cell Ids used. Also see the Movie Database demo for an example of
modular query composition.)

This query is roughly expressed in English as "The average price of pets per
state (based on their color and species) sold to owners who live in the US, for
states where that average price is 5 or more, and listing the top three states
in descending order"

But for the "top three states in descending order" part, you've probably noticed
by now that there is no TinyQL equivalent to SQL's `ORDER BY` or `LIMIT`.
Instead you perform sorting and optional pagination when you actually extract
the data, using the getResultSortedRowIds method:

```js
queries
  .getResultSortedRowIds('query', 'avgFullPrice', true, 0, 3)
  .forEach((rowId) => console.log(queries.getResultRow('query', rowId)));
// -> {"stateName": "New York", "avgFullPrice": 5.5}
// -> {"stateName": "California", "avgFullPrice": 5}
```

The results should check out: the owners who are in the US are Alice, Bob,
Carol, Dennis, Errol. In California, the pets are Fido (a brown dog, costing 5),
Felix (a black cat, costing 6) and Smaug (a silver worm, costing 4), averaging 5
for that state. In New York, the pets are Cujo (a white dog, costing 10) and
Lowly (a brown worm, costing 1), averaging 5.5 for that state. In Washington,
the only pet is Tom (a brown cat, costing 4), so that whole state fails the
minimum average price.

The equivalent SQL for what we've just done here would be something like:

```sql
SELECT
  state.name AS stateName,
  AVG(species.price * color.premium) AS avgFullPrice,
FROM
  pets
  LEFT JOIN species
    ON species._rowId = pets.speciesId
  LEFT JOIN color
    ON color._rowId = pets.colorId
  LEFT JOIN owner
    ON owner._rowId = pets.ownerId
    LEFT JOIN region AS state
      ON region._rowId = owner.regionId
WHERE
  state.country = 'US'
GROUP BY
  stateName
HAVING
  avgFullPrice >= 5;
ORDER BY
  avgFullPrice DESC
LIMIT
  3
```

Hopefully that makes sense!

Wait... did we mention it's also reactive? It's probably worth showcasing
something that SQL struggles to do :)

```js
queries.addResultSortedRowIdsListener(
  'query',
  'avgFullPrice',
  true,
  0,
  3,
  (_queries, _queryId, _cellId, _descending, _offset, _limit, rowIds) =>
    console.log(queries.getResultTable('query')),
);

// Bob is actually in British Columbia!
store.setCell('owner', 2, 'regionId', '4');

// -> {1: {"stateName": "New York", "avgFullPrice": 5.5}}
```

Now that Bob is in Canada, removing Felix (cost 6) from California lowers its
average to 4.5 - too low for our results, and we only see New York! Magic.

## Summary

Next, let's find out how to include queries in a user interface in the Building
A UI With Queries guide.
