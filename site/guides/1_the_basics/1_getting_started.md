# Getting Started

This guide gets up you up and running quickly with TinyBase.

It is not intended to be a detailed introduction to installing JavaScript build-
and run-time environments! It assumes that you have (or know how to have) a
browser or Node-based development environment.

Note that TinyBase requires a reasonably modern environment, as it makes
extensive use of contemporary JavaScript features. A regularly-updated browser
and Node 16 (or above) are recommended.

## TinyBase in a browser

One simple way to get started with TinyBase is to include it as a UMD script
from a CDN in a web page. Create a file called `index.html`, for example:

```html
<html>
  <head>
    <title>My First TinyBase App</title>
    <script src="https://unpkg.com/tinybase/lib/umd/tinybase.js"></script>
    <script>
      addEventListener('load', () => {
        const {createStore} = TinyBase;

        const store = createStore();
        store.setCell('t1', 'r1', 'c1', 'Hello World');
        document.body.innerHTML = store.getCell('t1', 'r1', 'c1');
      });
    </script>
  </head>
  <body />
</html>
```

Open this file in your browser and you should see the words 'Hello World' on the
screen, having been written to, and read from, a Store.

Note that the UMD script is pulled from NPM by the [unpkg](https://unpkg.com)
service. The script provides a global object from which you can destructure the
top-level functions of the API.

## TinyBase in a Node application

TinyBase is packaged on NPM, so you can easily install it as a dependency for
your application.

```bash
mkdir MyFirstTinyBaseApp
cd MyFirstTinyBaseApp
npm init -y
npm install tinybase
```

Create a file in this directory called `index.mjs`:

```js yolo
import {createStore} from 'tinybase';
const store = createStore();
store.setCell('t1', 'r1', 'c1', 'Hello World');
console.log(store.getCell('t1', 'r1', 'c1'));
```

Run this module script with:

```bash
node index.mjs
```

Again, you will see the words 'Hello World' on the screen, having been written
to, and read from, a Store.

If that all worked, you are set up and ready to learn more about TinyBase! From
here on, we will mostly show Node-based code snippets, but most should be easily
translatable to run in a browser too.

Let's move onto the Creating a Store guide.
