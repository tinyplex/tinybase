# Schema-Based Typing

You can use type definitions that infer API types from the schemas you apply,
providing a powerful way to improve your developer experience when you know the
shape of the data being stored.

The schema-based definitions can be accessed by adding the `with-schemas` suffix
to your imports. For example:

```ts yolo
import {createStore} from 'tinybase/with-schemas';

// NB the 'with-schemas'

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
import React from 'react';
import * as UiReact from 'tinybase/ui-react/with-schemas';
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
// code
import React from 'react';
import * as UiReact from 'tinybase/ui-react';
import type {WithSchemas} from 'tinybase/ui-react/with-schemas';
// types
import {TablesSchema, ValuesSchema, createStore} from 'tinybase/with-schemas';

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

## Defining Schema-Based Stores in React Components

One final pattern to be aware of is that you can use the `WithSchemas` type to
create a schema-based Store in a non-rendering React component. This allows you
to create a Store with a schema, define its persistence behavior, publish it
into the context, and even expose domain-specific hooks - all in a single
self-contained file.

There are good examples of this in the [TinyHub](https://tinyhub.org/) project
(see the store components [this
folder](https://github.com/tinyplex/tinyhub/tree/main/client/src/stores)).

If you want to use this pattern your app's top-level will look something like this:

```tsx yolo
export const App = () => {
  return (
    <Provider>
      <MyStore /> {/* This is a schema-based Store component */}
      <ActualApp /> {/* This is the actual rendered app */}
    </Provider>
  );
};
```

The `MyStore` component renders `null` so it doesn't appear visually, but it is
responsible for creating the Store and making it available to the rest of the
app via the Provider context that wraps them both.

The `MyStore.tsx` file might look something like this. (In this simplified case,
we are just typing key values in our Store but of course this would work for a
tabular Store too.)

```tsx yolo
// A unique Id for this Store.
const STORE_ID = 'myStore';

// The schema for this Store.
const VALUES_SCHEMA = {
  myStringValue: {type: 'string', default: 'foo'},
  myNumericValue: {type: 'number', default: 42},
} as const;
type Schemas = [NoTablesSchema, typeof VALUES_SCHEMA];

// Destructure the ui-react module with the schema applied.
const {useCreateStore, useProvideStore, useCreatePersister, useValue} =
  UiReact as UiReact.WithSchemas<Schemas>;

export const MyStore = () => {
  // Create the Store and set its schema
  const myStore = useCreateStore(() =>
    createStore().setValuesSchema(VALUES_SCHEMA),
  );

  // Create a local storage persister for the Store and start it
  useCreatePersister(
    settingsStore,
    (settingsStore) => createLocalPersister(settingsStore, STORE_ID),
    [],
    async (persister) => {
      await persister.startAutoLoad();
      await persister.startAutoSave();
    },
  );

  // Provide the Store for the rest of the app.
  useProvideStore(STORE_ID, settingsStore);

  // Don't render anything.
  return null;
};
```

In that same file, you can also define domain-specific hooks that use an expose
the schema. For example, this hook will be typed to return a string if passed
'myStringValue', and a number if passed 'myNumericValue'.

```tsx yolo
type ValueIds = keyof typeof VALUES_SCHEMA;
export const useSettingsValue = <ValueId extends ValueIds>(valueId: ValueId) =>
  useValue<ValueId>(valueId, STORE_ID);
```

This means that the rest of the app can use Values from the Store with correct
types, _and_ the implementation details of the Store are encapsulated in the
single file. For more complex applications, it really helps to keep everything
about the Store in one place.

## Summary

Schema-based typing provides a powerful developer-time experience for checking
your code and autocompletion in your IDE. Remember to use the `with-schema`
suffix on the import path and use the patterns described above.

We move on to discussing more complex programmatic enforcement of your data, and
for that we turn to the Mutating Data With Listeners guide.
