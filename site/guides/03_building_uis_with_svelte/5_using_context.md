# Using Context

The ui-svelte module includes a Provider component that lets you avoid passing
global objects down through your component hierarchy.

Passing the `store` object to every reactive function as the last argument gets
repetitive in larger applications. The Provider component sets a context that
all descendant functions use automatically when no explicit reference is given:

```svelte
<!-- App.svelte -->
<script>
  import {createStore} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import Pane from './Pane.svelte';

  const store = createStore().setTables({
    pets: {fido: {species: 'dog', color: 'brown'}},
  });
</script>

<Provider {store}>
  <Pane />
</Provider>
```

```svelte
<!-- Pane.svelte -->
<script>
  import {getCell} from 'tinybase/ui-svelte';

  // No store argument; resolved automatically from the nearest Provider
  const species = getCell('pets', 'fido', 'species');
  const color = getCell('pets', 'fido', 'color');
</script>

<p>{species.current} ({color.current})</p>
```

## Context With Multiple Objects

`Provider` accepts `store`, `storesById`, `metrics`, `metricsById`, and
equivalent props for every TinyBase object type. When multiple stores are
provided, functions reference them by Id:

```svelte
<script>
  import {getCell} from 'tinybase/ui-svelte';

  const color = getCell('pets', 'fido', 'color', 'petStore');
</script>
```

Descendant components can register additional objects into the nearest Provider
context at runtime using the provideStore function, the provideMetrics function,
and similar helpers for the other TinyBase object types.

## Nesting Context

Provider components can also be nested. Their contexts merge in the same spirit
as the ui-react module Provider, so outer defaults and named objects remain
visible unless a nearer Provider replaces them.

This makes it practical to keep app-wide objects at the top of the tree while
injecting route-local or feature-local TinyBase objects deeper in the UI.

## Summary

The ui-svelte module is the Svelte 5 counterpart to ui-react. It favors
reactive handles, named snippets, and Provider-based context over hooks and
component override props.

Next we move on to Solid-specific UI patterns in the
[Building UIs With Solid](/guides/building-uis-with-solid/) guides.
