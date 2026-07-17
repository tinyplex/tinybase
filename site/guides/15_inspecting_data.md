# Inspecting Data

If you are using TinyBase in a web application with React, Solid, or Svelte, you
can use its web-based inspector, the Inspector component, to reason about the
data during development.

![Inspector](/inspector.webp 'Inspector')

(NB: Previous to v5.0, this component was called `StoreInspector`.)

## Usage

The component is available in the ui-react-inspector module, the
ui-solid-inspector module, and the ui-svelte-inspector module. In each case, add
the component inside a Provider component that is providing the Store context
for the app that you want to inspect.

The Solid and Svelte inspector modules are client-only: their package exports
are available under the `browser` condition, and they do not support server-side
rendering.

With React, the boilerplate will look something like this:

```jsx ignore
import {createStore} from 'tinybase';
import {Provider, useCreateStore} from 'tinybase/ui-react';
import {Inspector} from 'tinybase/ui-react-inspector';

const App = () => (
  <Provider store={useCreateStore(createStore)}>
    <Body />
  </Provider>
);

const Body = () => {
  return (
    <>
      <h1>My app</h1>
      {/* ... */}
      <Inspector />
    </>
  );
};

addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

For Solid, the pattern is the same:

```jsx ignore
import {render} from 'solid-js/web';
import {createStore} from 'tinybase';
import {Provider, useCreateStore} from 'tinybase/ui-solid';
import {Inspector} from 'tinybase/ui-solid-inspector';

const App = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog'},
    }),
  );

  return (
    <Provider store={store()}>
      <h1>My app</h1>
      <Inspector />
    </Provider>
  );
};

addEventListener('load', () => render(App, document.body));
```

With Svelte, the pattern is also the same:

```svelte
<script>
  import {createStore} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';

  const store = createStore().setTable('pets', {
    fido: {species: 'dog'},
  });
</script>

<Provider {store}>
  <h1>My app</h1>
  <Inspector />
</Provider>
```

## What Is In The Inspector?

The inspector appears at first as a nub in the corner of the screen containing
the TinyBase logo. Once clicked, it will open up to show a dark panel. You can
reposition this to dock to any side of the window, or expand to the full screen.

The inspector contains the following sections for whatever is available in the
Provider component context:

- Default Store: Values and a sortable view of each Table
- Each named Store: Values and a sortable view of each Table
- Default Indexes: each Row in each Slice of each Index
- Each named Indexes: each Row in each Slice of each Index
- Default Relationships: the pair of Tables in each Relationship
- Each named Relationships: the pair of Tables in each Relationship
- Default Queries: the pair of Tables in each Query
- Each named Queries: the pair of Tables in each Query

It is hoped that each section is quite self-explanatory. If not, please try it
out in the <Inspector /> (React) demo, the <Inspector /> (Solid) demo, or the
<Inspector /> (Svelte) demo, or indeed in most of the TinyBase demos themselves!
The Movie Database demo and Countries demo are quite good examples of the
inspector in use.

Note that, as of TinyBase v6.6, you can also create, duplicate, and delete
tables, rows, values, and cells - all directly within the Inspector.
