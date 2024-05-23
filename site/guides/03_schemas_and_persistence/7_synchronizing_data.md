# Synchronizing Data

Some persister modules let you save and load Store data to underlying storage
types that can provide synchronization, local-first reconciliation, and CRDTs.

These include:

- The createYjsPersister function (in the persister-yjs module) returns a
  Persister that connects to a [Yjs](https://yjs.dev/) document.
- The createAutomergePersister function (in the persister-automerge module)
  returns a Persister that connects to an [Automerge](https://automerge.org/)
  document via [automerge-repo](https://github.com/automerge/automerge-repo).

The APIs are exactly the same as for other persisters, but there is some
additional infrastructure behind the scenes to ensure that the updates are as
incremental and atomic as possible, improving the reconciliation capabilities.

## A Synchronization Walkthrough

For fully-fledged synchronization, you will want to use both auto-load and
auto-save between the Store and the underlying synchronization framework.

In this case, we have two Yjs documents that are each bound to their respective
Store objects by a Persister with auto-load and auto-save:

```js
import {Doc} from 'yjs';
import {createYjsPersister} from 'tinybase/persisters/persister-yjs';

const doc1 = new Doc();
const store1 = createStore();
const persister1 = createYjsPersister(store1, doc1);
await persister1.startAutoLoad();
await persister1.startAutoSave();

const doc2 = new Doc();
const store2 = createStore();
const persister2 = createYjsPersister(store2, doc2);
await persister2.startAutoLoad();
await persister2.startAutoSave();
```

Typically, real-world synchronization for Yjs happens between two systems via a
Yjs connection provider with state machine vectors and so on. For the purposes
of illustration here, we synthesize that with a simple `syncDocs` function that
copies full state between the documents:

```js
import {applyUpdate, encodeStateAsUpdate} from 'yjs';

const syncDocs = async () => {
  // ...
  applyUpdate(doc1, encodeStateAsUpdate(doc2));
  applyUpdate(doc2, encodeStateAsUpdate(doc1));
};
```

It is good practice to establish a synchronization baseline between the Stores:

```js
await syncDocs();
```

Now imagine that we make a change to one of the Stores, and synchronize again:

```js
store1.setTables({pets: {fido: {species: 'dog'}}});
await syncDocs();
```

If all goes well, we should see those changes in the other Store!

```js
console.log(store2.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

And of course we can make changes propagate back again:

```js
store2.setValue('open', true);
await syncDocs();
console.log(store1.getValues());
// -> {open: true}
```

## Conflicts

TinyBase deliberately avoids having an opinion on simultaneous or conflicting
updates, deferring that to the underlying CRDT framework. However, most changes
are dealt with as atomically as possible - in other words at a Cell or Value
level - in order to limit data loss by default.

Here we update two adjacent Cells in the same Row:

```js
store1.setCell('pets', 'fido', 'color', 'brown');
store2.setCell('pets', 'fido', 'legs', 4);
// ...
await syncDocs();
console.log(store1.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown', 'legs': 4}}}
console.log(store2.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown', 'legs': 4}}}
```

If there are two conflicting changes to the same Cell, Yjs typically runs a
tie-break based on the client ID of the document, where the higher one wins.

```js
// Here we force the clientID so that the reconciliation is deterministic.
doc1.clientID = 1;
doc2.clientID = 2;

store1.setCell('pets', 'fido', 'price', 4);
store2.setCell('pets', 'fido', 'price', 5);
// ...
await syncDocs();
console.log(store1.getCell('pets', 'fido', 'price'));
// -> 5
console.log(store2.getCell('pets', 'fido', 'price'));
// -> 5
```

However, in production use, you are highly discouraged from setting the clientID
yourself, and hence the reconciliation will not be deterministic without manual
resolution.
