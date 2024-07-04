# Advanced Relationship Definitions

This guide describes how the relationships module let you create more complex
types of relationships based on the data in Store objects.

By default, our Relationship definitions have named a Cell in the Row which
contains the string to use as the Row Id in the remote Table - like the
`species` Cell in the previous guides' examples.

Sometimes you may wish to derive a remote Row Id for each Row that is not in a
single Cell, and in this case you can replace the fourth parameter with a
function which can process the Row in any way you wish.

For example, we could link our pets to a remote Table that is keyed off both
color and species:

```js
import {createRelationships, createStore} from 'tinybase';

const store = createStore()
  .setTable('pets', {
    fido: {species: 'dog', color: 'brown'},
    felix: {species: 'cat', color: 'black'},
    cujo: {species: 'dog', color: 'black'},
  })
  .setTable('species_color', {
    dog_brown: {price: 6},
    dog_black: {price: 5},
    cat_brown: {price: 4},
    cat_black: {price: 2},
  });

const relationships = createRelationships(store);
relationships.setRelationshipDefinition(
  'petSpeciesColor', // relationshipId
  'pets', //            localTableId to link from
  'species_color', //   remote TableId to link to
  (getCell) => `${getCell('species')}_${getCell('color')}`, // => remote Row Id
);

console.log(relationships.getRemoteRowId('petSpeciesColor', 'fido'));
// -> 'dog_brown'
console.log(relationships.getLocalRowIds('petSpeciesColor', 'dog_black'));
// -> ['cujo']
```

And with that, we have covered most of the basics of using the relationships
module.

Let's move on to keeping track of changes to your data in the Using Checkpoints guide.
