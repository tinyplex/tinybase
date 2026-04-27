# Getting Started With ui-svelte

To build Svelte-based user interfaces with TinyBase, you will need to install
the ui-svelte module in addition to the main module, and, of course, Svelte
itself.

If you want to see the same pattern in a runnable site demo, take a look at the
Hello World (Svelte) demo.

For a fuller example using indexes and persistence, see the Countries (Svelte)
demo.

In a Svelte component, you can get started with code like this:

```svelte
<script>
  import {createStore} from 'tinybase';
  import {CellView} from 'tinybase/ui-svelte';

  const store = createStore();
  store.setCell('t1', 'r1', 'c1', 'Hello World');
</script>

<CellView tableId="t1" rowId="r1" cellId="c1" {store} />
```

When this component renders, you will see the words 'Hello World' on the
screen, having been written to, and read from, a Store, and then rendered by the
CellView component from the ui-svelte module.

The ui-svelte module is designed around Svelte 5's reactive runtime and
component model. Instead of React-style hooks, it exposes reactive functions,
listener functions, and view components that integrate directly with Svelte.

Let's move on to understand how the reactive functions work in the ui-svelte
module, with the Using Reactive Functions guide.
