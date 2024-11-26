<p>This is a reverse chronological list of the major TinyBase releases, with highlighted features.</p><hr><h1 id="v5-4">v5.4</h1><h2 id="durable-objects-synchronization">Durable Objects synchronization</h2><p>This release contains a new WebSocket synchronization server that runs on Cloudflare as a Durable Object.</p><p><embed src="https://tinybase.org/durable.svg" title="Durable Objects"></p><p>It&#x27;s in the new <a href="https://tinybase.org/api/synchronizer-ws-server-durable-object/"><code>synchronizer-ws-server-durable-object</code></a> module, and you use it by extending the <a href="https://tinybase.org/api/synchronizer-ws-server-durable-object/classes/creation/wsserverdurableobject/"><code>WsServerDurableObject</code></a> class. Use the <a href="https://tinybase.org/api/synchronizer-ws-server-durable-object/functions/creation/getwsserverdurableobjectfetch/"><code>getWsServerDurableObjectFetch</code></a> function for conveniently binding your Cloudflare Worker to your Durable Object:</p>

```js yolo
import {
  WsServerDurableObject,
  getWsServerDurableObjectFetch,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

export class MyDurableObject extends WsServerDurableObject {}

export default {fetch: getWsServerDurableObjectFetch('MyDurableObjects')};
```

<p>For the above code to work, you&#x27;ll need to have a Wrangler configuration that connects the <code>MyDurableObject</code> class to the <code>MyDurableObjects</code> namespace. In other words, you&#x27;ll have something like this in your <code>wrangler.toml</code> file:</p>

```toml
[[durable_objects.bindings]]
name = "MyDurableObjects"
class_name = "MyDurableObject"
```

<p>With this you can now easily connect and synchronize clients that are using the <a href="https://tinybase.org/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/"><code>WsSynchronizer</code></a> synchronizer.</p><h2 id="durable-objects-persistence">Durable Objects <a href="https://tinybase.org/guides/persistence/">Persistence</a></h2><p>But wait! There&#x27;s more. Durable Objects also provide a storage mechanism, and sometimes you want TinyBase data to also be stored on the server (in case all the current clients disconnect and a new one joins, for example). So this release of TinyBase also includes a dedicated persister, the <a href="https://tinybase.org/api/persister-durable-object-storage/interfaces/persister/durableobjectstoragepersister/"><code>DurableObjectStoragePersister</code></a>, that also synchronizes the data to the Durable Object storage layer.</p><p>You create it with the <a href="https://tinybase.org/api/persister-durable-object-storage/functions/creation/createdurableobjectstoragepersister/"><code>createDurableObjectStoragePersister</code></a> function, and hook it into the Durable Object by returning it from the <a href="https://tinybase.org/api/synchronizer-ws-server-durable-object/classes/creation/wsserverdurableobject/methods/creation/createpersister/"><code>createPersister</code></a> method of your <a href="https://tinybase.org/api/synchronizer-ws-server-durable-object/classes/creation/wsserverdurableobject/"><code>WsServerDurableObject</code></a>:</p>

```js yolo
export class MyDurableObject extends WsServerDurableObject {
  createPersister() {
    return createDurableObjectStoragePersister(
      createMergeableStore(),
      this.ctx.storage,
    );
  }
}
```

<p>You can get started quickly with this architecture using the <a href="https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object">new Vite template</a> that accompanies this release.</p><h2 id="server-reference-implementation">Server Reference Implementation</h2><p>Unrelated to Durable Objects, this release also includes the new <a href="https://tinybase.org/api/synchronizer-ws-server-simple/"><code>synchronizer-ws-server-simple</code></a> module that contains a simple server implementation called <a href="https://tinybase.org/api/synchronizer-ws-server-simple/interfaces/server/wsserversimple/"><code>WsServerSimple</code></a>. Without the complications of listeners, persistence, or statistics, this is more suitable to be used as a reference implementation for other server environments.</p><h2 id="architectural-guide">Architectural Guide</h2><p>To go with this release, we have added new documentation on ways in which you can use TinyBase in an app architecture. Check it out in the new <a href="https://tinybase.org/guides/the-basics/architectural-options/">Architectural Options</a> guide.</p><p>We&#x27;ve also started a new section of documentation for describing integrations, of which the <a href="https://tinybase.org/guides/integrations/cloudflare-durable-objects/">Cloudflare Durable Objects</a> guide, of course, is the first new entry!</p><hr><h1 id="v5-3">v5.3</h1><p>This release is focussed on a few API improvements and quality-of-life changes. These include:</p><h2 id="react-ssr-support">React SSR support</h2><p>Thanks to contributor <a href="https://github.com/muhajirdev">Muhammad Muhajir</a> for ensuring that TinyBase runs in server-side rendering environments!</p><h2 id="in-the-persisters-module">In the <a href="https://tinybase.org/api/persisters/"><code>persisters</code></a> module...</h2><p>All <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> objects now expose information about whether they are loading or saving. To access this <a href="https://tinybase.org/api/persisters/enumerations/lifecycle/status/"><code>Status</code></a>, use:</p><ul><li>The <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/lifecycle/getstatus/"><code>getStatus</code></a> method, which will return 0 when it is idle, 1 when it is loading, and 2 when it is saving.</li><li>The <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/listener/addstatuslistener/"><code>addStatusListener</code></a> method, which lets you add a <a href="https://tinybase.org/api/persisters/type-aliases/listener/statuslistener/"><code>StatusListener</code></a> function and which is called whenever the status changes.</li></ul><p>These make it possible to track background load and save activities, so that, for example, you can show a status-bar spinner of asynchronous persistence activity.</p><h2 id="in-the-synchronizers-module">In the <a href="https://tinybase.org/api/synchronizers/"><code>synchronizers</code></a> module...</h2><p>Synchronizers are a sub-class of <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a>, so all <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a> objects now also have:</p><ul><li>The <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/lifecycle/getstatus/"><code>getStatus</code></a> method, which will return 0 when it is idle, 1 when it is &#x27;loading&#x27; (ie inbound syncing), and 2 when it is &#x27;saving&#x27; (ie outbound syncing).</li><li>The <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/listener/addstatuslistener/"><code>addStatusListener</code></a> method, which lets you add a <a href="https://tinybase.org/api/persisters/type-aliases/listener/statuslistener/"><code>StatusListener</code></a> function and which is called whenever the status changes.</li></ul><h2 id="in-the-ui-react-module">In the <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module...</h2><p>There are corresponding hooks so that you can build these status changes into a React UI easily:</p><ul><li>The <a href="https://tinybase.org/api/ui-react/functions/persister-hooks/usepersisterstatus/"><code>usePersisterStatus</code></a> hook, which will return the status for an explicitly provided, or context-derived <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a>.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/persister-hooks/usepersisterstatuslistener/"><code>usePersisterStatusListener</code></a> hook, which lets you add your own <a href="https://tinybase.org/api/persisters/type-aliases/listener/statuslistener/"><code>StatusListener</code></a> function to a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a>.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/persister-hooks/usepersister/"><code>usePersister</code></a> hook, which lets you get direct access to a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> from within your UI.</li></ul><p>And correspondingly for Synchronizers:</p><ul><li>The <a href="https://tinybase.org/api/ui-react/functions/synchronizer-hooks/usesynchronizerstatus/"><code>useSynchronizerStatus</code></a> hook, which will return the status for an explicitly provided, or context-derived <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a>.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/synchronizer-hooks/usesynchronizerstatuslistener/"><code>useSynchronizerStatusListener</code></a> hook, which lets you add your own <a href="https://tinybase.org/api/persisters/type-aliases/listener/statuslistener/"><code>StatusListener</code></a> function to a <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a>.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/synchronizer-hooks/usesynchronizer/"><code>useSynchronizer</code></a> hook, which lets you get direct access to a <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a> from within your UI.</li></ul><p>In addition, this module also now includes hooks for injecting objects into the Provider context scope imperatively, much like the existing <a href="https://tinybase.org/api/ui-react/functions/store-hooks/useprovidestore/"><code>useProvideStore</code></a> hook:</p><ul><li>The <a href="https://tinybase.org/api/ui-react/functions/metrics-hooks/useprovidemetrics/"><code>useProvideMetrics</code></a> hook, which lets you imperatively register <a href="https://tinybase.org/api/metrics/interfaces/metrics/metrics/"><code>Metrics</code></a> objects.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/other/useprovideindexes/"><code>useProvideIndexes</code></a> hook, which lets you register <a href="https://tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> objects.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/other/useproviderelationships/"><code>useProvideRelationships</code></a> hook, which lets you register <a href="https://tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> objects.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/other/useprovidequeries/"><code>useProvideQueries</code></a> hook, which lets you register <a href="https://tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> objects.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/other/useprovidecheckpoints/"><code>useProvideCheckpoints</code></a> hook, which lets you register <a href="https://tinybase.org/api/checkpoints/interfaces/checkpoints/checkpoints/"><code>Checkpoints</code></a> objects.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/other/useprovidepersister/"><code>useProvidePersister</code></a> hook, which lets you register <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> objects.</li><li>The <a href="https://tinybase.org/api/ui-react/functions/other/useprovidesynchronizer/"><code>useProvideSynchronizer</code></a> hook, which lets you register <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a> objects.</li></ul><p>All of these new methods have extensive documentation, each with examples to show how to use them.</p><p>Please provide feedback on this new release on GitHub!</p><hr><h1 id="v5-2">v5.2</h1><p>This release introduces new Persisters for... PostgreSQL! TinyBase now has two new <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> modules:</p><ul><li>The <a href="https://tinybase.org/api/persister-postgres/"><code>persister-postgres</code></a> module provides the <a href="https://tinybase.org/api/persister-postgres/interfaces/persister/postgrespersister/"><code>PostgresPersister</code></a>, which uses the excellent <a href="https://github.com/porsager/postgres"><code>postgres</code></a> module to bind to regular PostgreSQL databases, generally on a server.</li><li>The <a href="https://tinybase.org/api/persister-pglite/"><code>persister-pglite</code></a> module provides the <a href="https://tinybase.org/api/persister-pglite/interfaces/persister/pglitepersister/"><code>PglitePersister</code></a>, which uses the new and exciting <a href="https://github.com/electric-sql/pglite"><code>pglite</code></a> module for running PostgreSQL... in a browser!</li></ul><p>Conceptually, things behave in the same way as they do for the various SQLite persisters. Simply use the <a href="https://tinybase.org/api/persister-postgres/functions/creation/createpostgrespersister/"><code>createPostgresPersister</code></a> function (or the similar <a href="https://tinybase.org/api/persister-pglite/functions/creation/createpglitepersister/"><code>createPglitePersister</code></a> function) to persist your TinyBase data:</p>

