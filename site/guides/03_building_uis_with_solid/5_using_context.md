# Using Context

The ui-solid module includes a Provider component that lets you avoid passing
global objects down through your component hierarchy.

Passing the `store` object to every primitive or component gets repetitive in
larger applications. The Provider component sets a context that all descendant
primitives and components use automatically when no explicit reference is
given:

```tsx ignore
import {render} from 'solid-js/web';
import {createStore} from 'tinybase';
import {CellView, Provider, useCell, useCreateStore} from 'tinybase/ui-solid';

const Pane = () =>
  [
    CellView({tableId: 'pets', rowId: 'fido', cellId: 'species'}),
    ',',
    useCell('pets', 'fido', 'color')(),
  ].join('');

const App = () => {
  const store = useCreateStore(() =>
    createStore().setTables({
      pets: {fido: {species: 'dog', color: 'brown'}},
    }),
  );

  return (
    <Provider store={store()}>
      <Pane />
    </Provider>
  );
};

const app = document.createElement('div');
const dispose = render(App, app);
console.log(app.innerHTML);
// -> 'dog,brown'
dispose();
```

The `store` variable is not referenced in the child `Pane` component. The
CellView component and useCell primitive both resolve it from the nearest
Provider.

## Context With Multiple Objects

`Provider` accepts `store`, `storesById`, `metrics`, `metricsById`, and
equivalent props for every TinyBase object type. When multiple stores are
provided, primitives and components reference them by Id:

```tsx ignore
const petStore = createStore().setTables({
  pets: {fido: {species: 'dog'}},
});
const planetStore = createStore().setTables({
  planets: {mars: {moons: 2}},
});

const Pane2 = () =>
  [
    CellView({tableId: 'pets', rowId: 'fido', cellId: 'species', store: 'pet'}),
    ',',
    useCell('planets', 'mars', 'moons', 'planet')(),
  ].join('');

const App2 = () => (
  <Provider storesById={{pet: petStore, planet: planetStore}}>
    <Pane2 />
  </Provider>
);

const app2 = document.createElement('div');
const dispose2 = render(App2, app2);
console.log(app2.innerHTML);
// -> 'dog,2'
dispose2();
```

Descendant components can register additional objects into the nearest Provider
context at runtime using the useProvideStore primitive, the useProvideMetrics
primitive, and similar helpers for the other TinyBase object types.

## Nesting Context

Provider components can also be nested. Their contexts merge in the same spirit
as the other UI module Providers, so outer defaults and named
objects remain visible unless a nearer Provider replaces them.

This makes it practical to keep app-wide objects at the top of the tree while
injecting route-local or feature-local TinyBase objects deeper in the UI.

## Summary

The ui-solid module is part of the React, Solid, and Svelte UI family. It favors
Accessor-returning primitives, Solid components, and Provider-based context.

Next we move on to Svelte-specific UI patterns in the
[Building UIs With Svelte](/guides/building-uis-with-svelte/) guides.
