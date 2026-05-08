# Hello World (React)

![Hello World (React)](/shots/hello-world-react-demo.png)

In this demo, we use React to render data in the Store object and then change a
Cell to see the display update.

First, since we're running this in a browser, we register some import aliases
for `esm.sh`:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@",
      "tinybase/ui-react": "https://esm.sh/tinybase/ui-react@",
      "tinybase/ui-react-inspector": "https://esm.sh/tinybase/ui-react-inspector@",
      "react": "https://esm.sh/react@",
      "react/jsx-runtime": "https://esm.sh/react/jsx-runtime@",
      "react-dom/client": "https://esm.sh/react-dom/client@"
    }
  }
</script>
```

In addition to the TinyBase module, we pull in React, ReactDOM, and the
TinyBase React modules:

```jsx
import {createStore} from 'tinybase';
import {CellView, Provider} from 'tinybase/ui-react';
import {Inspector} from 'tinybase/ui-react-inspector';
import {createRoot} from 'react-dom/client';
import React from 'react';

const store = createStore();
const LOGOS = [
  ['https://tinybase.org/favicon.svg', 'TinyBase logo'],
  ['https://tinybase.org/react.svg', 'React logo'],
];

const setTime = () => {
  store.setCell('t1', 'r1', 'c1', new Date().toLocaleTimeString());
};
setTime();

createRoot(document.body).render(
  <Provider store={store}>
    <div id="app">
      <div id="logos">
        {LOGOS.map(([src, alt]) => (
          <img key={alt} src={src} alt={alt} />
        ))}
      </div>
      <div id="value">
        <CellView tableId="t1" rowId="r1" cellId="c1" />
      </div>
    </div>
    <Inspector />
  </Provider>,
);

setInterval(setTime, 1000);
```

The `CellView` component takes care of the CellListener for us and re-renders
every time the time changes. We also add a compact row of TinyBase and React
logos above the value so the demo looks a little more like a React example.
Since we're using React, we can also include the Inspector component so you can
see how the data is structured. Simply click the TinyBase logo in the corner.

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

Next, we will render that same live-updating Cell with Solid. Please continue
to the Hello World (Solid) demo.