```js
import postgres from 'postgres';
import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
import {createStore} from 'tinybase';

// Create a TinyBase Store.
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});

// Create a postgres connection and Persister.
const sql = postgres('postgres://localhost:5432/tinybase');
const pgPersister = await createPostgresPersister(store, sql, 'my_tinybase');

// Save Store to the database.
await pgPersister.save();

console.log(await sql`SELECT * FROM my_tinybase;`);
// -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
```

<p>And, as per usual, you can update the database and have TinyBase automatically reflect those changes:</p>

```js
// If separately the database gets updated...
const json = '[{"pets":{"felix":{"species":"cat"}}},{}]';
await sql`UPDATE my_tinybase SET store = ${json} WHERE _id = '_';`;

// ... then changes are loaded back. Reactive auto-load is also supported!
await pgPersister.load();
console.log(store.getTables());
// -> {pets: {felix: {species: 'cat'}}}

// As always, don't forget to tidy up.
pgPersister.destroy();
await sql.end();
```

<p>Note that these two <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> objects support both the <code>json</code> and <code>tabular</code> modes for saving TinyBase data into the database. See the <a href="https://tinybase.org/api/persisters/type-aliases/configuration/databasepersisterconfig/"><code>DatabasePersisterConfig</code></a> type for more details. (Note however that, like the SQLite Persisters, only the <code>json</code> mode is supported for <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> instances, due to their additional CRDT metadata.)</p><p>This release also exposes the new <a href="https://tinybase.org/api/persisters/functions/creation/createcustomsqlitepersister/"><code>createCustomSqlitePersister</code></a> function and <a href="https://tinybase.org/api/persisters/functions/creation/createcustompostgresqlpersister/"><code>createCustomPostgreSqlPersister</code></a> function at the top level of the persister module. These can be used to build <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> objects against SQLite and PostgreSQL SDKs (or forks) that are not already included with TinyBase.</p><h2 id="minor-breaking-change">Minor breaking change</h2><p>It&#x27;s very unlikely to affect most apps, but also be aware that the <a href="https://tinybase.org/api/persisters/"><code>persisters</code></a> module and <a href="https://tinybase.org/api/synchronizers/"><code>synchronizers</code></a> module are no longer bundled in the &#x27;master&#x27; tinybase module. If you are using them (most likely because you have built a custom <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> or <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a>), you will need to update your imports accordingly to the standalone <code>tinybase/persisters</code> and <code>tinybase/synchronizers</code> versions of them. Apologies.</p><hr><h1 id="v5-1">v5.1</h1><p>This release lets you persist data on a server using the <a href="https://tinybase.org/api/synchronizer-ws-server/functions/creation/createwsserver/"><code>createWsServer</code></a> function. This makes it possible for all clients to disconnect from a path, but, when they reconnect, for the data to still be present for them to sync with.</p><p>This is done by passing in a second argument to the <a href="https://tinybase.org/api/synchronizer-ws-server/functions/creation/createwsserver/"><code>createWsServer</code></a> function that creates a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> instance (for which also need to create or provide a <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a>) for a given path:</p>

```js
import {WebSocketServer} from 'ws';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {createMergeableStore} from 'tinybase';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';

const persistingServer = createWsServer(
  new WebSocketServer({port: 8051}),
  (pathId) =>
    createFilePersister(
      createMergeableStore(),
      pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);

persistingServer.destroy();
```

<p>This is a very crude (and not production-safe!) example, but demonstrates a server that will create a file, based on any path that clients connect to, and persist data to it. See the <a href="https://tinybase.org/api/synchronizer-ws-server/functions/creation/createwsserver/"><code>createWsServer</code></a> function documentation for more details.</p><p>This implementation is still experimental so please kick the tires!</p><p>There is one small breaking change in this release: the functions for creating <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a> objects can now take optional onSend and onReceive callbacks that will fire whenever messages pass through the <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a>. See, for example, the <a href="https://tinybase.org/api/synchronizer-ws-client/functions/creation/createwssynchronizer/"><code>createWsSynchronizer</code></a> function. These are suitable for debugging synchronization issues in a development environment.</p><hr><h1 id="v5-0">v5.0</h1><p>We&#x27;re excited to announce this major release for TinyBase! It includes important data synchronization functionality and a range of other improvements.</p><h1 id="in-summary">In Summary</h1><ul><li><a href="#the-new-mergeableStore-type">The new MergeableStore type</a> wraps your data as a Conflict-Free Replicated Data Type (CRDT).</li><li><a href="#the-new-synchronizer-framework">The new Synchronizer framework</a> keeps multiple instances of data in sync across different media.</li><li>An <a href="#improved-module-folder-structure">improved module folder structure</a> removes common packaging and bundling issues.</li><li>The TinyBase Inspector is now in its own standalone <a href="https://tinybase.org/api/ui-react-inspector/"><code>ui-react-inspector</code></a> module.</li><li>TinyBase now supports only Expo SQLite v14 (<a href="https://expo.dev/changelog/2024/05-07-sdk-51">SDK 51</a>) and above.</li></ul><p>There are also some small <a href="#breaking-changes-in-v50">breaking changes</a> that may affect you (but which should easy to fix if they do).</p><p>Let&#x27;s look at the major functionality in more detail!</p><h2 id="the-new-mergeablestore-type">The New <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> Type</h2><p>A key part of TinyBase v5.0 is the new <a href="https://tinybase.org/api/mergeable-store/"><code>mergeable-store</code></a> module, which contains a subtype of <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> - called <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> - that can be merged with another with deterministic results. The implementation uses an encoded hybrid logical clock (HLC) to timestamp the changes made so that they can be cleanly merged.</p><p>The <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/getter/getmergeablecontent/"><code>getMergeableContent</code></a> method on a <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> is used to get the state of a store that can be merged into another. The <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/setter/applymergeablechanges/"><code>applyMergeableChanges</code></a> method will let you apply that to (another) store. The <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/setter/merge/"><code>merge</code></a> method is a convenience function to bidirectionally merge two stores together:</p>

```js
const localStore1 = createMergeableStore();
const localStore2 = createMergeableStore();

localStore1.setCell('pets', 'fido', 'species', 'dog');
localStore2.setCell('pets', 'felix', 'species', 'cat');

localStore1.merge(localStore2);

console.log(localStore1.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]

console.log(localStore2.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]
```

<p>Please read the new <a href="https://tinybase.org/guides/synchronization/using-a-mergeablestore/">Using A MergeableStore</a> guide for more details of how to use this important new API.</p><p>A <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> can be persisted locally, just like a regular <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> into file, local and session storage, and simple SQLite environments such as Expo and SQLite3. These allow you to save the state of a <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> locally before it has had the chance to be synchronized online, for example.</p><p>Which leads us onto the next important feature in v5.0, allowing you to synchronize stores between systems...</p><h2 id="the-new-synchronizer-framework">The New <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a> Framework</h2><p>The v5.0 release also introduces the new concept of synchronization. <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a> objects implement a negotiation protocol that allows multiple <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> objects to be merged together. This can be across a network, using WebSockets, for example:</p>

