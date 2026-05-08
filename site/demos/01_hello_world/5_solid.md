# Hello World (Solid)

![Hello World (Solid)](/shots/hello-world-solid-demo.png)

In this demo, we use Solid to render data in the Store object and then change
the Cell to see the display update.

First, since we're running this in a browser, we register some import aliases
for `esm.sh`:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-solid": "https://esm.sh/tinybase/ui-solid@",
      "solid-js": "https://esm.sh/solid-js@",
      "solid-js/web": "https://esm.sh/solid-js/web@"
    }
  }
</script>
```

In addition to the TinyBase module, we pull in Solid and the TinyBase Solid
module:

```jsx
import {render} from 'solid-js/web';
import {createStore} from 'tinybase';
import {CellView, Provider} from 'tinybase/ui-solid';

const store = createStore();
const LOGOS = [
  ['https://tinybase.org/favicon.svg', 'TinyBase logo'],
  ['https://tinybase.org/solid.svg', 'Solid logo'],
];

const setTime = () => {
  store.setCell('t1', 'r1', 'c1', new Date().toLocaleTimeString());
};
setTime();

render(
  () => (
    <Provider store={store}>
      <div id="app">
        <div id="logos">
          {LOGOS.map(([src, alt]) => (
            <img src={src} alt={alt} />
          ))}
        </div>
        <div id="value">
          <CellView tableId="t1" rowId="r1" cellId="c1" />
        </div>
      </div>
    </Provider>
  ),
  document.body,
);

setInterval(setTime, 1000);
```

The `CellView` component takes care of the CellListener for us and updates
every time the time changes. We also add a compact row of TinyBase and Solid
logos above the value so the demo looks a little more like a Solid example.

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

Next, we will render that same live-updating Cell with Svelte. Please continue
to the Hello World (Svelte) demo.
