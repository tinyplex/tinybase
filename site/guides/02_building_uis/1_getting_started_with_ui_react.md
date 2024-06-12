# Getting Started With ui-react

To build React-based user interfaces with TinyBase, you will need to install the
ui-react module in addition to the main module, and, of course, React itself.

For example, in an HTML file, you can get started with boilerplate that might
look like this:

```html
<html>
  <head>
    <title>My First TinyBase App</title>
    <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/tinybase/dist/umd/min/index.js"></script>
    <script src="https://unpkg.com/tinybase/dist/umd/min/ui-react/index.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel">
      addEventListener('load', () => {
        const {createStore} = TinyBase;
        const {CellView} = TinyBaseUiReact;

        const store = createStore();
        store.setCell('t1', 'r1', 'c1', 'Hello World');
        ReactDOM.createRoot(document.body).render(
          <CellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
        );
      });
    </script>
  </head>
  <body />
</html>
```

It's important to ensure that the React module is imported before the ui-react
module.

Open this file in your browser and you should see the words 'Hello World' on the
screen, having been written to, and read from, a Store, and then rendered by the
CellView component from the ui-react module.

Note that the standalone `babel` script and `text/babel` type on the script here
are merely to support JSX in the browser and for the purposes of illustrating
how to get started quickly. In a production environment you should pre-compile
and your JSX and modules to create a bundled browser app.

If you're bundling the whole app, you can of course import the ui-react module
something like this:

```js yolo
import {createStore} from 'tinybase';
import {CellView} from 'tinybase/ui-react';
// ...
```

(You can also select different targets and flavors of the ui-react module as
described in the Importing TinyBase guide.)

Boilerplate aside, let's move on to understand how to use hooks in the ui-react
module, with the Using React Hooks guide.
