# Cloudflare Durable Objects

[Durable Objects](https://developers.cloudflare.com/durable-objects/) are a new
type of serverless compute platform from Cloudflare, and provide a way to run
stateful applications in a serverless environment, without needing to manage
infrastructure.

## What Are Durable Objects?

Each Durable Object can function as a WebSocket server, so it can co-ordinate
messages between multiple clients. But importantly, it also has private,
transactional and strongly consistent storage attached. Combined with a TinyBase
Store on the client, and using the built-in synchronization and persistence
functionality, this gives you an full-stack way to build complex, real-time,
multi-device (and even collaborative) apps.

![Durable Objects](/durable.svg 'Durable Objects')

As this guide hopefully shows, this can be done with minimal effort!

## Getting Started with Vite

The quickest way to get started with TinyBase and Cloudflare Durable Objects is
to use our [Vite
template](https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object).
This includes both a client implementation (that by default connects to a demo
server we provide) and a server implementation that you can instead use for your
own Cloudflare installation.

### Install The Client

1. Make a copy of the template into a new directory:

```sh
npx tiged tinyplex/vite-tinybase-ts-react-sync-durable-object my-tinybase-app
```

2. Go into the client directory:

```sh
cd my-tinybase-app/client
```

3. Install the dependencies:

```sh
npm install
```

4. Run the application:

```sh
npm run dev
```

5. Go the URL shown and enjoy!

![Vite app](/vite-tinybase-sync.png 'Vite app')

### Run Your Own Server

This template uses a lightweight socket server on `vite.tinybase.cloud` to
synchronize data between clients. This is fine for a demo but not intended as a
production server for your apps!

If you wish to run your own instance, see the `server` directory and start from
there.

The `vite.tinybase.cloud` server is hosted on Cloudflare (of course), so you
should adapt the `wrangler.toml` configuration in the server directory. Update
it to match your account, domains, and required configuration. In the `index.ts`
file, you can configure whether data will be stored in the Durable Object or
just synchronized between clients.

You will also have to have your client communicate with your new server by
configuring the `SERVER` constant at the top of the client's `App.tsx` file.

## How It All Works

### Client: Persistence and Synchronization

On the client, we create a simple TinyBase MergeableStore to encapsulate the
data we need for the app. The following are simplified extracts of the code in
the `App.tsx` file of the Vite template:

```js yolo
export const App = () => {
  const store = useCreateMergeableStore(createMergeableStore);
  // ...
```

(Because the template is using React, we use the `useCreateMergeableStore` hook
so it's not re-created on every render.)

We also create a local Persister so that if the client goes offline, and the
browser window is refreshed, changes will have been cached locally in session
storage, with a key 'foo':

```js yolo
// ...
useCreatePersister(
  store,
  (store) => createLocalPersister(store, 'foo'),
  [],
  async (persister) => {
    await persister.startAutoLoad(/* any initial contents */);
    await persister.startAutoSave();
  },
);
// ...
```

More interestingly, we also set up a Synchronizer that connects to the
Cloudflare installation, on a path that also happens to be called 'foo':

```js yolo
// ...
useCreateSynchronizer(store, async (store) => {
  const synchronizer = await createWsSynchronizer(
    store,
    new WebSocket('wss://example.com/foo'),
  );
  await synchronizer.startSync();
  return synchronizer;
});
```

Those simple lines are enough to have the Store attempt to synchronize itself
with the common Durable Object called `/foo` on the server.

### Server: Worker and Durable Object

On the server, Cloudflare needs us to configure a worker and Durable Object. It
will help if you are familiar with these concepts already - and if not, start
with the documentation
[here](https://developers.cloudflare.com/durable-objects/get-started/walkthrough/).

Following the instructions above, you'll have a `wrangler.toml` file containing
the configuration for your worker and the Durable Object. In there you'll need
to bind a namespace of Durable Objects to a class, something like:

```toml
[[durable_objects.bindings]]
name = "TinyBaseDurableObjects"
class_name = "TinyBaseDurableObject"

[[migrations]]
tag = "v1"
new_classes = ["TinyBaseDurableObject"]
```

(Again, take a look at the contents of the Vite template for the full
configuration file.)

In the main worker file, probably called `index.js` or `index.ts`, you'll need
to configure the worker as the default export from the file. TinyBase provides a
convenience getWsServerDurableObjectFetch function that will create a `fetch`
method that routes WebSocket requests based on the path of the URL:

```js yolo
export default {
  fetch: getWsServerDurableObjectFetch('TinyBaseDurableObjects'),
};
```

In here, the argument is the namespace containing your bound Durable Objects.

Now we need to create the Durable Object itself. This can be as simple as simply
extending TinyBase's WsServerDurableObject class:

```js yolo
export class TinyBaseDurableObject extends WsServerDurableObject {
  // ...
}
```

This sets up synchronization between any clients that connect to this common
`/foo` path so that their Store data stays in sync.

But if all your clients disconnect and flush their locally-stored data, it is
technically possible to lose it all! So it's also a good idea to have the
Durable Object store a synchronized copy too. We do this by overriding the
createPersister method:

```js yolo
// ...
createPersister() {
  return createDurableObjectStoragePersister(
    createMergeableStore(),
    this.ctx.storage,
  );
}
// ...
```

In this method, all we need to do is create a MergeableStore (that will reside
in the Durable Object memory whenever it is running and not hibernated), and
indicate how it will be persisted. Almost always you will want to return a
DurableObjectStoragePersister object, which is dedicated to storing a TinyBase
Store in Durable Object storage - as indicated by the `this.ctx.storage`
argument.

With this in place you now have the full set up! The clients are storing a local
copy of the TinyBase data so they can go offline and reload without loss of
data; and the server is also storing a copy of the data in Durable Object
storage. When online, the clients will connect to the worker, which routes the
request to the Durable Object indicated by the URL path, and synchronization
between them all keeps them each up-to-date!

## Final Notes

Durable Objects have limitations on the data that can be stored in each key of
their key-value structure. The DurableObjectStoragePersister uses one key per
TinyBase Value, one key per Cell, one key per Row, and one key per Table. Mostly
this is CRDT metadata, but the main caution is to ensure that each individual
TinyBase Cell and Value data does not exceed the (128 KiB) limit.

The WsServerDurableObject is an overridden implementation of the DurableObject
class, so you can have access to its members as well as the TinyBase-specific
methods. If you are using the storage for other data, you may want to configure
a `prefix` parameter to ensure you don't accidentally collide with TinyBase
data.

Also, always remember to call the `super` implementations of the methods that
TinyBase uses (the constructor, `fetch`, `webSocketMessage`, and
`webSocketClose`) if you further override them.

Finally, the WsServerDurableObject uses hibernation, which is a Cloudflare
feature to minimize the amount of memory used by your Durable Object. After a
small amount of time with no WebSocket activity, it will be 'hibernated' even
though the WebSockets stay connected. This means that the in-memory TinyBase
Store will be removed (which is a good thing for your Cloudflare usage!) and
then re-created with the Persister when new activity arrives. This lifecycle
should be transparent, but should be understood if you want to debug certain
Durable Object behaviors.