```js
import {WebSocket} from 'ws';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';

// On a server machine:
const server = createWsServer(new WebSocketServer({port: 8043}));

// On the first client machine:
const store1 = createMergeableStore();
const synchronizer1 = await createWsSynchronizer(
  store1,
  new WebSocket('ws://localhost:8043'),
);
await synchronizer1.startSync();
store1.setCell('pets', 'fido', 'legs', 4);

// On the second client machine:
const store2 = createMergeableStore();
const synchronizer2 = await createWsSynchronizer(
  store2,
  new WebSocket('ws://localhost:8043'),
);
await synchronizer2.startSync();
store2.setCell('pets', 'felix', 'price', 5);
// ...

console.log(store1.getTables());
// -> {pets: {felix: {price: 5}, fido: {legs: 4}}}
console.log(store2.getTables());
// -> {pets: {felix: {price: 5}, fido: {legs: 4}}}

synchronizer1.destroy();
synchronizer2.destroy();
server.destroy();
```

<p>This release includes three types of <a href="https://tinybase.org/api/synchronizers/interfaces/synchronizer/synchronizer/"><code>Synchronizer</code></a>:</p><ul><li>The <a href="https://tinybase.org/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/"><code>WsSynchronizer</code></a> uses WebSockets to communicate between different systems as shown above.</li><li>The <a href="https://tinybase.org/api/synchronizer-broadcast-channel/interfaces/synchronizer/broadcastchannelsynchronizer/"><code>BroadcastChannelSynchronizer</code></a> uses the browser&#x27;s BroadcastChannel API to communicate between different tabs and workers.</li><li>The <a href="https://tinybase.org/api/synchronizer-local/interfaces/synchronizer/localsynchronizer/"><code>LocalSynchronizer</code></a> demonstrates synchronization in memory on a single local system.</li></ul><p>Notice that the <a href="https://tinybase.org/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/"><code>WsSynchronizer</code></a> assumes that there exists a server that can forward requests to other <a href="https://tinybase.org/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/"><code>WsSynchronizer</code></a> systems. This can be created using the <a href="https://tinybase.org/api/synchronizer-ws-server/functions/creation/createwsserver/"><code>createWsServer</code></a> function that takes a WebSocketServer as also shown above.</p><p>Please read the new <a href="https://tinybase.org/guides/synchronization/using-a-synchronizer/">Using A Synchronizer</a> guide for more details of how to synchronize your data.</p><h2 id="improved-module-folder-structure">Improved Module Folder Structure</h2><p>We have previously found issues with legacy bundlers and other tools that didn&#x27;t fully support the new <code>exports</code> field in the module&#x27;s package.</p><p>To mitigate that, the TinyBase distribution now has a top-level folder structure that fully echoes the import paths, including signifiers for JavaScript versions, schema support, minification and so on.</p><p>Please read the comprehensive <a href="https://tinybase.org/guides/the-basics/importing-tinybase/">Importing TinyBase</a> guide for more details of how to construct the correct import paths in v5.0.</p><h2 id="breaking-changes-in-v5-0">Breaking <a href="https://tinybase.org/api/store/type-aliases/transaction/changes/"><code>Changes</code></a> in v5.0</h2><h3 id="module-file-structure">Module File Structure</h3><p>If you previously had <code>/lib/</code> in your import paths, you should remove it. You also do not have to explicitly specify whether you need the <code>cjs</code> version of TinyBase - if you are using a <code>require</code> rather than an <code>import</code>, you will get it automatically.</p><p>The non-minified version of the code is now default and you need to be explicit when you <em>want</em> minified code. Previously you would add <code>/debug</code> to the import path to get non-minified code, but now you add <code>/min</code> to the import path to get <em>minified</em> code.</p><h3 id="expo-sqlite-persister">Expo SQLite <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a></h3><p>Previously the <a href="https://tinybase.org/api/persister-expo-sqlite/"><code>persister-expo-sqlite</code></a> module supported expo-sqlite v13 and the persister-expo-sqlite-next module supported their modern &#x27;next&#x27; package. In v5.0, the <a href="https://tinybase.org/api/persister-expo-sqlite/"><code>persister-expo-sqlite</code></a> module only supports v14 and later, and the persister-expo-sqlite-next module has been removed.</p><h3 id="the-tinybase-inspector">The TinyBase Inspector</h3><p>Previously, the React-based inspector (then known as <code>StoreInspector</code>) resided in the debug version of the <a href="https://tinybase.org/api/ui-react-dom/"><code>ui-react-dom</code></a> module. It now lives in its own <a href="https://tinybase.org/api/ui-react-inspector/"><code>ui-react-inspector</code></a> module (so that it can be used against non-debug code) and has been renamed to Inspector.</p><p>Please update your imports and rename the component when used, accordingly. See the API documentation for details, or the <a href="https://tinybase.org/demos/ui-components/inspector/"><inspector></inspector></a>demo, for example.</p><h3 id="api-changes">API <a href="https://tinybase.org/api/store/type-aliases/transaction/changes/"><code>Changes</code></a></h3><p>The following changes have been made to the existing TinyBase API for consistency. These are less common parts of the API but should straightforward to correct if you are using them.</p><p>In the type definitions:</p><ul><li>The GetTransactionChanges and GetTransactionLog types have been removed.</li><li>The TransactionChanges type has been renamed as the <a href="https://tinybase.org/api/store/type-aliases/transaction/changes/"><code>Changes</code></a> type.</li><li>The <a href="https://tinybase.org/api/store/type-aliases/transaction/changes/"><code>Changes</code></a> type now uses <code>undefined</code> instead of <code>null</code> to indicate a <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> or <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a> that has been deleted or that was not present.</li><li>The <a href="https://tinybase.org/api/store/type-aliases/transaction/transactionlog/"><code>TransactionLog</code></a> type is now an array instead of a JavaScript object.</li></ul><p>In the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> interface:</p><ul><li>There is a new <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/gettransactionchanges/"><code>getTransactionChanges</code></a> method and a new getTransactionLog method.</li><li>The setTransactionChanges method is renamed as the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/applychanges/"><code>applyChanges</code></a> method.</li><li>A <a href="https://tinybase.org/api/store/type-aliases/callback/dorollback/"><code>DoRollback</code></a> function no longer gets passed arguments. You can use the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/gettransactionchanges/"><code>getTransactionChanges</code></a> method and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/gettransactionlog/"><code>getTransactionLog</code></a> method directly instead.</li><li>Similarly, a <a href="https://tinybase.org/api/store/type-aliases/listener/transactionlistener/"><code>TransactionListener</code></a> function no longer gets passed arguments.</li></ul><p>In the <a href="https://tinybase.org/api/persisters/"><code>persisters</code></a> module:</p><ul><li>The <a href="https://tinybase.org/api/persisters/functions/creation/createcustompersister/"><code>createCustomPersister</code></a> function now takes a final optional boolean (<code>supportsMergeableStore</code>) to indicate that the <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> can support <a href="https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/"><code>MergeableStore</code></a> as well as <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> objects.</li><li>A <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a>&#x27;s <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/load/load/"><code>load</code></a> method and <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/load/startautoload/"><code>startAutoLoad</code></a> method now take a <a href="https://tinybase.org/api/store/type-aliases/store/content/"><code>Content</code></a> object as one parameter, rather than <a href="https://tinybase.org/api/store/type-aliases/store/tables/"><code>Tables</code></a> and <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a> as two.</li><li>If you create a custom <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a>, the setPersisted method now receives changes made to a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> directly by reference, rather than via a callback. Similarly, the <a href="https://tinybase.org/api/persisters/type-aliases/creation/persisterlistener/"><code>PersisterListener</code></a> you register in your addPersisterListener implementation now takes <a href="https://tinybase.org/api/store/type-aliases/store/content/"><code>Content</code></a> and <a href="https://tinybase.org/api/store/type-aliases/transaction/changes/"><code>Changes</code></a> objects directly rather than via a callback.</li><li>The broadcastTransactionChanges method in the <a href="https://tinybase.org/api/persister-partykit-server/"><code>persister-partykit-server</code></a> module has been renamed to the broadcastChanges method.</li></ul><hr><h1 id="v4-8">v4.8</h1><p>This release includes the new <a href="https://tinybase.org/api/persister-powersync/"><code>persister-powersync</code></a> module, which provides a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> for <a href="https://www.powersync.com/">PowerSync&#x27;s SQLite</a> database.</p><p>Much like the other SQLite persisters, use it by passing in a PowerSync instance to the <a href="https://tinybase.org/api/persister-powersync/functions/creation/createpowersyncpersister/"><code>createPowerSyncPersister</code></a> function; something like:</p>

```js yolo
const powerSync = usePowerSync();

const persister = createPowerSyncPersister(store, powerSync, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

<p>A huge thank you to <a href="https://bndkt.com/">Benedikt Mueller</a> (<a href="https://github.com/bndkt">@bndkt</a>) for building out this functionality! And please provide feedback on how this new <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> works for you.</p><hr><h1 id="v4-7">v4.7</h1><p>This release includes the new <a href="https://tinybase.org/api/persister-libsql/"><code>persister-libsql</code></a> module, which provides a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> for <a href="https://turso.tech/libsql">Turso&#x27;s LibSQL</a> database.</p><p>Use the <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> by passing in a reference to the LibSQL client to the createLibSQLPersister function; something like:</p>

```js yolo
const client = createClient({url: 'file:my.db'});

