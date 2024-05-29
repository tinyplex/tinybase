# Building A UI With Indexes

This guide covers how the ui-react module supports the Indexes object.

As with the React-based bindings to a Store object, the ui-react module provides
both hooks and components to connect your indexes to your interface.

## Indexes Hooks

The useSliceIds hook is as simple as it sounds. It gets the current set of Slice
Ids in an Index, and registers a listener so that any changes to that result
will cause a re-render:

```jsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useSliceIds} from 'tinybase/ui-react';

const store = createStore().setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});
const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index on
);
const App = () => (
  <span>{JSON.stringify(useSliceIds('bySpecies', indexes))}</span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>["dog","cat"]</span>'

store.setRow('pets', 'lowly', {species: 'worm'}); // !act
console.log(app.innerHTML);
// -> '<span>["dog","cat","worm"]</span>'
```

The useCreateIndexes hook is used to create an Indexes object within a React
application with convenient memoization:

```jsx
import {useCreateIndexes, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog'},
      felix: {species: 'cat'},
      cujo: {species: 'dog'},
    }),
  );
  const indexes = useCreateIndexes(store, (store) =>
    createIndexes(store).setIndexDefinition('bySpecies', 'pets', 'species'),
  );
  return <span>{JSON.stringify(useSliceIds('bySpecies', indexes))}</span>;
};

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span>["dog","cat"]</span>'
```

## Index And Slice Views

The IndexView component renders the structure of an Index, and registers a
listener so that any changes to that result will cause a re-render. The
SliceView component renders just a single Slice by iterating over each Row in
that Slice.

As with all ui-react view components, these use their corresponding hooks under
the covers, which means that any changes to the Index or the Row objects
referenced by it will cause a re-render.

```jsx
import {SliceView} from 'tinybase/ui-react';

const App3 = () => (
  <div>
    <SliceView
      indexId="bySpecies"
      sliceId="dog"
      indexes={indexes}
      debugIds={true}
    />
  </div>
);

root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<div>dog:{fido:{species:{dog}}cujo:{species:{dog}}}</div>'
```

A SliceView can be given a custom RowView-compatible component to render its
children, much like a TableView component can. And an IndexView can be in turn
given a custom SliceView-compatible component:

```jsx
import {IndexView} from 'tinybase/ui-react';

const MyRowView = (props) => <>{props.rowId};</>;

const MySliceView = (props) => (
  <div>
    {props.sliceId}:<SliceView {...props} rowComponent={MyRowView} />
  </div>
);

const App4 = () => (
  <IndexView
    indexId="bySpecies"
    indexes={indexes}
    sliceComponent={MySliceView}
  />
);

root.render(<App4 />); // !act
console.log(app.innerHTML);
// -> '<div>dog:fido;cujo;</div><div>cat:felix;</div><div>worm:lowly;</div>'
```

## Indexes Context

In the same way that a Store can be passed into a Provider component context and
used throughout the app, an Indexes object can also be provided to be used by
default:

```jsx
import {Provider, useSliceRowIds} from 'tinybase/ui-react';

const App5 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog'},
      felix: {species: 'cat'},
      cujo: {species: 'dog'},
    }),
  );
  const indexes = useCreateIndexes(store, (store) =>
    createIndexes(store).setIndexDefinition('bySpecies', 'pets', 'species'),
  );

  return (
    <Provider indexes={indexes}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <SliceView indexId="bySpecies" sliceId="dog" debugIds={true} />/
    {useSliceRowIds('bySpecies', 'cat')}
  </span>
);

root.render(<App5 />); // !act
console.log(app.innerHTML);
// -> '<span>dog:{fido:{species:{dog}}cujo:{species:{dog}}}/felix</span>'
```

The `indexesById` prop can be used in the same way that the `storesById` prop
is, to let you reference multiple Indexes objects by Id.

## Summary

The support for Indexes objects in the ui-react module is very similar to that
for the Store object and Metrics object, making it easy to attach Index and
Slice contents to your user interface.

We finish off this section about the indexes module with the Advanced Index
Definition guide.
