# Using Context

The ui-react module includes a context provider that lets you avoid passing
global objects down through your component hierarchy.

One thing you may have noticed (especially with the hooks) is how we've had to
reference the global Store object within components (or potentially drill it
through the hierarchy with props). It's very likely that your whole app (or
parts of it) will use the same Store throughout, though.

To help with this, the Provider component lets you specify a Store that all the
hooks and components will bind to automatically. Simply provide the Store in
the `store` prop, and it will be used by default. Notice how the `store`
variable is not referenced in the child `Pane` component here, for example:

```jsx
import {CellView, Provider, useCell, useCreateStore} from 'tinybase/ui-react';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'tinybase';

const App = () => {
  const store = useCreateStore(() =>
    createStore().setTables({pets: {fido: {species: 'dog', color: 'brown'}}}),
  );

  return (
    <Provider store={store}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <CellView tableId="pets" rowId="fido" cellId="species" />,
    {useCell('pets', 'fido', 'color')}
  </span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>dog,brown</span>'
```

Obviously this requires your components to be used in a context where you know
the right sort of Store will be available.

## Context With Multiple Stores

In cases where you want to have multiple Store objects available to an
application, the Provider component takes a `storesById` prop that is an object
keyed by Id. Your hooks and components use the Id to indicate which they want to
use:

```jsx
const App2 = () => {
  const petStore = useCreateStore(() =>
    createStore().setTables({pets: {fido: {species: 'dog'}}}),
  );
  const planetStore = useCreateStore(() =>
    createStore().setTables({planets: {mars: {moons: 2}}}),
  );

  return (
    <Provider storesById={{pet: petStore, planet: planetStore}}>
      <Pane2 />
    </Provider>
  );
};

const Pane2 = () => (
  <span>
    <CellView tableId="pets" rowId="fido" cellId="species" store="pet" />,
    {useCell('planets', 'mars', 'moons', 'planet')}
  </span>
);

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span>dog,2</span>'
```

## Nesting Context

Provider components can be nested and the contexts are merged. This last example
is a little verbose, but shows how two Store objects each keyed with a different
Id are both visible, despite having been set in two different Provider
components:

```jsx
const App3 = () => {
  const petStore = useCreateStore(() =>
    createStore().setTables({pets: {fido: {species: 'dog'}}}),
  );

  return (
    <Provider storesById={{pet: petStore}}>
      <OuterPane />
    </Provider>
  );
};

const OuterPane = () => {
  const planetStore = useCreateStore(() =>
    createStore().setTables({planets: {mars: {moons: 2}}}),
  );
  return (
    <Provider store={planetStore}>
      <InnerPane />
    </Provider>
  );
};

const InnerPane = () => (
  <span>
    <CellView tableId="pets" rowId="fido" cellId="species" store="pet" />,
    {useCell('planets', 'mars', 'moons')}
  </span>
);

root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<span>dog,2</span>'
```

## Summary

We have covered the main parts of the ui-react module, including its hooks and
components, and the way it supports context to make Store objects available.

Next we talk about how a Store can have a TablesSchema and can be persisted.
Let's move onto the Schemas guide to find out more.