const persister = createLibSqlPersister(store, client, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

<p>This is the first version of this functionality, so please provide feedback on how it works for you!</p><hr><h1 id="v4-6">v4.6</h1><p>This release includes the new <a href="https://tinybase.org/api/persister-electric-sql/"><code>persister-electric-sql</code></a> module, which provides a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> for <a href="https://electric-sql.com/">ElectricSQL</a> client databases.</p><p>Use the <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> by passing in a reference to the Electric client to the <a href="https://tinybase.org/api/persister-electric-sql/functions/creation/createelectricsqlpersister/"><code>createElectricSqlPersister</code></a> function; something like:</p>

```js yolo
const electric = await electrify(connection, schema, config);

const persister = createElectricSqlPersister(store, electric, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

<p>This release is accompanied by a <a href="https://github.com/tinyplex/tinybase-ts-react-electricsql">template project</a> to get started quickly with this integration. Enjoy!</p><hr><h1 id="v4-5">v4.5</h1><p>This release includes the new persister-expo-sqlite-next module, which provides a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> for the modern version of Expo&#x27;s <a href="https://docs.expo.dev/versions/latest/sdk/sqlite">SQLite</a> library, designated &#x27;next&#x27; as of November 2023. This API should be used if you are installing the <code>expo-sqlite/next</code> module.</p><p>Note that TinyBase support for the legacy version of Expo-SQLite (<code>expo-sqlite</code>) is still available in the <a href="https://tinybase.org/api/persister-expo-sqlite/"><code>persister-expo-sqlite</code></a> module.</p><p>NB as of TinyBase v5.0, this is now the default and legacy support has been removed.</p><p>Thank you to Expo for providing this functionality!</p><hr><h1 id="v4-4">v4.4</h1><p>This relatively straightforward release adds a selection of new listeners to the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> object, and their respective hooks. These are for listening to changes in the &#x27;existence&#x27; of entities rather than to their value. For example, the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhastablelistener/"><code>addHasTableListener</code></a> method will let you listen for the presence (or not) of a specific table.</p><p>The full set of new existence-listening methods and hooks to work with this is as follows:</p><div class="table"><table><thead><tr><th>Existence of:</th><th>Add Listener</th><th>Hook</th><th>Add Listener Hook</th></tr></thead><tbody><tr><td><a href="https://tinybase.org/api/store/type-aliases/store/tables/"><code>Tables</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhastableslistener/"><code>addHasTablesListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehastables/"><code>useHasTables</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehastableslistener/"><code>useHasTablesListener</code></a></td></tr><tr><td>A <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhastablelistener/"><code>addHasTableListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehastable/"><code>useHasTable</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehastablelistener/"><code>useHasTableListener</code></a></td></tr><tr><td>A <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhastablecelllistener/"><code>addHasTableCellListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehastablecell/"><code>useHasTableCell</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehastablecelllistener/"><code>useHasTableCellListener</code></a></td></tr><tr><td>A <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhasrowlistener/"><code>addHasRowListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehasrow/"><code>useHasRow</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehasrowlistener/"><code>useHasRowListener</code></a></td></tr><tr><td>A <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhascelllistener/"><code>addHasCellListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehascell/"><code>useHasCell</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehascelllistener/"><code>useHasCellListener</code></a></td></tr><tr><td><a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhasvalueslistener/"><code>addHasValuesListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehasvalues/"><code>useHasValues</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehasvalueslistener/"><code>useHasValuesListener</code></a></td></tr><tr><td>A <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a></td><td><a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addhasvaluelistener/"><code>addHasValueListener</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehasvalue/"><code>useHasValue</code></a></td><td><a href="https://tinybase.org/api/ui-react/functions/store-hooks/usehasvaluelistener/"><code>useHasValueListener</code></a></td></tr></tbody></table></div><p>These methods may become particularly important in future versions of TinyBase that support <code>null</code> as valid Cells and <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a>.</p><hr><h1 id="v4-3">v4.3</h1><p>We&#x27;re excited to announce TinyBase 4.3, which provides an integration with <a href="https://www.partykit.io/">PartyKit</a>, a cloud-based collaboration provider.</p><p>This allows you to enjoy the benefits of both a &quot;local-first&quot; architecture and a &quot;sharing-first&quot; platform. You can have structured data on the client with fast, reactive user experiences, but also benefit from cloud-based persistence and room-based collaboration.</p><p><img src="https://tinybase.org/partykit.gif" alt="PartyKit" title="PartyKit"></p><p>This release includes two new modules:</p><ul><li>The <a href="https://tinybase.org/api/persister-partykit-server/"><code>persister-partykit-server</code></a> module provides a server class for coordinating clients and persisting <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> data to the PartyKit cloud.</li><li>The <a href="https://tinybase.org/api/persister-partykit-client/"><code>persister-partykit-client</code></a> module provides the API to create connections to the server and a binding to your <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</li></ul><p>A TinyBase server implementation on PartyKit can be as simple as this:</p>

```js yolo
import {TinyBasePartyKitServer} from 'tinybase/persisters/persister-partykit-server';
export default class extends TinyBasePartyKitServer {}
```

<p>On the client, use the familiar <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> API, passing in a reference to a PartyKit socket object that&#x27;s been configured to connect to your server deployment and named room:</p>

```js yolo
import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';

const persister = createPartyKitPersister(
  store,
  new PartySocket({
    host: 'project-name.my-account.partykit.dev',
    room: 'my-partykit-room',
  }),
);
await persister.startAutoSave();
await persister.startAutoLoad();
```

<p>The <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/load/load/"><code>load</code></a> method and (gracefully failing) <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/save/save/"><code>save</code></a> method on this <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> use HTTPS to get or set full copies of the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> to the cloud. However, the auto-save and auto-load modes use a websocket to transmit subsequent incremental changes in either direction, making for performant sharing of state between clients.</p><p>See and try out this new collaboration functionality in the <a href="https://tinybase.org/demos/todo-app/todo-app-v6-collaboration/">Todo App v6 (collaboration)</a> demo. This also emphasizes the few changes that need to be made to an existing app to make it instantly collaborative.</p><p>Also try out the <a href="https://github.com/tinyplex/tinybase-ts-react-partykit">tinybase-ts-react-partykit</a> template that gets you up and running with a PartyKit-enabled TinyBase app extremely quickly.</p><p>PartyKit supports retries for clients that go offline, and so the disconnected user experience is solid, out of the box. Learn more about configuring this behavior <a href="https://docs.partykit.io/reference/partysocket-api/#options">here</a>.</p><p>Note, however, that this release is not yet a full CRDT implementation: there is no clock synchronization and it is more &#x27;every write wins&#x27; than &#x27;last write wins&#x27;. However, since the transmitted updates are at single cell (or value) granularity, conflicts are minimized. More resilient replication is planned as this integration matures.</p><hr><h1 id="v4-2">v4.2</h1><p>This release adds support for persisting TinyBase to a browser&#x27;s IndexedDB storage. You&#x27;ll need to import the new <a href="https://tinybase.org/api/persister-indexed-db/"><code>persister-indexed-db</code></a> module, and call the <a href="https://tinybase.org/api/persister-indexed-db/functions/creation/createindexeddbpersister/"><code>createIndexedDbPersister</code></a> function to create the IndexedDB <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a>.</p><p>The API is the same as for all the other <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> APIs:</p>

```js
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';

store
  .setTable('pets', {fido: {species: 'dog'}})
  .setTable('species', {dog: {price: 5}})
  .setValues({open: true});
const indexedDbPersister = createIndexedDbPersister(store, 'petStore');

await indexedDbPersister.save();
// IndexedDB ->
//   database petStore:
//     objectStore t:
//       object 0:
//         k: "pets"
//         v: {fido: {species: dog}}
//       object 1:
//         k: "species"
//         v: {dog: {price: 5}}
//     objectStore v:
//       object 0:
//         k: "open"
//         v: true

indexedDbPersister.destroy();
```

<p>Note that it is not possible to reactively detect changes to a browser&#x27;s IndexedDB storage. A polling technique is used to load underlying changes if you choose to &#x27;autoLoad&#x27; your data into TinyBase.</p><p>This release also upgrades Prettier to v3.0 which has a peer-dependency impact on the <a href="https://tinybase.org/api/tools/"><code>tools</code></a> module. Please report any issues!</p><hr><h1 id="v4-1">v4.1</h1><p>This release introduces the new <a href="https://tinybase.org/api/ui-react-dom/"><code>ui-react-dom</code></a> module. This provides pre-built components for tabular display of your data in a web application.</p><p><img src="https://tinybase.org/ui-react-dom.webp" alt="A TinyBase DOM Component" title="A TinyBase DOM Component"></p><h2 id="new-dom-components">New DOM Components</h2><p>The following is the list of all the components released in v4.1:</p><div class="table"><table><thead><tr><th>Component</th><th>Purpose</th><th></th></tr></thead><tbody><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/store-components/valuesinhtmltable/"><code>ValuesInHtmlTable</code></a></td><td>Renders <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a>.</td><td><a href="https://tinybase.org/demos/ui-components/valuesinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/store-components/tableinhtmltable/"><code>TableInHtmlTable</code></a></td><td>Renders a <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>.</td><td><a href="https://tinybase.org/demos/ui-components/tableinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/store-components/sortedtableinhtmltable/"><code>SortedTableInHtmlTable</code></a></td><td>Renders a sorted <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, with optional interactivity.</td><td><a href="https://tinybase.org/demos/ui-components/sortedtableinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/indexes-components/sliceinhtmltable/"><code>SliceInHtmlTable</code></a></td><td>Renders a <a href="https://tinybase.org/api/indexes/type-aliases/concept/slice/"><code>Slice</code></a> from an <a href="https://tinybase.org/api/indexes/type-aliases/concept/index/"><code>Index</code></a>.</td><td><a href="https://tinybase.org/demos/ui-components/sliceinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/relationships-components/relationshipinhtmltable/"><code>RelationshipInHtmlTable</code></a></td><td>Renders the local and remote <a href="https://tinybase.org/api/store/type-aliases/store/tables/"><code>Tables</code></a> of a relationship</td><td><a href="https://tinybase.org/demos/ui-components/relationshipinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/queries-components/resulttableinhtmltable/"><code>ResultTableInHtmlTable</code></a></td><td>Renders a <a href="https://tinybase.org/api/queries/type-aliases/result/resulttable/"><code>ResultTable</code></a>.</td><td><a href="https://tinybase.org/demos/ui-components/resulttableinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/queries-components/resultsortedtableinhtmltable/"><code>ResultSortedTableInHtmlTable</code></a></td><td>Renders a sorted <a href="https://tinybase.org/api/queries/type-aliases/result/resulttable/"><code>ResultTable</code></a>, with optional interactivity.</td><td><a href="https://tinybase.org/demos/ui-components/resultsortedtableinhtmltable">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/store-components/editablecellview/"><code>EditableCellView</code></a></td><td>Renders a <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> and lets you change its type and value.</td><td><a href="https://tinybase.org/demos/ui-components/editablecellview">demo</a></td></tr><tr><td><a href="https://tinybase.org/api/ui-react-dom/functions/store-components/editablevalueview/"><code>EditableValueView</code></a></td><td>Renders a <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a> and lets you change its type and value.</td><td><a href="https://tinybase.org/demos/ui-components/editablevalueview">demo</a></td></tr></tbody></table></div><p>These pre-built components are showcased in the <a href="https://tinybase.org/demos/ui-components/">UI Components</a> demos. Using them should be very familiar if you have used the more abstract <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module:</p>

```jsx
import React from 'react';
import {SortedTableInHtmlTable} from 'tinybase/ui-react-dom';
import {createRoot} from 'react-dom/client';

const App = ({store}) => (
  <SortedTableInHtmlTable tableId="pets" cellId="species" store={store} />
);

store.setTables({
  pets: {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
  },
});
const app = document.createElement('div');
const root = createRoot(app);
root.render(<App store={store} />);

console.log(app.innerHTML);
// ->
`
<table>
 <thead>
   <tr><th>Id</th><th class="sorted ascending">↑ species</th></tr>
 </thead>
 <tbody>
   <tr><th>felix</th><td>cat</td></tr>
   <tr><th>fido</th><td>dog</td></tr>
 </tbody>
</table>
`;

root.unmount();
```

<p>The <a href="https://tinybase.org/api/ui-react-dom/functions/store-components/editablecellview/"><code>EditableCellView</code></a> component and <a href="https://tinybase.org/api/ui-react-dom/functions/store-components/editablevalueview/"><code>EditableValueView</code></a> component are interactive input controls for updating <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> and <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a> content respectively. You can generally use them across your table views by adding the <code>editable</code> prop to your table component.</p><h2 id="the-new-inspector">The new Inspector</h2><p><img src="https://tinybase.org/store-inspector.webp" alt="Inspector" title="Inspector"></p><p>The new <a href="https://tinybase.org/api/ui-react-inspector/functions/development-components/inspector/"><code>Inspector</code></a> component allows you to view, understand, and edit the content of a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> in a debug web environment. Try it out in most of the demos on the site, including the <a href="https://tinybase.org/demos/movie-database/">Movie Database</a> demo, pictured. This requires a debug build of the new <a href="https://tinybase.org/api/ui-react-dom/"><code>ui-react-dom</code></a> module, which is now also included in the UMD distribution.</p><p>Also in this release, the <a href="https://tinybase.org/api/queries/interfaces/queries/queries/methods/result/getresulttablecellids/"><code>getResultTableCellIds</code></a> method and <a href="https://tinybase.org/api/queries/interfaces/queries/queries/methods/listener/addresulttablecellidslistener/"><code>addResultTableCellIdsListener</code></a> method have been added to the <a href="https://tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> object. The equivalent <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/useresulttablecellids/"><code>useResultTableCellIds</code></a> hook and <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/useresulttablecellidslistener/"><code>useResultTableCellIdsListener</code></a> hook have also been added to <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module. A number of other minor React hooks have been added to support the components above.</p><p><a href="https://tinybase.org/demos/">Demos</a> have been updated to demonstrate the <a href="https://tinybase.org/api/ui-react-dom/"><code>ui-react-dom</code></a> module and the <a href="https://tinybase.org/api/ui-react-inspector/functions/development-components/inspector/"><code>Inspector</code></a> component where appropriate.</p><p>(NB: Previous to v5.0, this component was called <code>StoreInspector</code>.)</p><hr><h1 id="v4-0">v4.0</h1><p>This major release provides <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> modules that connect TinyBase to SQLite databases (in both browser and server contexts), and CRDT frameworks that can provide synchronization and local-first reconciliation:</p><div class="table"><table><thead><tr><th>Module</th><th>Function</th><th>Storage</th></tr></thead><tbody><tr><td><a href="https://tinybase.org/api/persister-sqlite3/"><code>persister-sqlite3</code></a></td><td><a href="https://tinybase.org/api/persister-sqlite3/functions/creation/createsqlite3persister/"><code>createSqlite3Persister</code></a></td><td>SQLite in Node, via <a href="https://github.com/TryGhost/node-sqlite3">sqlite3</a></td></tr><tr><td><a href="https://tinybase.org/api/persister-sqlite-wasm/"><code>persister-sqlite-wasm</code></a></td><td><a href="https://tinybase.org/api/persister-sqlite-wasm/functions/creation/createsqlitewasmpersister/"><code>createSqliteWasmPersister</code></a></td><td>SQLite in a browser, via <a href="https://github.com/tomayac/sqlite-wasm">sqlite-wasm</a></td></tr><tr><td><a href="https://tinybase.org/api/persister-cr-sqlite-wasm/"><code>persister-cr-sqlite-wasm</code></a></td><td><a href="https://tinybase.org/api/persister-cr-sqlite-wasm/functions/creation/createcrsqlitewasmpersister/"><code>createCrSqliteWasmPersister</code></a></td><td>SQLite CRDTs, via <a href="https://github.com/vlcn-io/cr-sqlite">cr-sqlite-wasm</a></td></tr><tr><td><a href="https://tinybase.org/api/persister-yjs/"><code>persister-yjs</code></a></td><td><a href="https://tinybase.org/api/persister-yjs/functions/creation/createyjspersister/"><code>createYjsPersister</code></a></td><td>Yjs CRDTs, via <a href="https://github.com/yjs/yjs">yjs</a></td></tr><tr><td><a href="https://tinybase.org/api/persister-automerge/"><code>persister-automerge</code></a></td><td><a href="https://tinybase.org/api/persister-sqlite-wasm/functions/creation/createsqlitewasmpersister/"><code>createSqliteWasmPersister</code></a></td><td>Automerge CRDTs, via <a href="https://github.com/automerge/automerge-repo">automerge-repo</a></td></tr></tbody></table></div><p>See the <a href="https://tinybase.org/guides/persistence/database-persistence/">Database Persistence</a> guide for details on how to work with SQLite databases, and the <a href="https://tinybase.org/guides/schemas-and-persistence/synchronizing-data/">Synchronizing Data</a> guide for more complex synchronization with the CRDT frameworks.</p><p>Take a look at the <a href="https://github.com/tinyplex/vite-tinybase-ts-react-crsqlite">vite-tinybase-ts-react-crsqlite</a> template, for example, which demonstrates Vulcan&#x27;s cr-sqlite to provide persistence and synchronization via this technique.</p><h2 id="sqlite-databases">SQLite databases</h2><p>You can persist <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> data to a database with either a JSON serialization or tabular mapping. (See the <a href="https://tinybase.org/api/persisters/type-aliases/configuration/databasepersisterconfig/"><code>DatabasePersisterConfig</code></a> documentation for more details).</p><p>For example, this creates a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/"><code>Persister</code></a> object and saves and loads the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> to and from a local SQLite database. It uses an explicit tabular one-to-one mapping for the &#x27;pets&#x27; table:</p>

```js
import {createSqliteWasmPersister} from 'tinybase/persisters/persister-sqlite-wasm';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const sqlite3 = await sqlite3InitModule();
const db = new sqlite3.oo1.DB(':memory:', 'c');
store.setTables({pets: {fido: {species: 'dog'}}});
const sqlitePersister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
});

