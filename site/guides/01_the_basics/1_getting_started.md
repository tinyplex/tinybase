# Getting Started

This guide gets you up and running quickly with TinyBase.

It is not intended to be a detailed introduction to installing JavaScript build-
and run-time environments! It assumes that you have (or know how to have) a
browser or Node-based development environment.

Note that TinyBase requires a reasonably modern environment, as it makes
extensive use of contemporary JavaScript features. A regularly-updated browser
and Node 16 (or above) are recommended. If you find you need older
compatibility, there are additional transpilations in the `es6` folder of the
distribution.

Let's go!

## TinyBase from a template

The easiest way to get started with TinyBase from scratch is to use a tool
called `create-tinybase` to build simple demo apps on your local machine. Simply
run the following command to get started:

```bash
npm create tinybase@latest
```

This tool provides the following templates to get started with:

- Todos: a simple todo list app with support for adding, editing, and deleting
  tasks.
- Chat: a real-time chat app with support for multiple rooms and message
  history.
- Drawing: a collaborative drawing app with support for multiple users and
  real-time updates.
- Tic-tac-toe: a turn-based tic-tac-toe game with computed game state and win
  detection.

You can also configure these templates with different options, such as using
TypeScript or JavaScript, adding persistence with SQLite or PGlite, and enabling
synchronization with a remote server or Durable Objects.

Check out the [create-tinybase
documentation](https://github.com/tinyplex/create-tinybase) for more details.

## TinyBase in a browser

Another simple way to get started with TinyBase is to include it from a CDN in a
web page. Create a file called `index.html`, for example:

```html
<html>
  <head>
    <title>My First TinyBase App</title>
    <script type="importmap">
      {"imports": {"tinybase": "https://esm.sh/tinybase@"}}
    </script>
    <script type="module">
      import {createStore} from 'tinybase';

      addEventListener('load', () => {
        const store = createStore();
        store.setValue('v1', 'Hello');
        store.setCell('t1', 'r1', 'c1', 'World');

        document.body.innerHTML =
          store.getValue('v1') + ' ' + store.getCell('t1', 'r1', 'c1');
      });
    </script>
  </head>
  <body />
</html>
```

Open this file in your browser and you should see the words 'Hello World' on the
screen, each having been written to, and read from, a Store.

Note that the TinyBase module is pulled in from esm.sh, and the `importmap`
allows you to use a regular import statement in the main script section.

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
store.setValue('v1', 'Hello');
store.setCell('t1', 'r1', 'c1', 'World');
console.log(store.getValue('v1') + ' ' + store.getCell('t1', 'r1', 'c1'));
```

Run this module script with:

```bash
node index.mjs
```

Again, you will see the words 'Hello World' on the screen, having each been
written to, and read from, a Store.

If that all worked, you are set up and ready to learn more about TinyBase! From
here on, we will mostly show Node-based code snippets, but most should be easily
translatable to run in a browser too.

Before we move on, you should be aware that the overall package includes a
number of different versions of TinyBase, transpiled for different targets and
formats. You may want to take a look at the Importing TinyBase guide if the code
above isn't working in your environment - React Native in particular.

Let's move onto the Creating A Store guide.
