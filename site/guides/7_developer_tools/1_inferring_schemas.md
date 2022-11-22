# Inferring Schemas

The TinyBase tools module includes a way to analyze existing data in a Store and
attempt to generate a Schema from it.

This is useful, for example, if you have imported external data into a Store and
want to understand the shape and structure of the data - and then to constrain
that shape through the use of the derived Schema from then on.

## The Tools Object

Firstly, to run any developer tools against a Store, you need to create a Tools
object with the createTools method. This is _not_ included in the main build of
the tinybase module and must be imported explicitly from the `tinybase/tools`
submodule.

Rather than this code living in your production application, it is more likely
(and expected) to be used in a build script or similar.

Usage of the createTools method should be familiar by now, taking a reference to
a Store:

```js
const store = createStore().setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const tools = createTools(store);
```

(In reality it is more likely you would be inferring a schema from dynamically
imported data, but for simplicity here, we are setting the data
deterministically inline.)

The resulting Tools object is now associated with the Store, and, if one is not
already present, the getStoreSchema method is used to infer the Schema. The
method returns an object:

```js
console.log(tools.getStoreSchema());
// -> {pets: {species: {type: 'string', default: 'dog'}}}
```

Since every Row in the `pets` Table has a string `species` Cell, and `dog`
appears the most often, the Schema reflects that type and default. Remember that
a Cell can be a string, number, or boolean:

```js
store.setTable('pets', {
  fido: {price: 4},
  felix: {price: 5},
  cujo: {friendly: false},
});

console.log(tools.getStoreSchema());
// -> {pets: {price: {type: 'number'}, friendly: {type: 'boolean'}}}
```

In this case, not every Row has the same set of Cell Ids, and so no default is
inferred in the Schema.

## Applying An Inferred Schema

Of course, you can programmatically apply the resulting Schema back to the Store
so that future data insertions adhere to the shape of the existing data:

```js
store.setTable('pets', {
  fido: {price: 4},
  felix: {price: 5},
  cujo: {price: 4},
});

store.setSchema(tools.getStoreSchema());

store.setRow('pets', 'rex', {barks: true});
console.log(store.getTable('pets'));
// -> {fido: {price: 4}, felix: {price: 5}, cujo: {price: 4}, rex: {price: 4}}

store.delSchema();
```

## Failure Conditions

There are cases in which a Schema cannot be inferred. Most commonly, this will
happen if data types are not consistent across each Row, or if there is no data
at all:

```js
store.setTable('pets', {
  fido: {price: 4},
  felix: {price: 5},
  cujo: {price: 'not for sale'},
});

console.log(tools.getStoreSchema());
// -> {}

store.delTable('pets');

console.log(tools.getStoreSchema());
// -> {}
```

Note that inferring a schema is an all-or-nothing operation. Even if only one
Table amongst many has inconsistent data, the Schema as a whole will be empty.
One of the things this ensures is that the workflow is idempotent: if you take
an inferred schema and reapply it to the Store, there will be no loss of data.

We can take this technique one step further and actually derive type definitions
and ORM-like implementations from our data or Schema. Move on to the Generating
APIs guide for more details.
