# <EditableValueView /> (Svelte)

In this demo, we showcase the EditableValueView component, which allows you to
edit Values in a Store from a Svelte-based web UI.

## Initialization

The import map is the same as the previous demos:

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

The entry point creates a Store with a few Values and mounts the app:

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

The app renders an editable Values table and a standalone editor for one Value:

```svelte file=src/App.svelte
<script>
  import {Provider} from 'tinybase/ui-svelte';
  import {EditableValueView, ValuesInHtmlTable} from 'tinybase/ui-svelte-dom';

  let {store} = $props();
</script>

<Provider {store}>
  <ValuesInHtmlTable editable={true} />
  <div id="edit">
    Username:
    <EditableValueView valueId="username" />
  </div>
</Provider>
```

And here is a little styling for the editor panel and invalid JSON state:

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

#edit {
  background: white;
  box-shadow: 0 0 1rem #0004;
  margin: 2rem;
  min-width: 16rem;
  padding: 0.5rem 1rem 1rem;
}

.editableValue button {
  margin-right: 0.5rem;
  width: 4rem;
}

input.invalid {
  background: #fdd;
}
```

There is a matching component for Cells too, which we cover next in the
[<EditableCellView /> (Svelte)](/demos/ui-components-svelte/editablecellview-svelte/)
demo.
