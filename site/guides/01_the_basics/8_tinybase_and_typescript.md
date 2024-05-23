# TinyBase and TypeScript

This guide summarizes the three different levels of TypeScript coverage you can
use with TinyBase.

## 1. Basic Type Support

Out of the box, TinyBase has complete type coverage for all of its modules. So
for example, setting and getting tabular and key-value data will obey the
system's constraints. A Cell or a Value can only be a number, string, or
boolean, for example:

```ts yolo
import {createStore} from 'tinybase';

const store = createStore();

store.setValues({employees: 3}); //                OK
store.setValues({employees: true}); //             OK
store.setValues({employees: ['Alice', 'Bob']}); // TypeScript error
```

This basic typing of the API is comprehensively described throughout in the API
documentation.

## 2. Schema-based Typing

The next step up is when you provide a schema for your TinyBase data. This more
tightly constrains the types of Table, Cell, and Value that your Store can
contain.

Since v3.1, TinyBase can provide typing that adapts according to the schema when
you import the `with-schemas` version of the library. For example:

```ts yolo
import {createStore} from 'tinybase/with-schemas'; // NB the 'with-schemas'

const store = createStore().setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
});

store.setValues({employees: 3}); //                      OK
store.setValues({employees: true}); //                   TypeScript error
store.setValues({employees: 3, website: 'pets.com'}); // TypeScript error
```

(The separate import is provided because the schema-based autocomplete and
errors can be fairly verbose and confusing when you only need the basic type
support.)

Read more about this technique in the Schema-Based Typing guide.

## 3. ORM-like type definitions

If you prefer a more descriptive way to manage your API, you can build
definitions from a schema ahead of time, in an ORM-like fashion. In this
example, a schema is inferred from the data, and TypeScript (`.d.ts`)
definitions and (`.ts`) implementations are emitted that you can check in to
your application's code base:

```js
import {createTools} from 'tinybase/tools';

const store = createStore().setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const tools = createTools(store);
const [dTs, ts, uiReactDTs, uiReactTsx] = tools.getStoreApi('shop');
```

This will produce a file containing the types for your wrapped Store, for
example, which are all typed according to the schema:

```ts yolo
//...
/**
 * Represents the 'pets' Table.
 */
export type PetsTable = {[rowId: Id]: PetsRow};

/**
 * Represents a Row when getting the content of the 'pets' Table.
 */
export type PetsRow = {species: string};
//...
```

Read more about this approach in the Generating APIs guide.

## Summary

TinyBase provides different levels of typed support for your data, depending on
how prescriptive you want it to be and your personal preferences.

Next we will show how you can quickly build user interfaces on top of a Store,
and for that, it's time to proceed to the Building UIs guide.
