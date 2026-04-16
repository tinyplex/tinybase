# Hello World (Vanilla)

![Hello World (Vanilla)](/shots/hello-world-vanilla-demo.png)

In this demo, we set data in, and then get data from, a Store object. We're
using keyed values (not even tabular data!), so this is about as simple as it
gets.

First, since we're running this in a browser, we register some import aliases
for `esm.sh`:

```html
<script type="importmap">
  {
    "imports": {
      "tinybase": "https://esm.sh/tinybase@"
    }
  }
</script>
```

We import the createStore function, create the Store object with it:

```js
import {createStore} from 'tinybase';

const store = createStore();
```

We set the string 'Hello World' as a Value in the Store object. We give it a
Value Id of `v1`:

```js
store.setValue('v1', 'Hello World');
```

Finally, we get the value back out again, render it into the page, and add a
small TinyBase logo above it:

```js
const renderValue = (value) => {
  document.body.innerHTML = `
    <div id="app">
      <div id="logos">
        <img
          src="https://tinybase.org/favicon.svg"
          alt="TinyBase logo"
        />
      </div>
      <div id="value">${value}</div>
    </div>
  `;
};

renderValue(store.getValue('v1'));
```

Add a little styling, and we're done!

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

And we're done! You now know the basics of setting and getting TinyBase data.

Next, we will see how we could have done that using a tabular data structure.
Please continue to the Hello World (Vanilla) v2 demo.
