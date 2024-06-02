# Custom Persistence

When you want to load and save Store data in unusual or custom ways, you can
used the createCustomPersister function to do so in any way you wish.

As well as providing a reference to the Store to persist, you must provide
functions that handle how to fetch, write, and listen to, the persistence layer.

## Functions To Implement

To build a custom Persister, you should provide four functions:

- `getPersisted`, an asynchronous function which will fetch content from
  the persistence layer (or `null` or `undefined` if not present).
- `setPersisted`, an asynchronous function which will send content to the
  persistence layer.
- `addPersisterListener`, a function that will register a `listener`
  listener on underlying changes to the persistence layer. You can return a
  listening handle that will be provided again when `delPersisterListener`
  is called.
- `delPersisterListener`, a function that will unregister the listener
  from the underlying changes to the persistence layer. It receives whatever
  was returned from your `addPersisterListener` implementation.
  @returns A reference to the new Persister object.

Note that the first two functions are asynchronous and _must_ return promises.
The latter two are synchronous and should return `void` (i.e. should not return
a value at all).

This API changed in v4.0. Any custom persisters created on previous versions
should be upgraded. Most notably, the `setPersisted` function parameter is
provided with a `getContent` function to get the content from the Store itself,
rather than being passed pre-serialized JSON. It also receives information about
the changes made during a transaction. The `getPersisted` function must return
the content (or nothing) rather than JSON. `startListeningToPersisted` has been
renamed `addPersisterListener`, and `stopListeningToPersisted` has been renamed
`delPersisterListener`.

This example creates a custom Persister object that persists the Store to a
local string called `storeJson` and which would automatically load by polling
for changes every second:

```js
import {createCustomPersister, createStore} from 'tinybase';

const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
let storeJson;
let interval;

const persister = createCustomPersister(
  store,
  async () => {
    try {
      return JSON.parse(storeJson);
    } catch {}
  },
  async (getContent) => (storeJson = JSON.stringify(getContent())),
  (listener) => (interval = setInterval(listener, 1000)),
  () => clearInterval(interval),
);

await persister.save();
console.log(storeJson);
// -> '[{"pets":{"fido":{"species":"dog"}}},{}]'

storeJson = '[{"pets":{"fido":{"species":"dog","color":"brown"}}},{}]';
await persister.load();

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}}

persister.destroy();
```

Note that the other creation functions (such as the createSessionPersister
function and createFilePersister function, for example) all use this function
under the covers. See those implementations for ideas on how to implement your
own Persister types.

Next we move on to look at how to fully synchronize TinyBase Stores with
databases, particularly SQLite, in the Database Persistence guide.
