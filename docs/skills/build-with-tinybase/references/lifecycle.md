# Persister And Synchronizer Lifecycle

Persisters and Synchronizers are asynchronous and stateful. Most TinyBase bugs
in generated code are ordering or teardown mistakes rather than wrong APIs.

## Store Or MergeableStore

Decide this first, because it constrains everything downstream.

| Situation                                            | Create                   |
| ---------------------------------------------------- | ------------------------ |
| Reactive local state, no synchronization, ever       | `createStore()`          |
| Any Synchronizer                                     | `createMergeableStore()` |
| Changes made in two places that must later be merged | `createMergeableStore()` |
| A Persister marked MergeableStore only               | `createMergeableStore()` |

A MergeableStore carries CRDT metadata, so it is larger and slightly slower than
a Store. That is the only reason not to use one.

Every Synchronizer is a `Persister<Persists.MergeableStoreOnly>`. Passing a
plain Store to `createWsSynchronizer`, `createBroadcastChannelSynchronizer`, or
`createLocalSynchronizer` is a type error and will not work at runtime. Check
[import-paths.md](import-paths.md) for which Persisters accept which.

Both are created synchronously and need no `await`. Only Persisters and
Synchronizers are asynchronous.

## Loading Before Saving

A Persister that starts saving before it has loaded will overwrite durable
content with whatever the in-memory Store happened to contain at startup, which
is usually nothing. This is the single most damaging ordering mistake.

Use `startAutoPersisting`, which loads and then starts saving in the correct
order:

```js
const persister = createLocalPersister(store, 'my-app');
await persister.startAutoPersisting();
```

Pass initial content as its first argument when the Store should be seeded only
if storage is empty. It is applied during the load, not over it:

```js
await persister.startAutoPersisting([{pets: {fido: {species: 'dog'}}}, {}]);
```

Pass `true` as its second argument only when the in-memory Store is deliberately
authoritative and should be written out before loading.

The explicit equivalent, if the two halves must be separated, is `await
persister.load()` and then `await persister.startAutoSave()` — in that order.
Never `startAutoSave()` first.

## Starting Synchronization

`createWsSynchronizer` returns a promise and does not begin synchronizing on its
own. Await it, then call `startSync()`:

```js
const synchronizer = await createWsSynchronizer(store, webSocket);
await synchronizer.startSync();
```

A Synchronizer inherits the whole Persister interface, so `startAutoPersisting`
works on it too. `startSync()` is the idiomatic call for a Synchronizer.

## Reconnection

A raw `WebSocket` does not reconnect. In a browser, wrap it:

```js
import ReconnectingWebSocket from 'reconnecting-websocket';

const synchronizer = await createWsSynchronizer(
  store,
  new ReconnectingWebSocket(`wss://example.com/${pathId}`),
);
await synchronizer.startSync();

synchronizer.getWebSocket().addEventListener('open', () => {
  synchronizer.load().then(() => synchronizer.save());
});
```

The `open` handler re-syncs after a dropped connection. Without it, changes made
while offline can fail to propagate after the socket comes back.

## Paths And Channels

These are two distinct mechanisms and are frequently conflated.

The **path** is the URL path of the WebSocket. Clients on the same path are
synchronized together; clients on different paths are not. With
`WsServerDurableObject`, each path identifies a distinct Durable Object
instance.

```js
new WebSocket('wss://example.com/petShop');
```

The **channel Id** is an optional third argument to `createWsSynchronizer`. It
lets several MergeableStore instances share one physical WebSocket. The socket
must be created with the `tinybase` subprotocol:

```js
const webSocket = new WebSocket('wss://example.com/petShop', 'tinybase');
const filesSynchronizer = await createWsSynchronizer(
  filesStore,
  webSocket,
  'files',
);
const employeesSynchronizer = await createWsSynchronizer(
  employeesStore,
  webSocket,
  'employees',
);
```

The effective paths are then `petShop/files` and `petShop/employees`. A client
using one socket per Store can join the first by connecting directly to
`wss://example.com/petShop/files`.

Channel rules:

- The channel Id is explicit. It is never taken from the MergeableStore Id.
- It may contain multiple path segments, but cannot be empty, contain empty,
  `.` or `..` segments, or include query, fragment, or newline characters.
- It holds at most 1,024 UTF-8 bytes.
- One WebSocket supports at most 100 subscribed channels. Re-subscribing to the
  same channel does not consume another slot; unsubscribing releases one.
- Shared WebSockets work with `WsServer` and `WsServerSimple`. They are **not**
  supported by `WsServerDurableObject`.

Neither `WsServer` nor `WsServerSimple` authorizes channel Ids. A client
accepted on a base path can subscribe to any channel beneath it. For untrusted
clients, authenticate the upgrade request and either grant access to the whole
subtree or use a separate authenticated WebSocket per authorized path.

The client Ids that `WsServer` exposes derive from the `Sec-WebSocket-Key`
header. They change across reconnections and are not authenticated identities.
Do not use them for authorization.

## Tearing Down

`destroy()` stops auto-loading, auto-saving, and synchronization, and releases
the underlying resource. Call it whenever the owning scope ends: a React effect
cleanup, a Node process shutdown, a closing worker.

```js
await synchronizer.destroy();
```

On a shared WebSocket, destroying one Synchronizer unsubscribes only its
channel. The socket closes when the last Synchronizer using it is destroyed.

Failing to destroy leaks the socket or file handle and, in React strict mode,
produces duplicate synchronization.

## In React And Solid

Do not create Persisters or Synchronizers in a component body or a bare
`useEffect`. Use the provided hooks, which handle the promise, the dependency
list, and destruction:

```jsx
const store = useCreateMergeableStore(createMergeableStore);

useCreatePersister(
  store,
  async (store) => {
    const persister = createLocalPersister(store, 'my-app');
    await persister.startAutoPersisting();
    return persister;
  },
  [],
);

useCreateSynchronizer(store, async (store) => {
  const synchronizer = await createWsSynchronizer(
    store,
    new ReconnectingWebSocket(SERVER + location.pathname),
  );
  await synchronizer.startSync();
  return synchronizer;
});
```

`useCreatePersister` and `useCreateSynchronizer` destroy the object on unmount.
Returning `undefined` from the callback is valid and creates nothing.

Do not mirror Store data into component state. Read it with the TinyBase hooks
so that updates stay reactive.

## Verifying

Compilation proves none of this. To confirm persistence, change data and perform
a real reload or process restart. To confirm synchronization, connect two
clients to the same path or channel and check that changes propagate both ways,
then drop and restore the connection.
