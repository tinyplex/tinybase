# Using Checkpoints

This guide describes how the checkpoints module gives you the ability to create
and track changes to a Store's data for the purposes of undo and redo
functionality.

The main entry point to using the checkpoints module is the createCheckpoints
function, which returns a new Checkpoints object. That object in turn has
methods that let you set checkpoints, move between them (altering the underlying
Store accordingly), and register listeners for when they change.

Checkpoints let you undo and redo both keyed value and tabular data changes.

## The Basics

Here's a simple example to show a Checkpoints object in action. The `fido` Row
starts off with the `sold` Cell set to `false`. We set a checkpoint when this
field changes, and which then allows us to return later to that initial state.

```js
import {createCheckpoints, createStore} from 'tinybase';

const store = createStore().setTables({pets: {fido: {sold: false}}});

const checkpoints = createCheckpoints(store);
console.log(checkpoints.getCheckpointIds());
// -> [[], '0', []]

store.setCell('pets', 'fido', 'sold', true);
checkpoints.addCheckpoint('sale');
console.log(checkpoints.getCheckpointIds());
// -> [['0'], '1', []]

checkpoints.goBackward();
console.log(store.getCell('pets', 'fido', 'sold'));
// -> false
console.log(checkpoints.getCheckpointIds());
// -> [[], '0', ['1']]
```

The getCheckpointIds method deserves a quick explanation. It returns a
CheckpointIds array which has three parts:

- The 'backward' checkpoint Ids that can be rolled backward to (in other words,
  the checkpoints in the undo stack for this Store). They are in chronological
  order with the oldest checkpoint at the start of the array.
- The current checkpoint Id of the Store's state, or `undefined` if the current
  state has not been checkpointed.
- The 'forward' checkpoint Ids that can be rolled forward to (in other words,
  the checkpoints in the redo stack for this Store). They are in chronological
  order with the newest checkpoint at the end of the array.

The goBackward method is only one of the ways to move around the checkpoint
stack. The goForward method lets you redo changes, and the goTo method lets you
skip multiple checkpoints to undo or redo many changes at once.

## Checkpoint Reactivity

As with Metrics, Indexes, and Relationships objects, you can add a listener to
the Checkpoints object for whenever the checkpoint stack changes:

```js
const listenerId = checkpoints.addCheckpointIdsListener(() => {
  console.log(checkpoints.getCheckpointIds());
});
store.setCell('pets', 'fido', 'species', 'dog');
// -> [['0'], undefined, []]
checkpoints.addCheckpoint();
// -> [['0'], '2', []]

checkpoints.delListener(listenerId);
```

Also note that when a new change is layered onto the original state, the
previous redo of checkpoint '1' is now not available.

A given Store can only have one Checkpoints object associated with it. If you
call this function twice on the same Store, your second call will return a
reference to the Checkpoints object created by the first.

Finally, let's find out how to include checkpoints in a user interface in the
Building A UI With Checkpoints guide.
