# Getting Started With ui-react

To build React-based user interfaces with TinyBase, you will need to install the
ui-react module in addition to the main module, and, of course, React itself.

For example, in an HTML file, you can get started with boilerplate that might
look like this:

```html
<html>
  <head>
    <title>My First TinyBase App</title>
    <script type="importmap">
      {
        "imports": {
          "tinybase": "https://esm.sh/tinybase@",
          "tinybase/ui-react": "https://esm.sh/tinybase/ui-react@",
          "react": "https://esm.sh/react@",
          "react/jsx-runtime": "https://esm.sh/react/jsx-runtime@",
          "react-dom/client": "https://esm.sh/react-dom/client@"
        }
      }
    </script>
    <script type="module" src="https://esm.sh/tsx"></script>
    <script type="text/jsx">
      import {createStore} from "tinybase";
      import {CellView} from "tinybase/ui-react";
      import {createRoot} from "react-dom/client";
      import React from "react";

      const store = createStore();
      store.setCell('t1', 'r1', 'c1', 'Hello World');
      createRoot(document.body).render(
        <CellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
      );
    </script>
  </head>
  <body />
</html>
```

Open this file in your browser and you should see the words 'Hello World' on the
screen, having been written to, and read from, a Store, and then rendered by the
CellView component from the ui-react module.

Note that the standalone `https://esm.sh/tsx` script and `text/jsx` type on the
script here are merely to support JSX in the browser and for the purposes of
illustrating how to get started quickly. In a production environment you should
pre-compile and your JSX and modules to create a bundled browser app. If you're
bundling the whole app, you can of course import the ui-react module something
like this.

Boilerplate aside, let's move on to understand how to use hooks in the ui-react
module, with the Using React Hooks guide.
