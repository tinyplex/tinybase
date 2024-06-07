# <ValuesInHtmlTable />

In this first demo, we set up a Store containing some sample data, and showcase
the ValuesInHtmlTable component.

Due to the rendering of tables, these demos are probably best viewed on a
desktop browser.

## Boilerplate

First, we pull in React, ReactDOM, and TinyBase. We add the ui-react and
ui-react-dom modules too.

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase/index.js"></script>
<script src="/umd/tinybase/ui-react/index.js"></script>
<script src="/umd/tinybase/ui-react-dom/index.js"></script>
```

We need the following parts of the TinyBase API, the ui-react module, and React
itself:

```js
const {createStore} = TinyBase;
const {Provider, useCreateStore} = TinyBaseUiReact;
const {ValuesInHtmlTable} = TinyBaseUiReactDom;
const {createElement, useMemo, useState} = React;
```

This is the main container of the demo, in a React component called `App`. It
instantiates the Store with sample data (and memoizes it), and then renders the
app with the Store in a Provider context so it's available throughout the app:

```jsx
const App = () => {
  const store = useCreateStore(createStore);
  const [isLoading, setIsLoading] = useState(true);
  useMemo(() => {
    loadValues(store);
    setIsLoading(false);
  }, []);

  return (
    <Provider store={store}>{isLoading ? <Loading /> : <Body />}</Provider>
  );
};

addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## Loading Data

To start things off simple, we're loading a set of static Values into the Store,
perhaps representing the user preferences of an app:

```js
const loadValues = (store) => {
  store
    .startTransaction()
    .setValue('username', 'John Appleseed')
    .setValue('email address', 'john.appleseed@example.com')
    .setValue('dark mode', true)
    .setValue('font size', 14)
    .finishTransaction();
};
```

Though currently synchronous, later demos will load data from a remote server,
so let's set up a spinner now, to show while data loads:

```jsx
const Loading = () => <div id="loading" />;
```

```less
#loading {
  animation: spin 1s infinite linear;
  height: 2rem;
  margin: 40vh auto;
  width: 2rem;
  &::before {
    content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 100 100"><path d="M50 10A40 40 0 1 1 10 50" stroke="black" fill="none" stroke-width="4" /></svg>');
  }
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## Default Styling

These demos have some default CSS for typography and color. Let's get that out
of the way early, too:

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
  min-height: 100vh;
  justify-content: space-around;
  letter-spacing: -0.04rem;
  line-height: 1.5rem;
  margin: 0;
  user-select: none;
}
```

## Using the ValuesInHtmlTable Component

OK, to the matter at hand.

Now that we have a default Store in the Provider context, and it's populated
with some data, we can render it with components from the ui-react-dom module.

We will start off with a simple table, using the ValuesInHtmlTable component.
This literally needs zero props to render the Values.

```jsx
const Body = () => {
  return (
    <>
      <ValuesInHtmlTable />
```

That's it really. That's the demo. This emits simple DOM HTML for a table
containing all the Store's Values.

Of course we should provide some light styling to emphasize the borders and
headings and so on. Oh, and an obligatory drop shadow.

```less
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
    overflow: hidden;
    padding: 0.25rem 0.5rem;
    white-space: nowrap;
    border-width: 1px 0;
    border-style: solid;
    border-color: #eee;
    text-align: left;
  }
  thead th {
    border-bottom-color: #ccc;
  }
  button,
  input {
    border: 1px solid #ccc;
  }
}
```

And ta-da! You should see a styled table with the movie genre information in it.

Note that you can disable the top header row and Id column on the left with the
`headerRow` and `idColumn` props respectively. We can add a second table to
demonstrate that:

```jsx
      <ValuesInHtmlTable headerRow={false} idColumn={false} />
    </>
  );
};
```

Take a look at the ValuesInHtmlTableProps type to see all the ways in which you
can configure this component, and click the 'CodePen' link under the demo above
to try them out.

There is plenty more that you can do with the ui-react-dom module's components,
and so please continue to the next <TableInHtmlTable /> demo.
