# Building A UI With Checkpoints

This guide covers how the ui-react module supports the Checkpoints object. After
all, if you have undo functionality in your app, you probably want an undo
button!

As with all the other React-based bindings we've discussed, the ui-react module
provides both hooks and components to connect your checkpoints to your
interface.

## Checkpoints Hooks

Firstly, the useCheckpointIds hook is the reactive version of the
getCheckpointIds method and returns the three-part CheckpointIds array.

```jsx
import {createCheckpoints, createStore} from 'tinybase';
import {useCheckpointIds} from 'tinybase/ui-react';
import React from 'react';
import {createRoot} from 'react-dom/client';

const store = createStore().setTable('pets', {fido: {species: 'dog'}});
const checkpoints = createCheckpoints(store);
const App = () => <span>{JSON.stringify(useCheckpointIds(checkpoints))}</span>;

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>[[],"0",[]]</span>'

store.setCell('pets', 'fido', 'sold', true); // !act
console.log(app.innerHTML);
// -> '<span>[["0"],null,[]]</span>'

checkpoints.addCheckpoint('sale'); // !act
console.log(app.innerHTML);
// -> '<span>[["0"],"1",[]]</span>'
```

This is not yet extremely useful for constructing an undo and redo UI! The
useCheckpoint hook returns the label of a checkpoint so that the user knows what
they are undoing, for example:

```jsx
import {useCheckpoint} from 'tinybase/ui-react';

const App2 = () => <span>{useCheckpoint('2', checkpoints)}</span>;

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span></span>'

store.setCell('pets', 'fido', 'color', 'brown'); // !act
checkpoints.addCheckpoint('color'); // !act
console.log(app.innerHTML);
// -> '<span>color</span>'
```

Further, hooks like the useGoBackwardCallback hook and the useGoForwardCallback
hook are self-explanatory, providing a callback that can move the Store
backwards or forwards through the checkpoints stack in response to a user event.

## UndoOrRedoInformation

Perhaps more useful than each of those hooks individually, the
useUndoInformation hook and useRedoInformation hook provide a collection of
information (in an array of the UndoOrRedoInformation type) - including
information about whether the action is possible, the event handler, and the
label - that is fully sufficient to be able to construct an undo/redo UI:

```jsx
import {useUndoInformation} from 'tinybase/ui-react';

store.setTables({pets: {nemo: {species: 'fish'}}});
checkpoints.clear(); // !act
const App3 = () => {
  const [canUndo, handleUndo, id, label] = useUndoInformation(checkpoints);
  return canUndo ? (
    <span onClick={handleUndo}>Undo {label}</span>
  ) : (
    <span>Nothing to undo</span>
  );
};

root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<span>Nothing to undo</span>'

store.setCell('pets', 'nemo', 'color', 'orange'); // !act
checkpoints.addCheckpoint('color'); // !act
console.log(app.innerHTML);
// -> '<span>Undo color</span>'
```

## Checkpoints Views

The BackwardCheckpointsView component, CurrentCheckpointView component, and
ForwardCheckpointsView component are the main three components for the
Checkpoints object, and list the checkpoints behind or ahead of the current
state, so that a list of possible undo and redo actions is visible:

```jsx
import {
  BackwardCheckpointsView,
  CurrentCheckpointView,
  ForwardCheckpointsView,
} from 'tinybase/ui-react';

const App4 = () => (
  <div>
    <BackwardCheckpointsView checkpoints={checkpoints} debugIds={true} />/
    <CurrentCheckpointView checkpoints={checkpoints} debugIds={true} />/
    <ForwardCheckpointsView checkpoints={checkpoints} debugIds={true} />
  </div>
);

root.render(<App4 />); // !act
console.log(app.innerHTML);
// -> '<div>0:{}/1:{color}/</div>'

store.setCell('pets', 'nemo', 'stripes', true); // !act
checkpoints.addCheckpoint('stripes'); // !act
console.log(app.innerHTML);
// -> '<div>0:{}1:{color}/2:{stripes}/</div>'
```

Each of these components takes a `checkpointComponent` prop which allows you to
customize how each checkpoint is rendered. Undoubtedly you will want something
nicer than the default debug example above!

## Checkpoints Context

In the same way that a Store can be passed into a Provider component context and
used throughout the app, a Checkpoints object can also be provided to be used by
default:

```jsx
import {
  Provider,
  useCreateCheckpoints,
  useCreateStore,
} from 'tinybase/ui-react';

const App5 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('species', {pets: {nemo: {species: 'fish'}}}),
  );
  const checkpoints = useCreateCheckpoints(store, createCheckpoints);

  return (
    <Provider checkpoints={checkpoints}>
      <Pane />
    </Provider>
  );
};

const Pane = () => <span>{JSON.stringify(useCheckpointIds())}</span>;

root.render(<App5 />); // !act
console.log(app.innerHTML);
// -> '<span>[[],"0",[]]</span>'
```

The `checkpointsById` prop can be used in the same way that the `storesById`
prop is, to let you reference multiple Checkpoints objects by Id.

## Summary

The support for Checkpoints objects in the ui-react module is very similar to
that for all the other types of top level object, making it easy to attach
checkpoints and undo/redo functionality to your user interface.

Let's move on to the ways in which we can create more advanced queries in the
Queries guide.
