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
ui-svelte module, and adds a compact row of TinyBase and Svelte logos above the
live value:

```svelte file=src/App.svelte
<script>
  import {CellView, Provider} from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';

  let {store} = $props();
  const logos = [
    ['https://tinybase.org/favicon.svg', 'TinyBase logo'],
    ['https://tinybase.org/svelte.svg', 'Svelte logo'],
  ];
</script>

<Provider {store}>
  <div id="app">
    <div id="logos">
      {#each logos as [src, alt]}
        <img {src} {alt} />
      {/each}
    </div>
    <div id="value">
      <CellView tableId="t1" rowId="r1" cellId="c1" />
    </div>
  </div>
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
  background: #f8f8fa;
  align-items: center;
  display: flex;
  font-family: Inter, sans-serif;
  height: 100vh;
  justify-content: center;
  margin: 0;
}

#app {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

#logos {
  display: flex;
  gap: 0.5rem;
}

#logos img {
  height: 2rem;
  width: 2rem;
}

#value {
  color: #1d1d24;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.04rem;
}
```

...and we're done!
