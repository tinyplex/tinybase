# Using A Synchronizer

The synchronizer module framework lets you synchronize MergeableStore data
between different devices, systems, or subsystems.

It contains the Synchronizer
interface, describing objects which can be used to synchronize a MergeableStore.

Under the covers, a Synchronizer is actually a very specialized type of
Persister that _only_ supports MergeableStore objects, and which has a startSync
method and a stopSync method.

## Types Of Synchronizer

In TinyBase v5.0, there are three types of Synchronizer:

- The WsSynchronizer uses WebSockets to communicate between different systems.
- The BroadcastChannelSynchronizer uses the browser's BroadcastChannel API to
  communicate between different tabs and workers.
- The LocalSynchronizer demonstrates synchronization in memory on a single local
  system.

Of course it is also possible to create custom Synchronizer objects if you have
a transmission medium that allows the synchronization messages to be sent
reliably between clients.

## Synchronizing With WebSockets

A common pattern for synchronizing over the web is to use WebSockets. This
allows multiple clients to pass lightweight messages to each other, facilitating
efficient synchronization.

One thing to understand is that this set up will typically require a server.
This can be a relatively 'thin server' - it does not need to store data of its
own - but is needed to keep a list of clients that are being synchronized
together, and route and broadcast messages between the clients.

TinyBase includes some implementations of WebSocket servers:

- WsServer, created with the createWsServer function in the
  synchronizer-ws-server module. This includes the option to persist data in the server.
- WsServerSimple, created with the createWsServerSimple function in the
  synchronizer-ws-server-simple module. This does not have the complications of
  listeners, persistence, or statistics, and is suitable to be used as a reference
  implementation
- WsServerDurableObject, implemented as Cloudflare Durable Object, created by
  extending the WsServerDurableObject class, and routed with the convenient
  getWsServerDurableObjectFetch function.

Here we'll use the regular WsServer. You simply need to create it, instantiated
with a configured WebSocketServer object from the `ws` package:

```js
// On a server machine:
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {WebSocketServer} from 'ws';

const server = createWsServer(new WebSocketServer({port: 8048}));
```

This sets up a WsServer object, listening on port 8048.

Each client then needs to create a WsSynchronizer object, instantiated with the
MergeableStore being synchronized, and a WebSocket configured to connect to the
aforementioned server:

```js
// On the first client machine:
import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {WebSocket} from 'ws';

const clientStore1 = createMergeableStore();
const clientSynchronizer1 = await createWsSynchronizer(
  clientStore1,
  new WebSocket('ws://localhost:8048/petShop'),
);
```

The path in the WebSocket URL is the WsServer path (or 'room') that the
client joins. Clients connected to the same URL path synchronize together. The
Id you optionally provide to createMergeableStore does not select the server
path.

This WsSynchronizer can then be started, and data manipulated as normal:

```js
await clientSynchronizer1.startSync();
clientStore1.setCell('pets', 'fido', 'species', 'dog');
// ...
```

Meanwhile, on another client, an empty MergeableStore and another WsSynchronizer
can be created and started, connecting to the same server.

```js
// On the second client machine:
const clientStore2 = createMergeableStore();
const clientSynchronizer2 = await createWsSynchronizer(
  clientStore2,
  new WebSocket('ws://localhost:8048/petShop'),
);
await clientSynchronizer2.startSync();
```

Once the synchronization is started, the server will broker the messages being
passed back and forward between the two clients, and the data will be
synchronized. The empty second MergeableStore will be populated with the data
from the first:

```js
// ...
console.log(clientStore2.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

And of course the synchronization is bi-directional:

```js
clientStore2.setCell('pets', 'felix', 'species', 'cat');
console.log(clientStore2.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
```

```js
// ...
console.log(clientStore1.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
```

When done, it's important to destroy a WsSynchronizer to close and tidy up the
client WebSockets:

```js
await clientSynchronizer1.destroy();
```

```js
await clientSynchronizer2.destroy();
```

And, if shut down, the WsServer should also be explicitly destroyed to close its
listeners:

```js
await server.destroy();
```

### Sharing One WebSocket Between Stores

When an application synchronizes several MergeableStore instances, they can
share one physical WebSocket. Create the WebSocket with the `tinybase`
subprotocol, and provide a different channel Id as the third argument to each
createWsSynchronizer call:

```js
const multipleServer = createWsServer(new WebSocketServer({port: 8049}));
const multipleWebSocket = new WebSocket(
  'ws://localhost:8049/petShop',
  'tinybase',
);
const filesStore = createMergeableStore();
const employeesStore = createMergeableStore();
const filesSynchronizer = await createWsSynchronizer(
  filesStore,
  multipleWebSocket,
  'files',
);
const employeesSynchronizer = await createWsSynchronizer(
  employeesStore,
  multipleWebSocket,
  'employees',
);
```

The WebSocket URL path is a base path. In this example, the two server paths
are `petShop/files` and `petShop/employees`. A client using the original
one-WebSocket-per-store form can join the first path by connecting directly to
`ws://localhost:8049/petShop/files`.

The channel Id is explicit and is not taken from the MergeableStore Id. Channel
Ids can contain multiple path segments, but cannot be empty, contain empty,
`.` or `..` segments, or include query, fragment, or newline characters. A
channel Id can contain at most 1,024 UTF-8 bytes.

Each multiplexed WebSocket can have at most 100 subscribed channels. Repeatedly
subscribing to the same channel does not consume another slot, and
unsubscribing releases its active slot. Client creation rejects a 101st channel
without closing the existing shared WebSocket, while servers independently
enforce the limit and also bound resources whose setup or teardown is pending.

Fragment reassembly limits and WsServer traffic buffered while paths start are
shared across the physical WebSocket, rather than being multiplied by its
number of channels.

By default, WsServer and WsServerSimple do not authenticate or authorize channel
Ids: once a client WebSocket is accepted on a base path, it can subscribe to any
valid channel beneath it. A WsServer can instead authorize each channel it
serves, as described in the Authorizing Clients section below.

The client Ids exposed by WsServer are connection metadata derived from the
`Sec-WebSocket-Key` header. They change across reconnections and are not
authenticated user or session identities, so do not use them for authorization.

Each WsSynchronizer is started and stopped normally. Destroying one only
unsubscribes its channel. The shared WebSocket is closed when the last
WsSynchronizer using it is destroyed:

```js
await filesSynchronizer.destroy();
console.log(multipleWebSocket.readyState == WebSocket.OPEN);
// -> true

await employeesSynchronizer.destroy();
await multipleServer.destroy();
```

Shared WebSockets are supported by WsServer and WsServerSimple. They are not
supported by WsServerDurableObject, where each URL path identifies a distinct
Durable Object instance.

### Persisting Data On The Server

New in TinyBase v5.1, the createWsServer function lets you specify a way to
persist data to the server. This makes it possible for all clients to disconnect
from a path, but, when they reconnect, for the data to still be present for them
to sync with.

This is done by passing in a second argument to the function that creates a
Persister instance (for which also need to create or provide a MergeableStore)
for a given path. The `pathId` argument is the path from the client WebSocket
URL, such as `petShop` for `ws://localhost:8048/petShop`:

```js
import {createFilePersister} from 'tinybase/persisters/persister-file';

const persistingServer = createWsServer(
  new WebSocketServer({port: 8050}),
  (pathId) =>
    createFilePersister(
      createMergeableStore(),
      pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);

await persistingServer.destroy();
```

This is a very crude example, but demonstrates a server that will create a file,
based on any path that clients connect to, and persist data to it. In
production, you will certainly want to sanitize the file name! And more likely
you will want to explore using a database-oriented Persister instead of simply
using raw files.

See the createWsServer function documentation for more details.

### Authorizing Clients

New in TinyBase v10.1, a WsServer can decide which clients may use a path, and
what each of them may write. Instead of a Persister creation function, pass an
options object as the second argument, with an `authorize` function and,
optionally, `canWriteCell` and `canWriteValue` functions.

The `authorize` function is called whenever a client joins a path, with the Id
of the path and the HTTP request that opened the WebSocket. It returns a
ClientAccess object to let the client join, or `undefined` to refuse it. Since a
browser cannot add headers to a WebSocket request, a token in the URL's query
string is a common way for a client to identify itself - and the query string is
not part of the path. The ClientAccess object can mark a client as read-only,
and carry a context, such as the user's role, for the other two functions:

```js
const getRole = (request) =>
  new URL(request.url, 'http://localhost').searchParams.get('role');

const authorizingServer = createWsServer(new WebSocketServer({port: 8051}), {
  authorize: (pathId, request) =>
    getRole(request) == 'staff' || getRole(request) == 'customer'
      ? {context: {role: getRole(request)}}
      : undefined,
  canWriteCell: (pathId, tableId, rowId, cellId, cell, {role}) =>
    role == 'staff' || tableId == 'orders',
});

const staffStore = createMergeableStore();
staffStore.setCell('pets', 'fido', 'price', 5);
const staffSynchronizer = await createWsSynchronizer(
  staffStore,
  new WebSocket('ws://localhost:8051/petShop?role=staff'),
);
await staffSynchronizer.startSync();

const customerStore = createMergeableStore();
const customerSynchronizer = await createWsSynchronizer(
  customerStore,
  new WebSocket('ws://localhost:8051/petShop?role=customer'),
);
await customerSynchronizer.startSync();
```

Here, a customer may place an order, but may not change the price of a pet. The
change it is not allowed to make is not passed on, and the server brings the
customer back into line with its own data:

```js
customerStore.setCell('orders', 'order1', 'pet', 'fido');
customerStore.setCell('pets', 'fido', 'price', 1);
// ...

console.log(staffStore.getTables());
// -> {pets: {fido: {price: 5}}, orders: {order1: {pet: 'fido'}}}
console.log(customerStore.getTables());
// -> {pets: {fido: {price: 5}}, orders: {order1: {pet: 'fido'}}}

await customerSynchronizer.destroy();
await staffSynchronizer.destroy();
await authorizingServer.destroy();
```

Once a server authorizes its clients, each path's MergeableStore becomes the
only peer that they synchronize with, so that everything they read and write
passes through it. If no Persister is provided for a path, the server gives it
an in-memory MergeableStore for as long as it has clients.

A change that a client may not make alters nothing on the server, nor for any
other client: the server sends that client alone its own version of the data.
That also removes anything in the client's MergeableStore that it may not write
and that the server does not have, so keep data that is only for that client in
a separate Store.

Each of the three functions does one job. The `authorize` function decides who
may join, and without it every client is admitted. The `canWriteCell` function
decides only about Cells, and the `canWriteValue` function only about Values:
provide both if both need protecting.

The WsServerDurableObject class offers the same features, through its
`authorize`, `canWriteCell`, and `canWriteValue` methods, which you can
override. The WsServerSimple has no MergeableStore of its own, so it cannot
decide what a client writes; to accept or refuse its connections, use the
`verifyClient` option of the WebSocketServer that you pass to it.

Also note that there is a synchronizer-ws-server-simple module that contains a
simple server implementation called WsServerSimple. Without the complications of
listeners, persistence, or statistics, this is more suitable to be used as a
reference implementation for other server environments.

## Synchronizing Over The Browser BroadcastChannel

There may be situations where you need to synchronize data between different
parts of a browser. For example, you might have a transient in-memory
MergeableStore driving your UI, but then another instance in a Service Worker
that can be persisted to (say) IndexedDB or another medium.

To facilitate keeping these in sync, the BroadcastChannelSynchronizer lets you
synchronize over the browser's BroadcastChannel API, common to each browser
sub-system. You simply need to provide a distinguishing channel name that can be
used to identify what the two parts should be using to send and receive
messages.

For example, in the UI part of your app:

```js
import {createBroadcastChannelSynchronizer} from 'tinybase/synchronizers/synchronizer-broadcast-channel';

const frontStore = createMergeableStore();
const frontSynchronizer = createBroadcastChannelSynchronizer(
  frontStore,
  'syncChannel',
);
await frontSynchronizer.startSync();
```

And then in the service worker:

```js
const backStore = createMergeableStore();
const backSynchronizer = createBroadcastChannelSynchronizer(
  backStore,
  'syncChannel',
);
await backSynchronizer.startSync();
```

Since they both share the `syncChannel` channel name, the data of the two is now
synchronized:

```js
frontStore.setCell('pets', 'fido', 'species', 'dog');
```

```js
// ...
console.log(backStore.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

And so on!

When finished, these synchronizers should also be explicitly destroyed to ensure
the channel listeners are cleaned up:

```js
await frontSynchronizer.destroy();
```

```js
await backSynchronizer.destroy();
```

## Wrapping Up

The Synchronizer interface provides an easy way to keep multiple TinyBase
MergeableStores in sync. The WebSocket and BroadcastChannel options above allow
for numerous interesting and powerful app architectures - and they are not
sufficient, consider exploring the createCustomSynchronizer function to develop
your own!
