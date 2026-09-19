# TinyBase On Cloudflare Durable Objects

A Durable Object is the recommended production WebSocket server for TinyBase
synchronization. One Durable Object instance per URL path holds the connected
clients and, optionally, a durable server-side copy of the data.

Do not invent Durable Object APIs. The entire server surface is the
`WsServerDurableObject` class and the `getWsServerDurableObjectFetch` function,
both from `tinybase/synchronizers/synchronizer-ws-server-durable-object`.

The fastest correct start is to generate the whole stack and then edit it:

```sh
npm create tinybase@latest -- \
  --non-interactive \
  --projectName my-app \
  --appType todos \
  --language typescript \
  --framework react \
  --syncType durable-objects \
  --persistenceType none \
  --installAndRun false
```

## The Server

```ts
import {createMergeableStore, type IdAddedOrRemoved} from 'tinybase';
import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
import {
  getWsServerDurableObjectFetch,
  WsServerDurableObject,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

export class TinyBaseDurableObject extends WsServerDurableObject {
  createPersister() {
    const store = createMergeableStore();
    return createDurableObjectSqlStoragePersister(store, this.ctx.storage.sql);
  }

  onClientId(
    pathId: string,
    clientId: string,
    addedOrRemoved: IdAddedOrRemoved,
  ) {
    console.log(
      `Client ${clientId} ${addedOrRemoved == 1 ? 'joined' : 'left'} /${pathId}`,
    );
  }
}

export default {fetch: getWsServerDurableObjectFetch('TinyBaseDurableObjects')};
```

Three things must line up, and they are the usual source of a broken deploy:

1. The class is exported from the worker entry point.
2. Its name matches `class_name` in the Wrangler configuration.
3. The string passed to `getWsServerDurableObjectFetch` is the binding **name**,
   not the class name.

## Wrangler Configuration

```toml
name = "my-app-server"
main = "index.ts"
compatibility_date = "2024-10-11"

[[durable_objects.bindings]]
name = "TinyBaseDurableObjects"
class_name = "TinyBaseDurableObject"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["TinyBaseDurableObject"]
```

Use `new_sqlite_classes` when the Durable Object uses SQLite storage, which it
does when `createPersister` returns a `DurableObjectSqlStoragePersister`. Use
`new_classes` for key-value storage only. A missing `[[migrations]]` block is
why a first deploy fails.

Install `wrangler` and `@cloudflare/workers-types` as dev dependencies, and
`tinybase` as a dependency, in the server package. Run `wrangler dev` locally
and `wrangler deploy` to ship.

## Server Persistence

`createPersister()` is optional. Without it the Durable Object relays messages
between clients but keeps nothing, so data survives only as long as at least one
client holds it.

Implement it to keep a durable server copy. The method may be synchronous or
asynchronous, and must return a `Persister<Persists.MergeableStoreOnly>` over a
MergeableStore. Two Persisters fit:

| Import                                                     | Create                                                                | Storage                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| `tinybase/persisters/persister-durable-object-sql-storage` | `createDurableObjectSqlStoragePersister(store, this.ctx.storage.sql)` | Durable Object SQLite    |
| `tinybase/persisters/persister-durable-object-storage`     | `createDurableObjectStoragePersister(store, this.ctx.storage)`        | Durable Object key-value |

Prefer the SQLite variant for anything beyond trivial data. Do not call
`load()`, `startAutoPersisting()`, or `destroy()` on it yourself — return the
Persister and `WsServerDurableObject` manages its lifecycle.

Neither Persister accepts a plain Store. Always `createMergeableStore()`.

## The Client

```ts
import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import ReconnectingWebSocket from 'reconnecting-websocket';

const store = createMergeableStore();
const synchronizer = await createWsSynchronizer(
  store,
  new ReconnectingWebSocket('wss://my-app-server.workers.dev/' + roomId),
);
await synchronizer.startSync();

synchronizer.getWebSocket().addEventListener('open', () => {
  synchronizer.load().then(() => synchronizer.save());
});
```

See [lifecycle.md](lifecycle.md) for why the `open` handler matters and how to
wire this in React or Solid.

## Paths

The URL path is the room. Every client connecting to `/roomA` reaches one
Durable Object instance; `/roomB` reaches a different one. They share nothing.

Shared WebSockets and channel Ids — the optional third argument to
`createWsSynchronizer` — are **not** supported by `WsServerDurableObject`,
because each path is a separate instance. Use `WsServer` or `WsServerSimple` if
several Stores must multiplex over one socket.

## Overridable Methods

Override only what is needed. Every method has a working default.

| Method                                           | Purpose                                                  |
| ------------------------------------------------ | -------------------------------------------------------- |
| `createPersister()`                              | Return a server-side Persister, or nothing               |
| `getPathId()`                                    | The path this instance serves                            |
| `getClientIds()`                                 | Currently connected client Ids                           |
| `getFragmentSize()`                              | Message fragment size, or `undefined` for no fragmenting |
| `getRequestTimeoutSeconds()`                     | Synchronization request timeout                          |
| `onPathId(pathId, addedOrRemoved)`               | A path started or stopped being served                   |
| `onClientId(pathId, clientId, addedOrRemoved)`   | A client joined or left                                  |
| `onMessage(fromClientId, toClientId, remainder)` | Observe relayed messages                                 |
| `onIgnoredError(error)`                          | Observe errors that are otherwise swallowed              |

`addedOrRemoved` is `1` for added and `-1` for removed.

## Authentication

`getWsServerDurableObjectFetch` performs no authentication. It requires a
WebSocket `Upgrade` request carrying a `sec-websocket-key` header, and routes on
the request path alone.

For authenticated deployments, write the worker's `fetch` handler directly:
validate the request, then forward a request of your own to the Durable Object
stub. Rewriting the path at that point is the supported way to scope a client to
a verified user or tenant, rather than trusting a path the client chose.

Client Ids are derived from the `Sec-WebSocket-Key` header. They change across
reconnections and are not identities. Do not authorize on them.

## Verifying

Run `wrangler dev`, open two clients on the same path, and confirm changes
propagate both ways. Then reload one client and confirm the data is still there,
which is what proves `createPersister` is working rather than just the relay.
