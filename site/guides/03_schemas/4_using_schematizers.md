# Using Schematizers

Schematizers provide a convenient way to convert schemas from popular validation
libraries into TinyBase's TablesSchema and ValuesSchema formats.

Instead of manually writing TinyBase schemas, you can use your existing schemas
from libraries like Zod and TypeBox, and convert them at runtime using a
schematizer.

## Using The Zod Schematizer

The Zod schematizer allows you to convert Zod schemas into TinyBase schemas. You
create a schematizer with the createZodSchematizer function and then use its
toTablesSchema method and toValuesSchema method to perform the conversion:

```js
import {createStore} from 'tinybase';
import {createZodSchematizer} from 'tinybase/schematizers/schematizer-zod';
import {z} from 'zod';

const schematizer = createZodSchematizer();

const store = createStore().setTablesSchema(
  schematizer.toTablesSchema({
    pets: z.object({
      species: z.string(),
      age: z.number(),
      sold: z.boolean().default(false),
    }),
  }),
);

store.setRow('pets', 'fido', {species: 'dog', age: 3});
console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog', age: 3, sold: false}
```

The schematizer performs a best-effort conversion, extracting basic type
information (string, number, boolean), defaults, and nullable settings from your
Zod schemas.

## Converting Values Schemas

You can also convert Zod schemas for individual values:

```js
const store2 = createStore().setValuesSchema(
  schematizer.toValuesSchema({
    theme: z.string().default('light'),
    count: z.number(),
    isOpen: z.boolean(),
  }),
);

store2.setValue('count', 42);
console.log(store2.getValues());
// -> {theme: 'light', count: 42}
```

In this example, only `theme` has a default value. The `count` and `isOpen`
values don't have defaults, so they won't appear in the store until explicitly
set.

## Handling Nullable And Optional Fields

The Zod schematizer understands nullable and optional fields:

```js
const store3 = createStore().setTablesSchema(
  schematizer.toTablesSchema({
    users: z.object({
      name: z.string(),
      nickname: z.string().nullable(),
      bio: z.string().optional(),
    }),
  }),
);

store3.setRow('users', 'alice', {name: 'Alice', nickname: null});
console.log(store3.getRow('users', 'alice'));
// -> {name: 'Alice', nickname: null}
```

In this example, `nickname` can be set to `null` because it's marked as
nullable. The `bio` field is optional, so it doesn't need to be provided (and
TinyBase will not add a default for it since none was specified in the Zod
schema).

## Unsupported Types

The Zod schematizer only converts basic types (string, number, boolean) and
ignores complex types like arrays, objects, and records. These will simply be
excluded from the resulting TinyBase schema:

```js
const store4 = createStore().setTablesSchema(
  schematizer.toTablesSchema({
    pets: z.object({
      species: z.string(),
      tags: z.array(z.string()), // ignored
      metadata: z.record(z.string()), // ignored
    }),
  }),
);

store4.setRow('pets', 'fido', {species: 'dog', tags: ['friendly']});
console.log(store4.getRow('pets', 'fido'));
// -> {species: 'dog'}
```

## Reusing The Schematizer

You can create a schematizer once and reuse it for multiple conversions:

```js
const schematizer2 = createZodSchematizer();

const tablesSchema = schematizer2.toTablesSchema({
  pets: z.object({
    species: z.string(),
    age: z.number(),
  }),
  stores: z.object({
    name: z.string(),
    city: z.string(),
  }),
});

const valuesSchema = schematizer2.toValuesSchema({
  openStores: z.number().default(0),
  corporateName: z.string().default('Pet Store Inc'),
});

const store5 = createStore().setSchema(tablesSchema, valuesSchema);

store5.setRow('stores', 'downtown', {name: 'Downtown Pets', city: 'Boston'});
console.log(store5.getRow('stores', 'downtown'));
// -> {name: 'Downtown Pets', city: 'Boston'}

console.log(store5.getValues());
// -> {openStores: 0, corporateName: 'Pet Store Inc'}
```

## Summary

Schematizers provide a bridge between popular schema validation libraries and
TinyBase's schema system. They perform best-effort conversions, allowing you to
reuse existing schema definitions while benefiting from TinyBase's runtime
validation and defaults.

TinyBase currently provides schematizers for Zod and TypeBox, with support for
additional libraries coming in future releases.

Now that you can define and convert schemas, let's learn how to save and load
Store data. For that we proceed to the Persistence guides.
