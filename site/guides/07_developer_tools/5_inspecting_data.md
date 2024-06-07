# Inspecting Data

TinyBase v4.1 includes the ui-react-dom module, with a collection of user
interface components for rendering Store data in your app. It also contains a
web-based inspector, the Inspector component, that allows you to reason about
the data during development.

![Inspector](/store-inspector.webp 'Inspector')

(NB: Previous to v5.0, this component was called `StoreInspector`.)

## Usage

The component is available in the ui-react-inspector module. Since it depends on
it, this should be loaded after the ui-react module in your web app.

```html
<!-- ... -->
<script src="/umd/tinybase/ui-react/index.js"></script>
<script src="/umd/tinybase/ui-react-inspector/index.js"></script>
<!-- ... -->
```

Simply add the component inside a Provider component (which is providing the
Store context for the app that you want to be inspected). In total, the
boilerplate will look something like this:

```jsx yolo
const {Provider, useCreateStore} = TinyBaseUiReact;
const {Inspector} = TinyBaseUiReactInspector;

const App = () => (
  <Provider store={useCreateStore(createStore)}>
    <Body />
  </Provider>
);

const Body = () => {
  return (
    <>
      <h1>My app</h1>
      {/* ... */}
      <Inspector />
    </>
  );
};

addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## What Is In The Inspector?

The inspector appears at first as a nub in the corner of the screen containing
the TinyBase logo. Once clicked, it will open up to show a dark panel. You can
reposition this to dock to any side of the window, or expand to the full screen.

The inspector contains the following sections for whatever is available in the
Provider component context:

- Default Store: Values and a sortable view of each Table
- Each named Store: Values and a sortable view of each Table
- Default Indexes: each Row in each Slice of each Index
- Each named Indexes: each Row in each Slice of each Index
- Default Relationships: the pair of Tables in each Relationship
- Each named Relationships: the pair of Tables in each Relationship
- Default Queries: the pair of Tables in each Query
- Each named Queries: the pair of Tables in each Query

It is hoped that each section is quite self-explanatory. If not, please try it
out in the <Inspector /> demo, or indeed in most of the TinyBase demos
themselves! The Movie Database demo and Countries demo are quite good examples
of the inspector in use.
