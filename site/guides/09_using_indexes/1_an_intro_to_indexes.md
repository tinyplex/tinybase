# An Intro To Indexes

This guide describes how the indexes module gives you the ability to create and
track indexes based on the data in Store objects, and which allow you to look up
and display filtered data quickly.

The main entry point to using the indexes module is the createIndexes function,
which returns a new Indexes object. That object in turn has methods that let you
create new Index definitions, access the content of those Indexes directly, and
register listeners for when they change.

## The Basics

An Index comprises a map of Slice objects, keyed by Id. The Ids in a Slice
represent Row objects from a Table that all have a derived string value in
common, as described by the setIndexDefinition method. Those values are used as
the key for each Slice in the overall Index object.

This might be simpler to understand with an example: if a Table contains pets,
each with a species, then an Index could be configured to contain the Ids of
each Row, grouped into a Slice for each distinct species. In other words, this
Table:

```js yolo
{ // Store
  pets: {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
    cujo: {species: 'dog'},
  },
}
```

would conceptually become this Index:

```js yolo
{ // Indexes
  bySpecies: {
    dog: ['fido', 'cujo'],
    cat: ['felix'],
  },
}
```

This is for illustrative purposes: note that this resulting Index structure is
never an object literal like this: you would instead use the getSliceIds method
and the getSliceRowIds method to iterate through the it.

Here's a simple example to show such an Index in action. The `pets` Table has
three Row objects, each with a string `species` Cell. We create an Index
definition called `bySpecies` which groups them:

```js
import {createIndexes, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //    cellId to index on
);

console.log(indexes.getSliceIds('bySpecies'));
// -> ['dog', 'cat']
console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['fido', 'cujo']
```

## Index Reactivity

As with the Metrics object, magic happens when the underlying data changes. The
Indexes object efficiently takes care of tracking changes that will affect the
Index or the Slice arrays within it. A similar paradigm to that used on the
Store is used to let you add a listener to the Indexes object. The listener
fires when there's a change to the Slice Ids or a Slice's content:

```js
indexes.addSliceIdsListener('bySpecies', () => {
  console.log(indexes.getSliceIds('bySpecies'));
});
store.setRow('pets', 'lowly', {species: 'worm'});
// -> ['dog', 'cat', 'worm']

indexes.addSliceRowIdsListener('bySpecies', 'worm', () => {
  console.log(indexes.getSliceRowIds('bySpecies', 'worm'));
});
store.setRow('pets', 'smaug', {species: 'worm'});
// -> ['lowly', 'smaug']
```

You can set multiple Index definitions on each Indexes object. However, a given
Store can only have one Indexes object associated with it. So, as with the
Metrics object, if you call this function twice on the same Store, your second
call will return a reference to the Indexes object created by the first.

Let's next find out how to include Indexes in a user interface in the Building A
UI With Indexes guide.
