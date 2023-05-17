# Persisting Data

The persister module lets you save and load Store data to and from different
locations, or underlying storage types.

This is useful for preserving Store data between browser sessions or reloads,
saving or loading browser state to or from a server, or saving Store data to
disk in a environment with filesystem access.

## Types Of Persisters

Creating a Persister for a Store depends on the choice of underlying storage
where the data is to be stored. Options (in separately installed modules)
include:

- The createSessionPersister function (in the persister-browser module)
  returns a Persister that uses the browser's session storage.
- The createLocalPersister function (in the persister-browser module) returns
  a Persister that uses the browser's local storage.
- The createRemotePersister function (in the persister-remote module) returns
  a Persister that uses a remote server.
- The createFilePersister function (in the persister-file module) returns a
  Persister that uses a local file (in an appropriate environment).

There is also a way to developer custom Persisters of your own, which we
describe in the Custom Persistence guide.

For more complex synchronization, TinyBase includes persisters for frameworks
like Yjs:

- The createYjsPersister function (in the persister-yjs module) returns a
  Persister that connects to a Yjs document.

(See the Synchronizing Data guide for more details on those.)

## Persister Operations

A Persister lets you explicit save or load data, with the save method and the
load method respectively. These methods are both asynchronous (since the
underlying data storage may also be) and return promises. As a result you should
use the `await` keyword to call them in a way that guarantees subsequent
execution order.

In this example, a Persister saves data to, and loads it from, the browser's
session storage:

```js
const store = createStore()
  .setValues({employees: 3})
  .setTables({pets: {fido: {species: 'dog'}}});
const persister = createSessionPersister(store, 'petStore');

await persister.save();
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"fido":{"species":"dog"}}},{"employees":3}]'

sessionStorage.setItem(
  'petStore',
  '[{"pets":{"toto":{"species":"dog"}}},{"employees":4}]',
);
await persister.load();
console.log(store.getTables());
// -> {pets: {toto: {species: 'dog'}}}
console.log(store.getValues());
// -> {employees: 4}

sessionStorage.clear();
```

## Automatic Loading and Saving

When you don't want to deal with explicit persistence operations, a Persister
object also provides automatic saving and loading. Automatic saving listens for
changes to the Store and persists the data immediately. Automatic loading
listens (or polls) for changes to the persisted data and reflects those changes
in the Store.

You can start automatic saving or loading with the startAutoSave method and
startAutoLoad method. Both are asynchronous since they will do an immediate save
and load before starting to listen for subsequent changes. You can stop the
behavior with the stopAutoSave method and stopAutoLoad method (which are
synchronous).

In this example, both automatic loading and saving are configured:

```js
await persister.startAutoLoad({pets: {fido: {species: 'dog'}}});
await persister.startAutoSave();

store.delValues().setTables({pets: {felix: {species: 'cat'}}});
// ...
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"felix":{"species":"cat"}}},{}]'

sessionStorage.setItem('petStore', '[{"pets":{"toto":{"species":"dog"}}},{}]');
// -> StorageEvent('storage', {storageArea: sessionStorage, key: 'petStore'})
// ...
console.log(store.getTables());
// -> {pets: {toto: {species: "dog"}}}

persister.destroy();
sessionStorage.clear();
```

Note that the startAutoLoad method also takes a default set of Tables so that
the Store can be instantiated with good data if the persistence layer is empty
(such as when this is the first time the app has been executed).

## A Caveat

You may often want to have both automatic saving and loading of a Store so that
changes are constantly synchronized (allowing basic state preservation between
browser tabs, for example). The framework has some basic provisions to prevent
race conditions - for example it will not attempt to save data if it is
currently loading it and vice-versa.

Be aware, however, that the default implementations do not provide complex
synchronization heuristics and you should comprehensively test your persistence
strategy to understand the opportunity for data loss (in the case of trying to
save data to a server under poor network conditions, for example).

## Summary

Use the persisters module to load and save data from and to a variety of common
persistence layers. When these don't suffice, you can also develop custom
Persisters of your own, for which we proceed to the Custom Persistence guide.
