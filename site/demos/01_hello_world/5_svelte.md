# Hello World (Svelte)

![Hello World (Svelte)](/shots/hello-world-svelte-demo.png)

In this demo, we use Svelte to render data in the Store object and then change
the Cell to see the display update.

First, since we're running this in a browser, we register some import aliases
for `esm.sh`:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-svelte": "https://esm.sh/tinybase@/ui-svelte",
      "tinybase/ui-svelte-inspector": "https://esm.sh/tinybase@/ui-svelte-inspector",
      "svelte": "https://esm.sh/svelte@"
    }
  }
</script>
```

The main entry point creates the Store, updates the time every second, and
mounts a Svelte component:

```js
import {createStore} from 'tinybase';
import {mount} from 'svelte';
import App from './App.svelte';

const store = createStore();

const setTime = () => {
  store.setCell('t1', 'r1', 'c1', new Date().toLocaleTimeString());
};
setTime();

mount(App, {target: document.body, props: {store}});

setInterval(setTime, 1000);
```

The Svelte component uses the Provider and CellView components from the
ui-svelte module:

```svelte file=src/App.svelte
<script>
  import {CellView, Provider} from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';

  let {store} = $props();
</script>

<Provider {store}>
  <CellView tableId="t1" rowId="r1" cellId="c1" />
  <Inspector />
</Provider>
```

Like the React version, this demo can also include the Inspector component so
you can see how the data is structured. Simply click the TinyBase logo in the
corner.

Some final CSS...

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

body {
  align-items: center;
  display: flex;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  height: 100vh;
  justify-content: center;
  margin: 0;
}
```

...and we're done!
