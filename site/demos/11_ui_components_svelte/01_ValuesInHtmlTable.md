# <ValuesInHtmlTable /> (Svelte)

![ValuesInHtmlTable](/shots/valuesinhtmltable-svelte-demo.png)

In this first demo, we set up a Store containing some sample data, and showcase
the ValuesInHtmlTable component from the ui-svelte-dom module.

## Boilerplate

First, we create the import aliases for TinyBase, the Svelte runtime, and the
ui-svelte and ui-svelte-dom modules:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-svelte": "https://esm.sh/tinybase@/ui-svelte",
      "tinybase/ui-svelte-dom": "https://esm.sh/tinybase@/ui-svelte-dom",
      "svelte": "https://esm.sh/svelte@"
    }
  }
</script>
```

The main entry point creates a Store, loads some sample values, and mounts a
Svelte component:

```js
import {createStore} from 'tinybase';
import {mount} from 'svelte';
import App from './App.svelte';

const store = createStore()
  .setValue('username', 'John Appleseed')
  .setValue('email address', 'john.appleseed@example.com')
  .setValue('dark mode', true)
  .setValue('font size', 14);

mount(App, {target: document.body, props: {store}});
```

The Svelte component exposes the Store with a Provider and renders two HTML
tables:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {ValuesInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store} = $props();
</script>

<Provider {store}>
  <ValuesInHtmlTable />
  <ValuesInHtmlTable headerRow={false} idColumn={false} />
</Provider>
```

## Styling

As with the React DOM components, the rendered HTML is intentionally plain, so
we add some light styling:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  align-items: flex-start;
  color: #333;
  display: flex;
  font-family: Inter, sans-serif;
  font-size: 0.8rem;
  justify-content: space-around;
  letter-spacing: -0.04rem;
  line-height: 1.5rem;
  margin: 0;
  min-height: 100vh;
  user-select: none;
}

table {
  background: white;
  border-collapse: collapse;
  box-shadow: 0 0 1rem #0004;
  font-size: inherit;
  line-height: inherit;
  margin: 2rem;
  table-layout: fixed;
  th,
  td {
    border-color: #eee;
    border-style: solid;
    border-width: 1px 0;
    overflow: hidden;
    padding: 0.25rem 0.5rem;
    text-align: left;
    white-space: nowrap;
  }
  thead th {
    border-bottom-color: #ccc;
  }
  button,
  input {
    border: 1px solid #ccc;
  }
}
```

And that's it. The first table shows the default header and Id column, and the
second hides them.

Next we move on to the
[<TableInHtmlTable /> (Svelte)](/demos/ui-components-svelte/tableinhtmltable-svelte/)
demo.
