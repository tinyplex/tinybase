# StoreInspector

TinyBase v4.1 includes the ui-react-dom module, with a collection of user
interface components for rendering Store data in your app. It also contains a
web-based inspector that allows you to reason about the data during development.

## Usage

The component is only available in the debug version of the ui-react-dom
library, and a special build of the UMD version of the ui-react-dom module is
available for the purpose. This should be loaded after the ui-react module in
your web app.

```html
<!-- ... -->
<script src="/umd/ui-react.js"></script>
<script src="/umd/ui-react-dom-debug.js"></script>
<!-- ... -->
```

Simply add the component inside a Provider component (which is providing the
Store context for the app that you want to be inspected). In total, the
boilerplate will look something like this:

```jsx yolo
const {Provider, useCreateStore} = TinyBaseUiReact;
const {StoreInspector} = TinyBaseUiReactDomDebug;

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
      <StoreInspector />
    </>
  );
};

addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## What is in the inspector?

The inspector appears at first as a nub in the corner of the screen containing
the TinyBase logo. Once clicked, it will open up to show a dark panel. You can
reposition this to dock to any side of the window, or expand to the full screen.

![StoreInspector](/store-inspector.webp 'StoreInspector')

The inspector contains the following sections for whatever is available in the
Provider component context:

- Default Store: Values and a sortable view of each Table
- Each named Store: Values and a sortable view of each Table
- Default Indexes: each Row in each Slice of each Index
- Each named Indexes: each Row in each Slice of each Index
- Default Relationships: the pair of Tables in each Relationship
- Each named Relationships: the pair of Tables in each Relationship

It is hoped that each section is quite self-explanatory. If not, please try it
out in the <StoreInspector /> demo, or indeed in most of the TinyBase demos
themselves!
