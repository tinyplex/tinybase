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

TinyBase includes a simple implementation of such a server. You simply need to
create it, instantiated with a configured WebSocketServer object from the `ws`
package:

```js
// On a server machine:
import {WebSocketServer} from 'ws';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
const server = createWsServer(new WebSocketServer({port: 8048}));
```

This sets up a WsServer object, listening on port 8048.

Each client then needs to create a WsSynchronizer object, instantiated with the
MergeableStore being synchronized, and a WebSocket configured to connect to the
aforementioned server:

```js
// On the first client machine:
import {WebSocket} from 'ws';
import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';

const clientStore1 = createMergeableStore();
const clientSynchronizer1 = await createWsSynchronizer(
  clientStore1,
  new WebSocket('ws://localhost:8048'),
);
```

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
  new WebSocket('ws://localhost:8048'),
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
clientSynchronizer1.destroy();
```

```js
clientSynchronizer2.destroy();
```

And, if shut down, the WsServer should also be explicitly destroyed to close its
listeners:

```js
server.destroy();
```

### Persisting Data On The Server

New in TinyBase v5.1, the createWsServer function lets you specify a way to
persist data to the server. This makes it possible for all clients to disconnect
from a path, but, when they reconnect, for the data to still be present for them
to sync with.

This is done by passing in a second argument to the function that creates a
Persister instance (for which also need to create or provide a MergeableStore)
for a given path:

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

persistingServer.destroy();
```

This is a very crude example, but demonstrates a server that will create a file,
based on any path that clients connect to, and persist data to it. In
production, you will certainly want to sanitize the file name! And more likely
you will want to explore using a database-oriented Persister instead of simply
using raw files.

See the createWsServer function documentation for more details.

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
frontSynchronizer.destroy();
```

```js
backSynchronizer.destroy();
```

## Wrapping Up

The Synchronizer interface provides an easy way to keep multiple TinyBase
MergeableStores in sync. The WebSocket and BroadcastChannel options above allow
for numerous interesting and powerful app architectures - and they are not
sufficient, consider exploring the createCustomSynchronizer function to develop
your own!

We now move on to ways in which TinyBase can be used like a database, starting
with the Using Metrics guide.
