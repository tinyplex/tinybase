# An Intro To Relationships

This guide describes how the relationships module gives you the ability to
create and track relationships between Row objects based on the data in a Store.

The main entry point to using the relationships module is the
createRelationships function, which returns a new Relationships object. That
object in turn has methods that let you create new Relationship definitions,
access them directly, and register listeners for when they change.

## The Basics

Here's a simple example to show a Relationships object in action. The `pets`
Table has three Row objects, each with a string `species` Cell, which act as a
key into the Ids of the `species` Table. We create a Relationship definition
called `petSpecies` which connects the two:

```js
import {createRelationships, createStore} from 'tinybase';

const store = createStore()
  .setTable('pets', {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
    cujo: {species: 'dog'},
  })
  .setTable('species', {
    dog: {price: 5},
    cat: {price: 4},
  });

const relationships = createRelationships(store);
relationships.setRelationshipDefinition(
  'petSpecies', // relationshipId
  'pets', //       localTableId to link from
  'species', //    remoteTableId to link to
  'species', //    cellId containing remote key
);

console.log(relationships.getRemoteRowId('petSpecies', 'fido'));
// -> 'dog'
console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
// -> ['fido', 'cujo']
```

The getRemoteRowId method allows you to traverse in the many-to-one direction:
in other words for every Row in the local Table you can find out the one remote
Row referenced. The getLocalRowIds method is the reverse: for a remote Row, it
will return an array of the Row Ids in the local Table that reference it.

There is a special case when the local Table is the same as the remote Table.
This creates a 'linked list' of Row Ids. Specify from which you would like to
start the list, and the getLinkedRowIds method will return the list:

```js
store.setTable('pets', {
  fido: {species: 'dog', next: 'felix'},
  felix: {species: 'cat', next: 'cujo'},
  cujo: {species: 'dog'},
});

relationships.setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');

console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
// -> ['fido', 'felix', 'cujo']
console.log(relationships.getLinkedRowIds('petSequence', 'felix'));
// -> ['felix', 'cujo']
```

## Relationship Reactivity

As with Metrics and Indexes, Relationships objects take care of tracking changes
that will affect the Relationships. The familiar paradigm is used to let you add
a listener to the Relationships object. The listener fires when there's a change
to a Relationship:

```js
const listenerId = relationships.addRemoteRowIdListener(
  'petSpecies',
  'cujo',
  () => {
    console.log(relationships.getRemoteRowId('petSpecies', 'cujo'));
  },
);
store.setCell('pets', 'cujo', 'species', 'wolf');
// -> 'wolf'
```

As expected, reactivity will also work for local and linked Row relationships
(with the addLocalRowIdsListener method and addLinkedRowIdsListener method
respectively).

You can set multiple Relationship definitions on each Relationships object.
However, a given Store can only have one Relationships object associated with
it. If you call this function twice on the same Store, your second call will
return a reference to the Relationships object created by the first.

Let's find out how to include relationships in a user interface in the Building
A UI With Relationships guide.
