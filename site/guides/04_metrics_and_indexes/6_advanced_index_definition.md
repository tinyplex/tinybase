# Advanced Index Definition

This guide describes how the indexes module let you create more complex types of
indexes based on the data in Store objects.

## Custom Sorting

As well as indicating what the Slice Ids in the Index should be, based on a Cell
value in each Row, you can also indicate how the Row Ids will be sorted inside
each Slice. For example, here the members of each species are sorted by weight,
by specifying that CellId in the fourth parameter:

```jsx
import {createIndexes, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', weight: 42},
  felix: {species: 'cat', weight: 13},
  cujo: {species: 'dog', weight: 37},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index
  'weight', //    cellId to sort by
);

console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['cujo', 'fido']
```

With a further fifth and sixth parameter, you can also indicate how the Slice
Ids (and the Rows within them) should be sorted. These two parameters take a
'sorter' function (much like JavaScript's own array `sort` method) which
compares pairs of values. For example, to order the species Slices
alphabetically, and the animals in each species in _reverse_ weight order:

```jsx
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index
  'weight', //    cellId to sort by
  (id1, id2) => (id1 < id2 ? -1 : 1), // Slices in alphabetical order
  (id1, id2) => (id1 > id2 ? -1 : 1), // Rows in reverse numerical order
);

console.log(indexes.getSliceIds('bySpecies'));
// -> ['cat', 'dog']
console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['fido', 'cujo']
```

Note that you can use the defaultSorter function from the common module (which
is literally equivalent to `(id1, id2) => (id1 < id2 ? -1 : 1)`) if all you want
to do is sort something alphanumerically.

Sorting is used in the Countries demo to sort both the Slice Ids (the first
letters of the alphabet) and the Row Ids (the country names) within them.

## Getting Custom Values From Rows

By default, our Index definitions have named a Cell in the Row which contains
the string to use as the Slice Id - like the `species` Cell in the example
above. Sometimes you may wish to derive a Slice Id for each Row that is not in a
single Cell, and in this case you can replace the third parameter with a
function which can process the Row in any way you wish.

For example, we could group our pets into 'heavy' and 'light' Slices, based on
the range that the `weight` Cell lies in.:

```js
indexes.setIndexDefinition(
  'byWeightRange', //                                           indexId
  'pets', //                                                    tableId to index
  (getCell) => (getCell('weight') > 40 ? 'heavy' : 'light'), // => sliceId
);

console.log(indexes.getSliceIds('byWeightRange'));
// -> ['heavy', 'light']
console.log(indexes.getSliceRowIds('byWeightRange', 'light'));
// -> ['felix', 'cujo']
```

You can also provide a function for the key to sort entries by. This sorts
animal Row Ids, heaviest first, in each Slice:

```js
indexes.setIndexDefinition(
  'byWeightRange', //                                           indexId
  'pets', //                                                    tableId to index
  (getCell) => (getCell('weight') > 40 ? 'heavy' : 'light'), // => sliceId
  (getCell) => -getCell('weight'), //                           => sort key
);

console.log(indexes.getSliceRowIds('byWeightRange', 'light'));
// -> ['cujo', 'felix']
```

And with that, we have covered most of the basics of using the indexes module.
Let's move on to a very similar module for creating relationships between data -
as well as tracking changes - in the Relationships And Checkpoints guide.
