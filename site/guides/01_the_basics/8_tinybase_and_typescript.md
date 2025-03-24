# TinyBase And TypeScript

This guide summarizes the two different levels of TypeScript coverage you can
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

## Summary

TinyBase provides different levels of typed support for your data, depending on
how prescriptive you want it to be and your personal preferences.

Next we will run through some of the many ways you can build your app around
TinyBase in the Architectural Options guide.