await sqlitePersister.save();
console.log(db.exec('SELECT * FROM pets;', {rowMode: 'object'}));
// -> [{_id: 'fido', species: 'dog'}]

db.exec(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`);
await sqlitePersister.load();
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}

sqlitePersister.destroy();
```

<h2 id="crdt-frameworks">CRDT Frameworks</h2><p>CRDTs allow complex reconciliation and synchronization between clients. Yjs and Automerge are two popular examples. The API should be familiar! The following will persist a TinyBase <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> to a Yjs document:</p>

```js
import {Doc} from 'yjs';
import {createYjsPersister} from 'tinybase/persisters/persister-yjs';

store.setTables({pets: {fido: {species: 'dog'}}});

const doc = new Doc();
const yJsPersister = createYjsPersister(store, doc);

await yJsPersister.save();
// Store will be saved to the document.
console.log(doc.toJSON());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
yJsPersister.destroy();
```

<p>The following is the equivalent for an Automerge document that will sync over the broadcast channel:</p>

```js
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
import {Repo} from '@automerge/automerge-repo';
import {createAutomergePersister} from 'tinybase/persisters/persister-automerge';

const docHandler = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
}).create();
const automergePersister = createAutomergePersister(store, docHandler);

await automergePersister.save();
// Store will be saved to the document.
console.log(await docHandler.doc());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
automergePersister.destroy();

store.delTables();
```

<h2 id="new-methods">New methods</h2><p>There are three new methods on the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> object. The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getcontent/"><code>getContent</code></a> method lets you get the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>&#x27;s <a href="https://tinybase.org/api/store/type-aliases/store/tables/"><code>Tables</code></a> and <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a> in one call. The corresponding <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setcontent/"><code>setContent</code></a> method lets you set them simultaneously.</p><p>The new setTransactionChanges method lets you replay TransactionChanges (received at the end of a transaction via listeners) into a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, allowing you to take changes from one <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> and apply them to another.</p><p>Persisters now provide a <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/lifecycle/schedule/"><code>schedule</code></a> method that lets you queue up asynchronous tasks, such as when persisting data that requires complex sequences of actions.</p><h2 id="breaking-changes">Breaking changes</h2><p>The way that data is provided to the <a href="https://tinybase.org/api/store/type-aliases/callback/dorollback/"><code>DoRollback</code></a> and <a href="https://tinybase.org/api/store/type-aliases/listener/transactionlistener/"><code>TransactionListener</code></a> callbacks at the end of a transaction has changed. Although previously they directly received content about changed <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> and <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a> content, they now receive functions that they can choose to call to receive that same data. This has a performance improvement, and your callback or listener can choose between concise TransactionChanges or more verbose <a href="https://tinybase.org/api/store/type-aliases/transaction/transactionlog/"><code>TransactionLog</code></a> structures for that data.</p><p>If you have build a custom persister, you will need to update your implementation. Most notably, the <code>setPersisted</code> function parameter is provided with a <code>getContent</code> function to get the content from the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> itself, rather than being passed pre-serialized JSON. It also receives information about the changes made during a transaction. The <code>getPersisted</code> function must return the content (or nothing) rather than JSON. <code>startListeningToPersisted</code> has been renamed <code>addPersisterListener</code>, and <code>stopListeningToPersisted</code> has been renamed <code>delPersisterListener</code>.</p><hr><h1 id="v3-3">v3.3</h1><p>This release allows you to track the <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a> used across a whole <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, regardless of which <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> they are in.</p><p>In a <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> (particularly in a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> without a <a href="https://tinybase.org/api/store/type-aliases/schema/tablesschema/"><code>TablesSchema</code></a>), different Rows can use different Cells. Consider this <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, where each pet has a different set of <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a>:</p>

```js
store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat', friendly: true},
  cujo: {legs: 4},
});
```

<p>Prior to v3.3, you could only get the <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a> used in each <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> at a time (with the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getcellids/"><code>getCellIds</code></a> method). But you can now use the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/gettablecellids/"><code>getTableCellIds</code></a> method to get the union of all the <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a> used across the <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>:</p>

```js
console.log(store.getCellIds('pets', 'fido')); // previously available
// -> ['species']

console.log(store.getTableCellIds('pets')); //    new in v3.3
// -> ['species', 'friendly', 'legs']
```

<p>You can register a listener to track the <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a> used across a <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> with the new <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addtablecellidslistener/"><code>addTableCellIdsListener</code></a> method. Use cases for this might include knowing which headers to render when displaying a sparse <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> in a user interface, or synchronizing data with relational or column-oriented database system.</p><p>There is also a corresponding <a href="https://tinybase.org/api/ui-react/functions/store-hooks/usetablecellids/"><code>useTableCellIds</code></a> hook in the optional <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module for accessing these <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a> reactively, and a <a href="https://tinybase.org/api/ui-react/functions/store-hooks/usetablecellidslistener/"><code>useTableCellIdsListener</code></a> hook for more advanced purposes.</p><p>Note that the bookkeeping behind these new accessors and listeners is efficient and should not be slowed by the number of Rows in the <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>.</p><p>This release also passes a getIdChanges function to every <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a>-related listener that, when called, returns information about the <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> changes, both additions and removals, during a transaction. See the <a href="https://tinybase.org/api/store/type-aliases/listener/tableidslistener/"><code>TableIdsListener</code></a> type, for example.</p>

```js
let listenerId = store.addRowIdsListener(
  'pets',
  (store, tableId, getIdChanges) => {
    console.log(getIdChanges());
  },
);

store.setRow('pets', 'lowly', {species: 'worm'});
// -> {lowly: 1}

store.delRow('pets', 'felix');
// -> {felix: -1}

store.delListener(listenerId).delTables();
```

<hr><h1 id="v3-2">v3.2</h1><p>This release lets you add a listener to the start of a transaction, and detect that a set of changes are about to be made to a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>To use this, call the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addstarttransactionlistener/"><code>addStartTransactionListener</code></a> method on your <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>. The listener you add can itself mutate the data in the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>From this release onwards, listeners added with the existing <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addwillfinishtransactionlistener/"><code>addWillFinishTransactionListener</code></a> method are also able to mutate data. <a href="https://tinybase.org/guides/the-basics/transactions/">Transactions</a> added with the existing <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/adddidfinishtransactionlistener/"><code>addDidFinishTransactionListener</code></a> method <em>cannot</em> mutate data.</p>

```js
const startListenerId = store.addStartTransactionListener(() => {
  console.log('Start transaction');
  console.log(store.getTables());
  // Can mutate data
});

const willFinishListenerId = store.addWillFinishTransactionListener(() => {
  console.log('Will finish transaction');
  console.log(store.getTables());
  // Can mutate data
});

const didFinishListenerId = store.addDidFinishTransactionListener(() => {
  console.log('Did finish transaction');
  console.log(store.getTables());
  // Cannot mutate data
});

store.setTable('pets', {fido: {species: 'dog'}});
// -> 'Start transaction'
// -> {}
// -> 'Will finish transaction'
// -> {pets: {fido: {species: 'dog'}}}
// -> 'Did finish transaction'
// -> {pets: {fido: {species: 'dog'}}}

store
  .delListener(startListenerId)
  .delListener(willFinishListenerId)
  .delListener(didFinishListenerId);

store.delTables();
```

<p>This release also fixes a bug where using the explicit <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/starttransaction/"><code>startTransaction</code></a> method <em>inside</em> another listener could create infinite recursion.</p><hr><h1 id="v3-1">v3.1</h1><p>This new release adds a powerful schema-based type system to TinyBase.</p><p>If you define the shape and structure of your data with a <a href="https://tinybase.org/api/store/type-aliases/schema/tablesschema/"><code>TablesSchema</code></a> or <a href="https://tinybase.org/api/store/type-aliases/schema/valuesschema/"><code>ValuesSchema</code></a>, you can benefit from an enhanced developer experience when operating on it. For example:</p>

```ts yolo
// Import the 'with-schemas' definition:
import {createStore} from 'tinybase/with-schemas';

// Set a schema for a new Store:
const store = createStore().setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
});

// Benefit from inline TypeScript errors.
store.setValues({employees: 3}); //                      OK
store.setValues({employees: true}); //                   TypeScript error
store.setValues({employees: 3, website: 'pets.com'}); // TypeScript error
```

<p>The schema-based typing is used comprehensively throughout every module - from the core <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> interface all the way through to the <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module. See the new <a href="https://tinybase.org/guides/schemas/schema-based-typing/">Schema-Based Typing</a> guide for instructions on how to use it.</p><p>This now means that there are <em>three</em> progressive ways to use TypeScript with TinyBase:</p><ul><li>Basic Type Support (since v1.0)</li><li>Schema-based Typing (since v3.1)</li><li>ORM-like type definitions (since v2.2)</li></ul><p>These are each described in the new <a href="https://tinybase.org/guides/the-basics/tinybase-and-typescript/">TinyBase And TypeScript</a> guide.</p><p>Also in v3.1, the ORM-like type definition generation in the <a href="https://tinybase.org/api/tools/"><code>tools</code></a> module has been extended to emit <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module definitions.</p><p>Finally, v3.1.1 adds a <code>reuseRowIds</code> parameter to the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/addrow/"><code>addRow</code></a> method and the <a href="https://tinybase.org/api/ui-react/functions/store-hooks/useaddrowcallback/"><code>useAddRowCallback</code></a> hook. It defaults to <code>true</code>, for backwards compatibility, but if set to <code>false</code>, new <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a> will not be reused unless the whole <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> is deleted.</p><hr><h1 id="v3-0">v3.0</h1><p>This major new release adds key/value store functionality to TinyBase. Alongside existing tabular data, it allows you to get, set, and listen to, individual <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a> items, each with a unique <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a>.</p>

```js
store.setValues({employees: 3, open: true});
console.log(store.getValues());
// -> {employees: 3, open: true}

listenerId = store.addValueListener(
  null,
  (store, valueId, newValue, oldValue) => {
    console.log(`Value '${valueId}' changed from ${oldValue} to ${newValue}`);
  },
);

store.setValue('employees', 4);
// -> "Value 'employees' changed from 3 to 4"

store.delListener(listenerId).delValues();
```

<p><a href="https://tinybase.org/guides/">Guides</a> and documentation have been fully updated, and certain demos - such as the <a href="https://tinybase.org/demos/todo-app/todo-app-v2-indexes/">Todo App v2 (indexes)</a> demo, and the <a href="https://tinybase.org/demos/countries/">Countries</a> demo - have been updated to use this new functionality.</p><p>If you use the optional <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module with TinyBase, v3.0 now uses and expects React v18.</p><p>In terms of core API changes in v3.0, there are some minor breaking changes (see below), but the majority of the alterations are additions.</p><p>The <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> object gains the following:</p><ul><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setvalues/"><code>setValues</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setpartialvalues/"><code>setPartialValues</code></a> method, and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setvalue/"><code>setValue</code></a> method, to set keyed value data into the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</li><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getvalues/"><code>getValues</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getvalueids/"><code>getValueIds</code></a> method, and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getvalue/"><code>getValue</code></a> method, to get keyed value data out of the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</li><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/deleter/delvalues/"><code>delValues</code></a> method and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/deleter/delvalue/"><code>delValue</code></a> method for removing keyed value data.</li><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addvalueslistener/"><code>addValuesListener</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addvalueidslistener/"><code>addValueIdsListener</code></a> method, addValueListener method, and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addinvalidvaluelistener/"><code>addInvalidValueListener</code></a> method, for listening to changes to keyed value data.</li><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/hasvalues/"><code>hasValues</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/hasvalue/"><code>hasValue</code></a> method, and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/iterator/foreachvalue/"><code>forEachValue</code></a> method, for existence and enumeration purposes.</li><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/gettablesjson/"><code>getTablesJson</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getvaluesjson/"><code>getValuesJson</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/settablesjson/"><code>setTablesJson</code></a> method, and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setvaluesjson/"><code>setValuesJson</code></a> method, for reading and writing tabular and keyed value data to and from a JSON string. Also see below.</li><li>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/gettablesschemajson/"><code>getTablesSchemaJson</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getvaluesschemajson/"><code>getValuesSchemaJson</code></a> method, setTablesSchema method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setvaluesschema/"><code>setValuesSchema</code></a> method, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/deleter/deltablesschema/"><code>delTablesSchema</code></a> method, and delValuesSchema method, for reading and writing tabular and keyed value schemas for the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>. Also see below.</li></ul><p>The following types have been added to the <a href="https://tinybase.org/api/store/"><code>store</code></a> module:</p><ul><li><a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a>, <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a>, and <a href="https://tinybase.org/api/store/type-aliases/store/valueorundefined/"><code>ValueOrUndefined</code></a>, representing keyed value data in a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</li><li><a href="https://tinybase.org/api/store/type-aliases/listener/valuelistener/"><code>ValueListener</code></a> and <a href="https://tinybase.org/api/store/type-aliases/listener/invalidvaluelistener/"><code>InvalidValueListener</code></a>, to describe functions used to listen to (valid or invalid) changes to a <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a>.</li><li><a href="https://tinybase.org/api/store/type-aliases/schema/valuesschema/"><code>ValuesSchema</code></a> and <a href="https://tinybase.org/api/store/type-aliases/schema/valueschema/"><code>ValueSchema</code></a>, to describe the keyed <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a> that can be set in a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> and their types.</li><li><a href="https://tinybase.org/api/store/type-aliases/callback/valuecallback/"><code>ValueCallback</code></a>, <a href="https://tinybase.org/api/store/type-aliases/callback/mapvalue/"><code>MapValue</code></a>, <a href="https://tinybase.org/api/store/type-aliases/transaction/changedvalues/"><code>ChangedValues</code></a>, and <a href="https://tinybase.org/api/store/type-aliases/transaction/invalidvalues/"><code>InvalidValues</code></a>, which also correspond to their &#x27;<a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>&#x27; equivalents.</li></ul><p>Additionally:</p><ul><li>The persisters&#x27; <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/load/load/"><code>load</code></a> method and <a href="https://tinybase.org/api/persisters/interfaces/persister/persister/methods/load/startautoload/"><code>startAutoLoad</code></a> method take an optional <code>initialValues</code> parameter for setting <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a> when a persisted <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> is bootstrapped.</li><li>The <a href="https://tinybase.org/api/checkpoints/interfaces/checkpoints/checkpoints/"><code>Checkpoints</code></a> module will undo and redo changes to keyed values in the same way they do for tabular data.</li><li>The <a href="https://tinybase.org/api/tools/"><code>tools</code></a> module provides a <a href="https://tinybase.org/api/tools/interfaces/tools/tools/methods/modelling/getstorevaluesschema/"><code>getStoreValuesSchema</code></a> method for inferring value-based schemas. The <a href="https://tinybase.org/api/tools/interfaces/tools/tools/methods/modelling/getstoreapi/"><code>getStoreApi</code></a> method and <a href="https://tinybase.org/api/tools/interfaces/tools/tools/methods/modelling/getprettystoreapi/"><code>getPrettyStoreApi</code></a> method now also provides an ORM-like code-generated API for schematized key values.</li></ul><p>All attempts have been made to provide backwards compatibility and/or easy upgrade paths.</p><p>In previous versions, <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getjson/"><code>getJson</code></a> method would get a JSON serialization of the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>&#x27;s tabular data. That functionality is now provided by the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/gettablesjson/"><code>getTablesJson</code></a> method, and the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getjson/"><code>getJson</code></a> method instead now returns a two-part array containing the tabular data and the keyed value data.</p><p>Similarly, the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getschemajson/"><code>getSchemaJson</code></a> method used to return the tabular schema, now provided by the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/gettablesschemajson/"><code>getTablesSchemaJson</code></a> method. The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getschemajson/"><code>getSchemaJson</code></a> method instead now returns a two-part array of tabular schema and the keyed value schema.</p><p>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setjson/"><code>setJson</code></a> method used to take a serialization of just the tabular data object. That&#x27;s now provided by the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/settablesjson/"><code>setTablesJson</code></a> method, and the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setjson/"><code>setJson</code></a> method instead expects a two-part array containing the tabular data and the keyed value data (as emitted by the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getjson/"><code>getJson</code></a> method). However, for backwards compatibility, if the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setjson/"><code>setJson</code></a> method is passed an object, it <em>will</em> set the tabular data, as it did prior to v3.0.</p><p>Along similar lines, the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setschema/"><code>setSchema</code></a> method&#x27;s previous behavior is now provided by the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/settablesschema/"><code>setTablesSchema</code></a> method. The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/setter/setschema/"><code>setSchema</code></a> method now takes two arguments, the second of which is optional, also aiding backward compatibility. The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/deleter/delschema/"><code>delSchema</code></a> method removes both types of schema.</p><hr><h1 id="v2-2">v2.2</h1><p>This release includes a new <a href="https://tinybase.org/api/tools/"><code>tools</code></a> module. These tools are not intended for production use, but are instead to be used as part of your engineering workflow to perform tasks like generating APIs from schemas, or schemas from data. For example:</p>

```js
import {createTools} from 'tinybase/tools';

store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const tools = createTools(store);
const [dTs, ts] = tools.getStoreApi('shop');
```

<p>This will generate two files:</p>

```js yolo
// -- shop.d.ts --
/* Represents the 'pets' Table. */
export type PetsTable = {[rowId: Id]: PetsRow};
/* Represents a Row when getting the content of the 'pets' Table. */
export type PetsRow = {species: string};
//...

// -- shop.ts --
export const createShop: typeof createShopDecl = () => {
  //...
};
```

<p>This release includes a new <code>tinybase</code> CLI tool which allows you to generate Typescript definition and implementation files direct from a schema file:</p>

```bash
npx tinybase getStoreApi schema.json shop api

    Definition: [...]/api/shop.d.ts
Implementation: [...]/api/shop.ts
```

<p>Finally, the <a href="https://tinybase.org/api/tools/"><code>tools</code></a> module also provides ways to track the overall size and structure of a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> for use while debugging.</p><hr><h1 id="v2-1">v2.1</h1><p>This release allows you to create indexes where a single <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> can exist in multiple slices. You can utilize this to build simple keyword searches, for example.</p><p>Simply provide a custom getSliceIdOrIds function in the <a href="https://tinybase.org/api/indexes/interfaces/indexes/indexes/methods/configuration/setindexdefinition/"><code>setIndexDefinition</code></a> method that returns an array of <a href="https://tinybase.org/api/indexes/type-aliases/concept/slice/"><code>Slice</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a>, rather than a single <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a>:</p>

```js
import {createIndexes} from 'tinybase';

store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  rex: {species: 'dog'},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition('containsLetter', 'pets', (_, rowId) =>
  rowId.split(''),
);

console.log(indexes.getSliceIds('containsLetter'));
// -> ['f', 'i', 'd', 'o', 'e', 'l', 'x', 'r']
console.log(indexes.getSliceRowIds('containsLetter', 'i'));
// -> ['fido', 'felix']
console.log(indexes.getSliceRowIds('containsLetter', 'x'));
// -> ['felix', 'rex']
```

<p>This functionality is showcased in the <a href="https://tinybase.org/demos/word-frequencies/">Word Frequencies</a> demo if you would like to see it in action.</p><hr><h1 id="v2-0">v2.0</h1><p><strong>Announcing the next major version of TinyBase 2.0!</strong> This is an exciting release that evolves TinyBase towards becoming a reactive, relational data store, complete with querying, sorting, and pagination. Here are a few of the highlights...</p><h2 id="query-engine">Query Engine</h2><p>The <a href="https://tinybase.org/guides/making-queries/using-queries/">flagship feature</a> of this release is the new <a href="https://tinybase.org/api/queries/"><code>queries</code></a> module. This allows you to build expressive queries against your data with a SQL-adjacent API that we&#x27;ve cheekily called <a href="https://tinybase.org/guides/making-queries/tinyql/">TinyQL</a>. The query engine lets you select, join, filter, group, sort and paginate data. And of course, it&#x27;s all reactive!</p><p>The best way to see the power of this new engine is with the two new demos we&#x27;ve included this release:</p><p><img src="https://tinybase.org/car-analysis.webp" alt="Thumbnail of demo" title="Thumbnail of demo"> The <a href="https://tinybase.org/demos/car-analysis/">Car Analysis</a> demo showcases the analytical query capabilities of TinyBase v2.0, grouping and sorting dimensional data for lightweight analytical usage, graphing, and tabular display. <em><a href="https://tinybase.org/demos/car-analysis/">Try this demo here</a>.</em></p><p><img src="https://tinybase.org/movie-database.webp" alt="Thumbnail of demo" title="Thumbnail of demo"> The <a href="https://tinybase.org/demos/movie-database/">Movie Database</a> demo showcases the relational query capabilities of TinyBase v2.0, joining together information about movies, directors, and actors from across multiple source tables. <em><a href="https://tinybase.org/demos/movie-database/">Try this demo here</a>.</em></p><h2 id="sorting-and-pagination">Sorting and Pagination</h2><p>To complement the query engine, you can now sort and paginate <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> <a href="https://tinybase.org/api/common/type-aliases/identity/ids/"><code>Ids</code></a>. This makes it very easy to build grid-like user interfaces (also shown in the demos above). To achieve this, the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> now includes the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/getter/getsortedrowids/"><code>getSortedRowIds</code></a> method (and the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addsortedrowidslistener/"><code>addSortedRowIdsListener</code></a> method for reactivity), and the <a href="https://tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> object includes the equivalent <a href="https://tinybase.org/api/queries/interfaces/queries/queries/methods/result/getresultsortedrowids/"><code>getResultSortedRowIds</code></a> method and <a href="https://tinybase.org/api/queries/interfaces/queries/queries/methods/listener/addresultsortedrowidslistener/"><code>addResultSortedRowIdsListener</code></a> method.</p><p>These are also exposed in the optional <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module via the <a href="https://tinybase.org/api/ui-react/functions/store-hooks/usesortedrowids/"><code>useSortedRowIds</code></a> hook, the <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/useresultsortedrowids/"><code>useResultSortedRowIds</code></a> hook, the <a href="https://tinybase.org/api/ui-react/functions/store-components/sortedtableview/"><code>SortedTableView</code></a> component and the <a href="https://tinybase.org/api/ui-react/functions/queries-components/resultsortedtableview/"><code>ResultSortedTableView</code></a> component, and so on.</p><h2 id="queries-in-the-ui-react-module"><a href="https://tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> in the <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module</h2><p>The v2.0 query functionality is fully supported by the <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module (to match support for <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, <a href="https://tinybase.org/api/metrics/interfaces/metrics/metrics/"><code>Metrics</code></a>, <a href="https://tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a>, and <a href="https://tinybase.org/api/relationships/type-aliases/concept/relationship/"><code>Relationship</code></a> objects). The <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/usecreatequeries/"><code>useCreateQueries</code></a> hook memoizes the creation of app- or component-wide Query objects; and the <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/useresulttable/"><code>useResultTable</code></a> hook, <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/useresultrow/"><code>useResultRow</code></a> hook, <a href="https://tinybase.org/api/ui-react/functions/queries-hooks/useresultcell/"><code>useResultCell</code></a> hook (and so on) let you bind you component to the results of a query.</p><p>This is, of course, supplemented with higher-level components: the <a href="https://tinybase.org/api/ui-react/functions/queries-components/resulttableview/"><code>ResultTableView</code></a> component, the <a href="https://tinybase.org/api/ui-react/functions/queries-components/resultrowview/"><code>ResultRowView</code></a> component, the <a href="https://tinybase.org/api/ui-react/functions/queries-components/resultcellview/"><code>ResultCellView</code></a> component, and so on. See the <a href="https://tinybase.org/guides/using-queries/building-a-ui-with-queries/">Building A UI With Queries</a> guide for more details.</p><h2 id="it-s-a-big-release">It&#x27;s a big release!</h2><p>Thank you for all your support as we brought this important new release to life, and we hope you enjoy using it as much as we did building it. Please provide feedback via <a href="https://github.com/tinyplex/tinybase">Github</a>, <a href="https://bsky.app/profile/tinybase.bsky.social">Bluesky</a>, and <a href="https://x.com/tinybasejs">X</a>!</p><hr><h1 id="v1-3">v1.3</h1><p>Adds support for explicit transaction start and finish methods, as well as listeners for transactions finishing.</p><p>The <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/starttransaction/"><code>startTransaction</code></a> method and <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/finishtransaction/"><code>finishTransaction</code></a> method allow you to explicitly enclose a transaction that will make multiple mutations to the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, buffering all calls to the relevant listeners until it completes when you call the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/finishtransaction/"><code>finishTransaction</code></a> method.</p><p>Unlike the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/transaction/"><code>transaction</code></a> method, this approach is useful when you have a more &#x27;open-ended&#x27; transaction, such as one containing mutations triggered from other events that are asynchronous or not occurring inline to your code. You must remember to also call the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/finishtransaction/"><code>finishTransaction</code></a> method explicitly when the transaction is started with the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/starttransaction/"><code>startTransaction</code></a> method, of course.</p>

```js
store.setTables({pets: {fido: {species: 'dog'}}});
store.addRowListener('pets', 'fido', () => console.log('Fido changed'));

store.startTransaction();
store.setCell('pets', 'fido', 'color', 'brown');
store.setCell('pets', 'fido', 'sold', true);
store.finishTransaction();
// -> 'Fido changed'
```

<p>In addition, see the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addwillfinishtransactionlistener/"><code>addWillFinishTransactionListener</code></a> method and the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/adddidfinishtransactionlistener/"><code>addDidFinishTransactionListener</code></a> method for details around listening to transactions completing.</p><p>Together, this release allows stores to couple their transaction life-cycles together, which we need for the query engine.</p><p>Note: this API was updated to be more comprehensive in v4.0.</p><hr><h1 id="v1-2">v1.2</h1><p>This adds a way to revert transactions if they have not met certain conditions.</p><p>When using the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/transaction/transaction/"><code>transaction</code></a> method, you can provide an optional <code>doRollback</code> callback which should return true if you want to revert the whole transaction at its conclusion.</p><p>The callback is provided with two objects, <code>changedCells</code> and <code>invalidCells</code>, which list all the net changes and invalid attempts at changes that were made during the transaction. You will most likely use the contents of those objects to decide whether the transaction should be rolled back.</p><p>Note: this API was updated to be more comprehensive in v4.0.</p><hr><h1 id="v1-1">v1.1</h1><p>This release allows you to listen to invalid data being added to a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, allowing you to gracefully handle errors, rather than them failing silently.</p><p>There is a new listener type <a href="https://tinybase.org/api/store/type-aliases/listener/invalidcelllistener/"><code>InvalidCellListener</code></a> and a <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener/"><code>addInvalidCellListener</code></a> method in the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> interface.</p><p>These allow you to keep track of failed attempts to update the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> with invalid <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> data. These listeners can also be mutators, allowing you to address any failed writes programmatically.</p><p>For more information, please see the <a href="https://tinybase.org/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener/"><code>addInvalidCellListener</code></a> method documentation. In particular, this explains how this listener behaves for a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> with a <a href="https://tinybase.org/api/store/type-aliases/schema/tablesschema/"><code>TablesSchema</code></a>.</p>