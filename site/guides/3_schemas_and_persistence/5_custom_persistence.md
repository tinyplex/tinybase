# Custom Persistence

When you want to load and save Store data in unusual or custom ways, you can
used the createCustomPersister function to do so in any way you wish.

As well as providing a reference to the Store to persist, you must provide
functions that handle how to fetch, write, and listen to, the persistence layer.

## Functions To Implement

To build a custom Persister, you should provide four functions:

- `getPersisted`, an asynchronous function which will fetch content from the
  persistence layer (or `null` or `undefined` if not present).
- `setPersisted`, an asynchronous function which will send content to the
  persistence layer.
- `startListeningToPersisted`, a function that will register a `didChange`
  listener on underlying changes to the persistence layer.
- `stopListeningToPersisted`, a function that will unregister the listener from
  the underlying changes to the persistence layer.

Note that the first two functions are synchronous and must return promises. The
latter two are synchronous and should return `void`.

This example creates a custom Persister object that persists the Store to a
local string called `storeJson` and which would automatically load by polling
for changes every second:

```js
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
let storeJson;
let interval;

const persister = createCustomPersister(
  store,
  async () => storeJson,
  async (getContent) => (storeJson = JSON.stringify(getContent())),
  (didChange) => (interval = setInterval(didChange, 1000)),
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
