# Using Schemas

Schemas are a simple declarative way to say what data you would like to store.

A ValuesSchema simply describes specific Value types and default. A TablesSchema
describes specific Cell types and defaults in specific Tables.

Each is a JavaScript object, and to apply them, you use the setValuesSchema
method and setTablesSchema method respectively.

## Adding A ValuesSchema

Typically you will want to set a ValuesSchema prior to loading and setting data
in your Store:

```js
import {createStore} from 'tinybase';

const store = createStore().setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
});
store.setValues({employees: 3, website: 'pets.com'});
console.log(store.getValues());
// -> {employees: 3, open: false}
```

In the above example, we indicated that the Store contains an `employees` Value
(which needs to be a number) and an `open` Value (which needs to be a boolean).

As you can see, when a Values object is used that doesn't quite match those
constraints, the data is corrected. The `website` Value is ignored, and the
missing `open` Value gets defaulted to `false`.

TinyBase supports the `string`, `number`, and `boolean` primitive types in
schemas. It also supports `object` and `array` types for richer structured data,
which are stored internally as JSON-encoded strings. You can allow `null`
values for any Cell or Value by adding the `allowNull` property:

```js
const store2 = createStore().setValuesSchema({
  nickname: {type: 'string', allowNull: true, default: null},
  verified: {type: 'boolean'},
});
store2.setValues({nickname: null, verified: true});
console.log(store2.getValues());
// -> {nickname: null, verified: true}

store2.setValue('nickname', 'Buddy');
console.log(store2.getValue('nickname'));
// -> 'Buddy'
```

When `allowNull` is `true`, the Cell or Value can be set to either its defined
type or `null`. Without `allowNull`, attempting to set a `null` value will be
rejected by the schema.

## Allowing A Union Of Types

Use an array of two or more type names when a Cell or Value can have more than
one broad type:

```js
const unionStore = createStore().setValuesSchema({
  reference: {type: ['string', 'number'], default: 'unknown'},
  response: {type: ['boolean', 'object'], allowNull: true},
});
unionStore.setValues({reference: 42, response: {accepted: true}});
console.log(unionStore.getValues());
// -> {reference: 42, response: {accepted: true}}
```

A type union can contain `string`, `number`, `boolean`, `object`, and `array`.
Do not include `null` in the array: use `allowNull: true` instead. A default is
used only when it matches one of the union's types, or is `null` when null is
allowed.

## Restricting Values With Enums

Use `enum` instead of `type` when only specific primitive values are valid. An
enum must be non-empty and can contain strings, finite numbers, booleans, or a
mixture of them:

```js
const store3 = createStore().setValuesSchema({
  status: {enum: ['available', 'adopted'], default: 'available'},
  rating: {enum: ['good', 5, true], allowNull: true},
});
store3.setValues({status: 'adopted', rating: true});
store3.setValue('status', 'missing');
console.log(store3.getValues());
// -> {status: 'available', rating: true}
```

Each CellSchema or ValueSchema must have exactly one of `type` or `enum`. A
`type` union allows every value of its listed types, whereas an `enum` allows
only its listed values. The `allowNull`, `default`, and `required` properties
work in either mode. `null` does not go in a type union or enum: use
`allowNull: true` instead. An enum default is used only if it is one of the enum
members, or is `null` when null is allowed.

## Adding A TablesSchema

Tabular schemas are similar. Set a TablesSchema prior to loading data into your
Tables:

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    sold: {type: 'boolean', default: false},
  },
});
store.setRow('pets', 'fido', {species: 'dog', color: 'brown', sold: 'maybe'});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false}}}
```

In the above example, we indicated that the Store contains a single `pets`
Table, each Row of which has a `species` Cell (which needs to be a string) and a
`sold` Cell (which needs to be a boolean).

Again, when a Row is added that doesn't quite match those constraints, the data
is corrected. The `color` Cell is ignored, and the `sold` string is corrected to
the default `false` value.

In general, if a default value is provided (and its type is correct), you can be
certain that that Cell will always be present in a Row. If the default value is
_not_ provided (or its type is incorrect), the Cell may be missing from the Row.
But when it is present you can be guaranteed it is of the correct type.

You can also set `required: true` on a Cell or Value schema to indicate that it
should be present even without providing a default value. This is especially
useful for schema-based typing, since TinyBase will treat the field as defined
without using `undefined` as an allowed data type.

## Altering A Schema

You can also set or change the ValuesSchema or TablesSchema after data has been
added to the Store. Note that this may result in a change to data in the Store,
as defaults are applied or as invalid Value, Table, Row, or Cell objects are
removed. These changes will fire any listeners to that data, as expected.

In this example, the TablesSchema gains a new defaulted field that is added to
the current Row to make it compliant:

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    legs: {type: 'number', default: 4},
    sold: {type: 'boolean', default: false},
  },
});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 4}}}
```

The TablesSchema does not attempt to cast data. If a field needs to be of a
particular type, it really needs to be of that type:

```js
store.setCell('pets', 'fido', 'legs', '3');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 4}}}

store.setCell('pets', 'fido', 'legs', 3);
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 3}}}
```

## Be Aware Of Potential Data Loss

In order to guarantee that a schema is met, Value or Cell data may be removed.
In the case of a Cell being removed, this might result in the removal of a whole
Row.

In this case, for example, the TablesSchema changes quite dramatically and none
of the Cells of the existing data match it, so the Row is deleted:

```js
store.setTablesSchema({
  pets: {
    color: {type: 'string'},
    weight: {type: 'number'},
  },
});
console.log(store.getTables());
// -> {}
```

When no longer needed, you can also completely removes existing schemas with the
delValuesSchema method or the delTablesSchema method.

## Summary

Adding a schema gives you a simple declarative way to describe your data
structure.

You can also benefit from a better developer experience based on these schemas,
and for that we turn to the Schema-Based Typing guide.
