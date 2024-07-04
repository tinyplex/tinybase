# Schema-Based Typing

You can use type definitions that infer API types from the schemas you apply,
providing a powerful way to improve your developer experience when you know the
shape of the data being stored.

The schema-based definitions can be accessed by adding the `with-schemas` suffix
to your imports. For example:

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

In this example, the store is known to have the ValuesSchema provided, and all
relevant methods will have type constraints accordingly, even for listeners:

```ts yolo
store.addValueListener(null, (store, valueId, newValue, oldValue) => {
  valueId == 'employees'; // OK
  valueId == 'open'; //      OK
  valueId == 'website'; //   TypeScript error

  if (valueId == 'employees') {
    newValue as number; //   OK
    oldValue as number; //   OK
    newValue as boolean; //  TypeScript error
    oldValue as boolean; //  TypeScript error
  }
  if (valueId == 'open') {
    newValue as boolean; //  OK
    oldValue as boolean; //  OK
  }
});
```

## Getting the Typed Store

Only the setSchema method, setTablesSchema method, and setValuesSchema method
return a typed Store object. So, to benefit from the typing, ensure you assign
your Store variable to what those methods return, rather than just the
createStore function.

For example, the following will work at runtime, but you will _not_ benefit from
the developer experience of typing on the `store` variable as we did in the
example above.

```ts yolo
import {createStore} from 'tinybase/with-schemas';

const store = createStore(); // This is not a schema-typed Store

store.setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
}); // Instead you should use the return type from this method
```

One further thing to be aware of is that for the typing to work effectively, the
schema must be passed in directly, or, if it is a variable, as a constant:

```ts yolo
const valuesSchema = {
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
} as const; // NB the `as const` modifier
store.setValuesSchema(valuesSchema);
```

It's worth noting that typing will adapt according to schemas being added,
removed, or changed:

```ts yolo
const tablesSchema = {
  pets: {species: {type: 'string'}},
} as const;

const valuesSchema = {
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
} as const;

const store = createStore();
const storeWithBothSchemas = store.setSchema(tablesSchema, valuesSchema);
const storeWithJustValuesSchema = storeWithBothSchemas.delTablesSchema();
const storeWithValuesAndNewTablesSchema = storeWithBothSchemas.setTablesSchema({
  pets: {
    species: {type: 'string'},
    sold: {type: 'boolean', default: false},
  },
});
```

## Typing The ui-react Module

Schema-based typing for the ui-react module is handled a little differently, due
to the fact that all of the hooks and components are top level functions in the
module. It would be frustrating to apply a schema to type each and every one in
turn.

Instead, you can use the `WithSchemas` type (which takes the `typeof` the
schemas), and the following pattern after your import. This applies the schema
types to the whole module en masse, and then you can select the hooks and
components you want to use:

```tsx yolo
import * as UiReact from 'tinybase/ui-react/with-schemas';
import React from 'react';
import {createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  pets: {species: {type: 'string'}},
} as const;
const valuesSchema = {
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
} as const;

// Cast the whole module to be schema-based with WithSchemas:
const UiReactWithSchemas = UiReact as UiReact.WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;
// Deconstruct to access the hooks and components you need:
const {TableView, useTable, ValueView} = UiReactWithSchemas;

const store = createStore().setSchema(tablesSchema, valuesSchema);
const App = () => (
  <div>
    <TableView store={store} tableId="species" /> {/*   OK               */}
    <TableView store={store} tableId="customers" /> {/* TypeScript error */}
    {/* ... */}
  </div>
);
```

Note that in React Native, the resolution of modules and types isn't yet quite
compatible with Node and TypeScript. You may need to try something like the
following to explicitly load code and types from different folders:

```tsx yolo
import * as UiReact from 'tinybase/ui-react'; // code
import React from 'react';
import type {WithSchemas} from 'tinybase/ui-react/with-schemas'; // types
import {createStore, TablesSchema, ValuesSchema} from 'tinybase/with-schemas';

const tablesSchema = {
  pets: {species: {type: 'string'}},
} as const;
const valuesSchema = {
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
} as const;

const UiReactWithSchemas = UiReact as unknown as WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;

//...
```

## Multiple Stores

In the case that you have multiple Store objects with different schemas, you
will need to use `WithSchemas` several times, and deconstruct each, something
like this:

```tsx yolo
const UiReactWithPetShopSchemas = UiReact as UiReact.WithSchemas<
  [typeof petShopTablesSchema, typeof petShopValuesSchema]
>;
const {
  TableView: PetShopTableView,
  useTable: usePetShopTable,
  ValueView: usePetShopValueView,
} = UiReactWithPetShopSchemas;

const UiReactWithSettingsSchemas = UiReact as UiReact.WithSchemas<
  [typeof settingsTablesSchema, typeof settingsValuesSchema]
>;
const {
  TableView: SettingsTableView,
  useTable: useSettingsTable,
  ValueView: useSettingsValueView,
} = UiReactWithSettingsSchemas;

const petShopStore = createStore().setSchema(
  petShopTablesSchema,
  petShopValuesSchema,
);
const settingsStore = createStore().setSchema(
  settingsTablesSchema,
  settingsValuesSchema,
);
const App = () => (
  <div>
    <PetShopTableView store={petShopStore} tableId="species" />
    <SettingsTableView store={settingsStore} tableId="viewSettings" />
    {/* ... */}
  </div>
);
```

## Summary

Schema-based typing provides a powerful developer-time experience for checking
your code and autocompletion in your IDE. Remember to use the `with-schema`
suffix on the import path and use the patterns described above.

We move on to discussing more complex programmatic enforcement of your data, and
for that we turn to the Mutating Data With Listeners guide.
