# Building A UI With Relationships

This guide covers how the ui-react module supports the Relationships object.

As with the React-based bindings to a Store object, the ui-react module provides
both hooks and components to connect your relationships to your interface.

## Relationships Hooks

As you may have guessed by now, there are three hooks you'll commonly use here:

- The useRemoteRowId hook gets the remote Row Id for a given local Row in a
  Relationship.
- The useLocalRowIds hook gets the local Row Ids for a given remote Row in a
  Relationship.
- The useLinkedRowIds hook gets the linked Row Ids for a given Row in a linked
  list Relationship.

Each hook registers a listener so that any relevant changes will cause a
re-render. As an example:

```jsx
import {createRelationships, createStore} from 'tinybase';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useRemoteRowId} from 'tinybase/ui-react';

const store = createStore()
  .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
  .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
const relationships = createRelationships(store).setRelationshipDefinition(
  'petSpecies',
  'pets',
  'species',
  'species',
);
const App = () => (
  <span>{useRemoteRowId('petSpecies', 'cujo', relationships)}</span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>dog</span>'

store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
console.log(app.innerHTML);
// -> '<span>wolf</span>'
```

The useCreateRelationships hook is used to create a Relationships object within
a React application with convenient memoization:

```jsx
import {useCreateRelationships, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore()
      .setTable('pets', {
        fido: {species: 'dog'},
        felix: {species: 'cat'},
        cujo: {species: 'dog'},
      })
      .setTable('species', {dog: {price: 5}, cat: {price: 4}}),
  );
  const relationships = useCreateRelationships(store, (store) =>
    createRelationships(store).setRelationshipDefinition(
      'petSpecies',
      'pets',
      'species',
      'species',
    ),
  );
  return <span>{relationships?.getRemoteRowId('petSpecies', 'fido')}</span>;
};

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span>dog</span>'
```

## Relationships Views

The three components you'll use for rendering the contents of Relationships are
the RemoteRowView component, LocalRowsView component, and LinkedRowsView
component, each of which matches the three types of getters as expected.

Also as expected (hopefully by now!), each registers a listener so that any
changes to that result will cause a re-render.

These components can be given a custom RowView-compatible component to render
their Row children:

```jsx
import {CellView, RemoteRowView} from 'tinybase/ui-react';

const MyRowView = (props) => (
  <>
    {props.rowId}: <CellView {...props} cellId="price" />
  </>
);

const App3 = () => (
  <div>
    <RemoteRowView
      relationshipId="petSpecies"
      localRowId="cujo"
      rowComponent={MyRowView}
      relationships={relationships}
    />
  </div>
);

root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<div>wolf: 10</div>'
```

## Relationships Context

In the same way that other objects can be passed into a Provider component
context and used throughout the app, a Relationships object can also be provided
to be used by default:

```jsx
import {Provider} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() =>
    createStore()
      .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
      .setTable('species', {wolf: {price: 10}, dog: {price: 5}}),
  );
  const relationships = useCreateRelationships(store, (store) =>
    createRelationships(store).setRelationshipDefinition(
      'petSpecies',
      'pets',
      'species',
      'species',
    ),
  );

  return (
    <Provider relationships={relationships}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <RemoteRowView
      relationshipId="petSpecies"
      localRowId="cujo"
      debugIds={true}
    />
    /{useRemoteRowId('petSpecies', 'cujo')}
  </span>
);

root.render(<App4 />); // !act
console.log(app.innerHTML);
// -> '<span>cujo:{dog:{price:{5}}}/dog</span>'
```

The `relationshipsById` prop can be used in the same way that the `storesById`
prop is, to let you reference multiple Relationships objects by Id.

## Summary

The support for Relationships objects in the ui-react module is very similar to
that for the Store object, making it easy to attach relationships to your user
interface.

We finish off this section about the relationships module with the Advanced
Relationship Definition guide.
