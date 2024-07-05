<p>This is a reverse chronological list of the major <a href="https://beta.tinybase.org/">TinyBase</a> releases, with highlighted features.</p><h2 id="v5-0">v5.0</h2><p>We&#x27;re excited to announce this major release for <a href="https://beta.tinybase.org/">TinyBase</a>! It includes important data synchronization functionality and a range of other improvements.</p><h2 id="in-summary">In Summary</h2><ul><li><a href="#the-new-mergeableStore-type">The new MergeableStore type</a> wraps your data as a Conflict-Free Replicated Data Type (CRDT).</li><li><a href="#the-new-synchronizer-framework">The new Synchronizer framework</a> keeps multiple instances of data in sync across different media.</li><li>An <a href="#improved-module-folder-structure">improved module folder structure</a> removes common packaging and bundling issues.</li><li>The <a href="https://beta.tinybase.org/">TinyBase</a> Inspector is now in its own standalone ui-react-inspector module.</li><li><a href="https://beta.tinybase.org/">TinyBase</a> now supports only Expo SQLite v14 (<a href="https://expo.dev/changelog/2024/05-07-sdk-51">SDK 51</a>) and above.</li></ul><p>There are also some small <a href="#breaking-changes-in-v50">breaking changes</a> that may affect you (but which should easy to fix if they do).</p><p>Let&#x27;s look at the major functionality in more detail!</p><h3 id="the-new-mergeablestore-type">The New MergeableStore Type</h3><p>A key part of <a href="https://beta.tinybase.org/">TinyBase</a> v5.0 is the new mergeable-store module, which contains a subtype of Store - called MergeableStore - that can be merged with another with deterministic results. The implementation uses an encoded hybrid logical clock (HLC) to timestamp the changes made so that they can be cleanly merged.</p><p>The getMergeableContent method on a MergeableStore is used to get the state of a store that can be merged into another. The applyMergeableChanges method will let you apply that to (another) store. The merge method is a convenience function to bidirectionally merge two stores together:</p>

```js
import {createMergeableStore} from 'tinybase';

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

<p>Please read the new <a href="https://beta.tinybase.org/guides/synchronization/using-a-mergeablestore/">Using A MergeableStore</a> guide for more details of how to use this important new API.</p><p>A MergeableStore can be persisted locally, just like a regular Store into file, local and session storage, and simple SQLite environments such as Expo and SQLite3. These allow you to save the state of a MergeableStore locally before it has had the chance to be synchronized online, for example.</p><p>Which leads us onto the next important feature in v5.0, allowing you to synchronize stores between systems...</p><h3 id="the-new-synchronizer-framework">The New Synchronizer Framework</h3><p>The v5.0 release also introduces the new concept of synchronization. Synchronizer objects implement a negotiation protocol that allows multiple MergeableStore objects to be merged together. This can be across a network, using WebSockets, for example:</p>

```js
import {WebSocketServer, WebSocket} from 'ws';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';

// On a server machine
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

<p>This release includes three types of Synchronizer:</p><ul><li>The WsSynchronizer uses WebSockets to communicate between different systems as shown above.</li><li>The BroadcastChannelSynchronizer uses the browser&#x27;s BroadcastChannel API to communicate between different tabs and workers.</li><li>The LocalSynchronizer demonstrates synchronization in memory on a single local system.</li></ul><p>Notice that the WsSynchronizer assumes that there exists a server that can forward requests to other WsSynchronizer systems. This can be created using the createWsServer function that takes a WebSocketServer as also shown above.</p><p>Please read the new <a href="https://beta.tinybase.org/guides/synchronization/using-a-synchronizer/">Using A Synchronizer</a> guide for more details of how to synchronize your data.</p><h3 id="improved-module-folder-structure">Improved Module Folder Structure</h3><p>We have previously found issues with legacy bundlers and other tools that didn&#x27;t fully support the new <code>exports</code> field in the module&#x27;s package.</p><p>To mitigate that, the <a href="https://beta.tinybase.org/">TinyBase</a> distribution now has a top-level folder structure that fully echoes the import paths, including signifiers for JavaScript versions, schema support, minification and so on.</p><p>Please read the comprehensive <a href="https://beta.tinybase.org/guides/the-basics/importing-tinybase/">Importing TinyBase</a> guide for more details of how to construct the correct import paths in v5.0.</p><h3 id="breaking-changes-in-v5-0">Breaking Changes in v5.0</h3><h4 id="module-file-structure">Module File Structure</h4><p>If you previously had <code>/lib/</code> in your import paths, you should remove it. You also do not have to explicitly specify whether you need the <code>cjs</code> version of <a href="https://beta.tinybase.org/">TinyBase</a> - if you are using a <code>require</code> rather than an <code>import</code>, you will get it automatically.</p><p>The non-minified version of the code is now default and you need to be explicit with you <em>want</em> minified code. Previously you would add <code>/debug</code> to the import path to get non-minified code, but now you add <code>/min</code> to the import path to get <em>minified</em> code.</p><h4 id="expo-sqlite-persister">Expo SQLite Persister</h4><p>Previously the persister-expo-sqlite module supported expo-sqlite v13 and the persister-expo-sqlite-next module supported their modern &#x27;next&#x27; package. In v5.0, the persister-expo-sqlite module only supports v14 and later, and the persister-expo-sqlite-next module has been removed.</p><h4 id="the-tinybase-inspector">The <a href="https://beta.tinybase.org/">TinyBase</a> Inspector</h4><p>Previously, the React-based inspector (then known as <code>StoreInspector</code>) resided in the debug version of the ui-react-dom module. It now lives in its own ui-react-inspector module (so that it can be used against non-debug code) and has been renamed to Inspector.</p><p>Please update your imports and rename the component when used, accordingly. See the API documentation for details, or the <a href="https://beta.tinybase.org/demos/ui-components/inspector/"><inspector></inspector></a>demo, for example.</p><h4 id="api-changes">API Changes</h4><p>The following changes have been made to the existing <a href="https://beta.tinybase.org/">TinyBase</a> API for consistency. These are less common parts of the API but should straightforward to correct if you are using them.</p><p>In the type definitions:</p><ul><li>The GetTransactionChanges and GetTransactionLog types have been removed.</li><li>The TransactionChanges type has been renamed as the Changes type.</li><li>The Changes type now uses <code>undefined</code> instead of <code>null</code> to indicate a Cell or Value that has been deleted or that was not present.</li><li>The TransactionLog type is now an array instead of a JavaScript object.</li></ul><p>In the Store interface:</p><ul><li>There is a new getTransactionChanges method and a new getTransactionLog method.</li><li>The setTransactionChanges method is renamed as the applyChanges method.</li><li>A DoRollback function no longer gets passed arguments. You can use the getTransactionChanges method and getTransactionLog method directly instead.</li><li>Similarly, a TransactionListener function no longer gets passed arguments.</li></ul><p>In the persisters module:</p><ul><li>The createCustomPersister function now takes a final optional boolean (<code>supportsMergeableStore</code>) to indicate that the Persister can support MergeableStore as well as Store objects.</li><li>A Persister&#x27;s load method and startAutoLoad method now take a Content object as one parameter, rather than Tables and Values as two.</li><li>If you create a custom Persister, the setPersisted method now receives changes made to a Store directly by reference, rather than via a callback. Similarly, the PersisterListener you register in your addPersisterListener implementation now takes Content and Changes objects directly rather than via a callback.</li><li>The broadcastTransactionChanges method in the persister-partykit-server module has been renamed to the broadcastChanges method.</li></ul><h2 id="v4-8">v4.8</h2><p>This release includes the new persister-powersync module, which provides a Persister for <a href="https://www.powersync.com/">PowerSync&#x27;s SQLite</a> database.</p><p>Much like the other SQLite persisters, use it by passing in a PowerSync instance to the createPowerSyncPersister function; something like:</p>

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

<p>A huge thank you to <a href="https://bndkt.com/">Benedikt Mueller</a> (<a href="https://github.com/bndkt">@bndkt</a>) for building out this functionality! And please provide feedback on how this new Persister works for you.</p><h2 id="v4-7">v4.7</h2><p>This release includes the new persister-libsql module, which provides a Persister for <a href="https://turso.tech/libsql">Turso&#x27;s LibSQL</a> database.</p><p>Use the Persister by passing in a reference to the LibSQL client to the createLibSQLPersister function; something like:</p>

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

<p>This is the first version of this functionality, so please provide feedback on how it works for you!</p><h2 id="v4-6">v4.6</h2><p>This release includes the new persister-electric-sql module, which provides a Persister for <a href="https://electric-sql.com/">ElectricSQL</a> client databases.</p><p>Use the Persister by passing in a reference to the Electric client to the createElectricSqlPersister function; something like:</p>

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

<p>This release is accompanied by a <a href="https://github.com/tinyplex/tinybase-ts-react-electricsql">template project</a> to get started quickly with this integration. Enjoy!</p><h2 id="v4-5">v4.5</h2><p>This release includes the new persister-expo-sqlite-next module, which provides a Persister for the modern version of Expo&#x27;s <a href="https://docs.expo.dev/versions/latest/sdk/sqlite">SQLite</a> library, designated &#x27;next&#x27; as of November 2023. This API should be used if you are installing the <code>expo-sqlite/next</code> module.</p><p>Note that <a href="https://beta.tinybase.org/">TinyBase</a> support for the legacy version of Expo-SQLite (<code>expo-sqlite</code>) is still available in the persister-expo-sqlite module.</p><p>NB as of <a href="https://beta.tinybase.org/">TinyBase</a> v5.0, this is now the default and legacy support has been removed.</p><p>Thank you to Expo for providing this functionality!</p><h2 id="v4-4">v4.4</h2><p>This relatively straightforward release adds a selection of new listeners to the Store object, and their respective hooks. These are for listening to changes in the &#x27;existence&#x27; of entities rather than to their value. For example, the addHasTableListener method will let you listen for the presence (or not) of a specific table.</p><p>The full set of new existence-listening methods and hooks to work with this is as follows:</p><div class="table"><table><thead><tr><th>Existence of:</th><th>Add Listener</th><th>Hook</th><th>Add Listener Hook</th></tr></thead><tbody><tr><td>Tables</td><td>addHasTablesListener</td><td>useHasTables</td><td>useHasTablesListener</td></tr><tr><td>A Table</td><td>addHasTableListener</td><td>useHasTable</td><td>useHasTableListener</td></tr><tr><td>A Table Cell</td><td>addHasTableCellListener</td><td>useHasTableCell</td><td>useHasTableCellListener</td></tr><tr><td>A Row</td><td>addHasRowListener</td><td>useHasRow</td><td>useHasRowListener</td></tr><tr><td>A Cell</td><td>addHasCellListener</td><td>useHasCell</td><td>useHasCellListener</td></tr><tr><td>Values</td><td>addHasValuesListener</td><td>useHasValues</td><td>useHasValuesListener</td></tr><tr><td>A Value</td><td>addHasValueListener</td><td>useHasValue</td><td>useHasValueListener</td></tr></tbody></table></div><p>These methods may become particularly important in future versions of <a href="https://beta.tinybase.org/">TinyBase</a> that support <code>null</code> as valid Cells and Values.</p><h2 id="v4-3">v4.3</h2><p>We&#x27;re excited to announce <a href="https://beta.tinybase.org/">TinyBase</a> 4.3, which provides an integration with <a href="https://www.partykit.io/">PartyKit</a>, a cloud-based collaboration provider.</p><p>This allows you to enjoy the benefits of both a &quot;local-first&quot; architecture and a &quot;sharing-first&quot; platform. You can have structured data on the client with fast, reactive user experiences, but also benefit from cloud-based persistence and room-based collaboration.</p><p><img src="https://beta.tinybase.org/partykit.gif" alt="PartyKit" title="PartyKit"></p><p>This release includes two new modules:</p><ul><li>The persister-partykit-server module provides a server class for coordinating clients and persisting Store data to the PartyKit cloud.</li><li>The persister-partykit-client module provides the API to create connections to the server and a binding to your Store.</li></ul><p>A <a href="https://beta.tinybase.org/">TinyBase</a> server implementation on PartyKit can be as simple as this:</p>

```js yolo
import {TinyBasePartyKitServer} from 'tinybase/persisters/persister-partykit-server';
export default class extends TinyBasePartyKitServer {}
```

<p>On the client, use the familiar Persister API, passing in a reference to a PartyKit socket object that&#x27;s been configured to connect to your server deployment and named room:</p>

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

<p>The load method and (gracefully failing) save method on this Persister use HTTPS to get or set full copies of the Store to the cloud. However, the auto-save and auto-load modes use a websocket to transmit subsequent incremental changes in either direction, making for performant sharing of state between clients.</p><p>See and try out this new collaboration functionality in the <a href="https://beta.tinybase.org/demos/todo-app/todo-app-v6-collaboration/">Todo App v6 (collaboration)</a> demo. This also emphasizes the few changes that need to be made to an existing app to make it instantly collaborative.</p><p>Also try out the <a href="https://github.com/tinyplex/tinybase-ts-react-partykit">tinybase-ts-react-partykit</a> template that gets you up and running with a PartyKit-enabled <a href="https://beta.tinybase.org/">TinyBase</a> app extremely quickly.</p><p>PartyKit supports retries for clients that go offline, and so the disconnected user experience is solid, out of the box. Learn more about configuring this behavior <a href="https://docs.partykit.io/reference/partysocket-api/#options">here</a>.</p><p>Note, however, that this release is not yet a full CRDT implementation: there is no clock synchronization and it is more &#x27;every write wins&#x27; than &#x27;last write wins&#x27;. However, since the transmitted updates are at single cell (or value) granularity, conflicts are minimized. More resilient replication is planned as this integration matures.</p><h2 id="v4-2">v4.2</h2><p>This release adds support for persisting <a href="https://beta.tinybase.org/">TinyBase</a> to a browser&#x27;s IndexedDB storage. You&#x27;ll need to import the new persister-indexed-db module, and call the createIndexedDbPersister function to create the IndexedDB Persister.</p><p>The API is the same as for all the other Persister APIs:</p>

```js
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {createStore} from 'tinybase';

const store = createStore()
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

<p>Note that it is not possible to reactively detect changes to a browser&#x27;s IndexedDB storage. A polling technique is used to load underlying changes if you choose to &#x27;autoLoad&#x27; your data into <a href="https://beta.tinybase.org/">TinyBase</a>.</p><p>This release also upgrades Prettier to v3.0 which has a peer-dependency impact on the tools module. Please report any issues!</p><h2 id="v4-1">v4.1</h2><p>This release introduces the new ui-react-dom module. This provides pre-built components for tabular display of your data in a web application.</p><p><img src="https://beta.tinybase.org/ui-react-dom.webp" alt="A TinyBase DOM Component" title="A [TinyBase](/) DOM Component"></p><h3 id="new-dom-components">New DOM Components</h3><p>The following is the list of all the components released in v4.1:</p><div class="table"><table><thead><tr><th>Component</th><th>Purpose</th><th></th></tr></thead><tbody><tr><td>ValuesInHtmlTable</td><td>Renders Values.</td><td><a href="https://beta.tinybase.org/demos/ui-components/valuesinhtmltable">demo</a></td></tr><tr><td>TableInHtmlTable</td><td>Renders a Table.</td><td><a href="https://beta.tinybase.org/demos/ui-components/tableinhtmltable">demo</a></td></tr><tr><td>SortedTableInHtmlTable</td><td>Renders a sorted Table, with optional interactivity.</td><td><a href="https://beta.tinybase.org/demos/ui-components/sortedtableinhtmltable">demo</a></td></tr><tr><td>SliceInHtmlTable</td><td>Renders a Slice from an Index.</td><td><a href="https://beta.tinybase.org/demos/ui-components/sliceinhtmltable">demo</a></td></tr><tr><td>RelationshipInHtmlTable</td><td>Renders the local and remote Tables of a relationship</td><td><a href="https://beta.tinybase.org/demos/ui-components/relationshipinhtmltable">demo</a></td></tr><tr><td>ResultTableInHtmlTable</td><td>Renders a ResultTable.</td><td><a href="https://beta.tinybase.org/demos/ui-components/resulttableinhtmltable">demo</a></td></tr><tr><td>ResultSortedTableInHtmlTable</td><td>Renders a sorted ResultTable, with optional interactivity.</td><td><a href="https://beta.tinybase.org/demos/ui-components/resultsortedtableinhtmltable">demo</a></td></tr><tr><td>EditableCellView</td><td>Renders a Cell and lets you change its type and value.</td><td><a href="https://beta.tinybase.org/demos/ui-components/editablecellview">demo</a></td></tr><tr><td>EditableValueView</td><td>Renders a Value and lets you change its type and value.</td><td><a href="https://beta.tinybase.org/demos/ui-components/editablevalueview">demo</a></td></tr></tbody></table></div><p>These pre-built components are showcased in the <a href="https://beta.tinybase.org/demos/ui-components/">UI Components</a> demos. Using them should be very familiar if you have used the more abstract ui-react module:</p>

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

<p>The EditableCellView component and EditableValueView component are interactive input controls for updating Cell and Value content respectively. You can generally use them across your table views by adding the <code>editable</code> prop to your table component.</p><h3 id="the-new-inspector">The new Inspector</h3><p><img src="https://beta.tinybase.org/store-inspector.webp" alt="Inspector" title="Inspector"></p><p>The new Inspector component allows you to view, understand, and edit the content of a Store in a debug web environment. Try it out in most of the demos on the site, including the <a href="https://beta.tinybase.org/demos/movie-database/">Movie Database</a> demo, pictured. This requires a debug build of the new ui-react-dom module, which is now also included in the UMD distribution.</p><p>Also in this release, the getResultTableCellIds method and addResultTableCellIdsListener method have been added to the Queries object. The equivalent useResultTableCellIds hook and useResultTableCellIdsListener hook have also been added to ui-react module. A number of other minor React hooks have been added to support the components above.</p><p><a href="https://beta.tinybase.org/demos/">Demos</a> have been updated to demonstrate the ui-react-dom module and the Inspector component where appropriate.</p><p>(NB: Previous to v5.0, this component was called <code>StoreInspector</code>.)</p><h2 id="v4-0">v4.0</h2><p>This major release provides Persister modules that connect <a href="https://beta.tinybase.org/">TinyBase</a> to SQLite databases (in both browser and server contexts), and CRDT frameworks that can provide synchronization and local-first reconciliation:</p><div class="table"><table><thead><tr><th>Module</th><th>Function</th><th>Storage</th></tr></thead><tbody><tr><td>persister-sqlite3</td><td>createSqlite3Persister</td><td>SQLite in Node, via <a href="https://github.com/TryGhost/node-sqlite3">sqlite3</a></td></tr><tr><td>persister-sqlite-wasm</td><td>createSqliteWasmPersister</td><td>SQLite in a browser, via <a href="https://github.com/tomayac/sqlite-wasm">sqlite-wasm</a></td></tr><tr><td>persister-cr-sqlite-wasm</td><td>createCrSqliteWasmPersister</td><td>SQLite CRDTs, via <a href="https://github.com/vlcn-io/cr-sqlite">cr-sqlite-wasm</a></td></tr><tr><td>persister-yjs</td><td>createYjsPersister</td><td>Yjs CRDTs, via <a href="https://github.com/yjs/yjs">yjs</a></td></tr><tr><td>persister-automerge</td><td>createSqliteWasmPersister</td><td>Automerge CRDTs, via <a href="https://github.com/automerge/automerge-repo">automerge-repo</a></td></tr></tbody></table></div><p>See the <a href="https://beta.tinybase.org/guides/persistence/database-persistence/">Database Persistence</a> guide for details on how to work with SQLite databases, and the <a href="https://beta.tinybase.org/guides/schemas-and-persistence/synchronizing-data/">Synchronizing Data</a> guide for more complex synchronization with the CRDT frameworks.</p><p>Take a look at the <a href="https://github.com/tinyplex/vite-tinybase-ts-react-crsqlite">vite-tinybase-ts-react-crsqlite</a> template, for example, which demonstrates Vulcan&#x27;s cr-sqlite to provide persistence and synchronization via this technique.</p><h3 id="sqlite-databases">SQLite databases</h3><p>You can persist Store data to a database with either a JSON serialization or tabular mapping. (See the DatabasePersisterConfig documentation for more details).</p><p>For example, this creates a Persister object and saves and loads the Store to and from a local SQLite database. It uses an explicit tabular one-to-one mapping for the &#x27;pets&#x27; table:</p>

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

<h3 id="crdt-frameworks">CRDT Frameworks</h3><p>CRDTs allow complex reconciliation and synchronization between clients. Yjs and Automerge are two popular examples. The API should be familiar! The following will persist a <a href="https://beta.tinybase.org/">TinyBase</a> Store to a Yjs document:</p>

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

<h3 id="new-methods">New methods</h3><p>There are three new methods on the Store object. The getContent method lets you get the Store&#x27;s Tables and Values in one call. The corresponding setContent method lets you set them simultaneously.</p><p>The new setTransactionChanges method lets you replay TransactionChanges (received at the end of a transaction via listeners) into a Store, allowing you to take changes from one Store and apply them to another.</p><p>Persisters now provide a schedule method that lets you queue up asynchronous tasks, such as when persisting data that requires complex sequences of actions.</p><h3 id="breaking-changes">Breaking changes</h3><p>The way that data is provided to the DoRollback and TransactionListener callbacks at the end of a transaction has changed. Although previously they directly received content about changed Cell and Value content, they now receive functions that they can choose to call to receive that same data. This has a performance improvement, and your callback or listener can choose between concise TransactionChanges or more verbose TransactionLog structures for that data.</p><p>If you have build a custom persister, you will need to update your implementation. Most notably, the <code>setPersisted</code> function parameter is provided with a <code>getContent</code> function to get the content from the Store itself, rather than being passed pre-serialized JSON. It also receives information about the changes made during a transaction. The <code>getPersisted</code> function must return the content (or nothing) rather than JSON. <code>startListeningToPersisted</code> has been renamed <code>addPersisterListener</code>, and <code>stopListeningToPersisted</code> has been renamed <code>delPersisterListener</code>.</p><h2 id="v3-3">v3.3</h2><p>This release allows you to track the Cell Ids used across a whole Table, regardless of which Row they are in.</p><p>In a Table (particularly in a Store without a TablesSchema), different Rows can use different Cells. Consider this Store, where each pet has a different set of Cell Ids:</p>

```js
store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat', friendly: true},
  cujo: {legs: 4},
});
```

<p>Prior to v3.3, you could only get the Cell Ids used in each Row at a time (with the getCellIds method). But you can now use the getTableCellIds method to get the union of all the Cell Ids used across the Table:</p>

```js
console.log(store.getCellIds('pets', 'fido')); // previously available
// -> ['species']

console.log(store.getTableCellIds('pets')); //    new in v3.3
// -> ['species', 'friendly', 'legs']
```

<p>You can register a listener to track the Cell Ids used across a Table with the new addTableCellIdsListener method. Use cases for this might include knowing which headers to render when displaying a sparse Table in a user interface, or synchronizing data with relational or column-oriented database system.</p><p>There is also a corresponding useTableCellIds hook in the optional ui-react module for accessing these Ids reactively, and a useTableCellIdsListener hook for more advanced purposes.</p><p>Note that the bookkeeping behind these new accessors and listeners is efficient and should not be slowed by the number of Rows in the Table.</p><p>This release also passes a getIdChanges function to every Id-related listener that, when called, returns information about the Id changes, both additions and removals, during a transaction. See the TableIdsListener type, for example.</p>

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

<h2 id="v3-2">v3.2</h2><p>This release lets you add a listener to the start of a transaction, and detect that a set of changes are about to be made to a Store.</p><p>To use this, call the addStartTransactionListener method on your Store. The listener you add can itself mutate the data in the Store.</p><p>From this release onwards, listeners added with the existing addWillFinishTransactionListener method are also able to mutate data. <a href="https://beta.tinybase.org/guides/the-basics/transactions/">Transactions</a> added with the existing addDidFinishTransactionListener method <em>cannot</em> mutate data.</p>

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

<p>This release also fixes a bug where using the explicit startTransaction method <em>inside</em> another listener could create infinite recursion.</p><h2 id="v3-1">v3.1</h2><p>This new release adds a powerful schema-based type system to <a href="https://beta.tinybase.org/">TinyBase</a>.</p><p>If you define the shape and structure of your data with a TablesSchema or ValuesSchema, you can benefit from an enhanced developer experience when operating on it. For example:</p>

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

<p>The schema-based typing is used comprehensively throughout every module - from the core Store interface all the way through to the ui-react module. See the new <a href="https://beta.tinybase.org/guides/schemas/schema-based-typing/">Schema-Based Typing</a> guide for instructions on how to use it.</p><p>This now means that there are <em>three</em> progressive ways to use TypeScript with <a href="https://beta.tinybase.org/">TinyBase</a>:</p><ul><li>Basic Type Support (since v1.0)</li><li>Schema-based Typing (since v3.1)</li><li>ORM-like type definitions (since v2.2)</li></ul><p>These are each described in the new <a href="https://beta.tinybase.org/guides/the-basics/tinybase-and-typescript/">TinyBase And TypeScript</a> guide.</p><p>Also in v3.1, the ORM-like type definition generation in the tools module has been extended to emit ui-react module definitions.</p><p>Finally, v3.1.1 adds a <code>reuseRowIds</code> parameter to the addRow method and the useAddRowCallback hook. It defaults to <code>true</code>, for backwards compatibility, but if set to <code>false</code>, new Row Ids will not be reused unless the whole Table is deleted.</p><h2 id="v3-0">v3.0</h2><p>This major new release adds key/value store functionality to <a href="https://beta.tinybase.org/">TinyBase</a>. Alongside existing tabular data, it allows you to get, set, and listen to, individual Value items, each with a unique Id.</p>

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

<p><a href="https://beta.tinybase.org/guides/">Guides</a> and documentation have been fully updated, and certain demos - such as the <a href="https://beta.tinybase.org/demos/todo-app/todo-app-v2-indexes/">Todo App v2 (indexes)</a> demo, and the <a href="https://beta.tinybase.org/demos/countries/">Countries</a> demo - have been updated to use this new functionality.</p><p>If you use the optional ui-react module with <a href="https://beta.tinybase.org/">TinyBase</a>, v3.0 now uses and expects React v18.</p><p>In terms of core API changes in v3.0, there are some minor breaking changes (see below), but the majority of the alterations are additions.</p><p>The Store object gains the following:</p><ul><li>The setValues method, setPartialValues method, and setValue method, to set keyed value data into the Store.</li><li>The getValues method, getValueIds method, and getValue method, to get keyed value data out of the Store.</li><li>The delValues method and delValue method for removing keyed value data.</li><li>The addValuesListener method, addValueIdsListener method, addValueListener method, and addInvalidValueListener method, for listening to changes to keyed value data.</li><li>The hasValues method, hasValue method, and forEachValue method, for existence and enumeration purposes.</li><li>The getTablesJson method, getValuesJson method, setTablesJson method, and setValuesJson method, for reading and writing tabular and keyed value data to and from a JSON string. Also see below.</li><li>The getTablesSchemaJson method, getValuesSchemaJson method, setTablesSchema method, setValuesSchema method, delTablesSchema method, and delValuesSchema method, for reading and writing tabular and keyed value schemas for the Store. Also see below.</li></ul><p>The following types have been added to the store module:</p><ul><li>Values, Value, and ValueOrUndefined, representing keyed value data in a Store.</li><li>ValueListener and InvalidValueListener, to describe functions used to listen to (valid or invalid) changes to a Value.</li><li>ValuesSchema and ValueSchema, to describe the keyed Values that can be set in a Store and their types.</li><li>ValueCallback, MapValue, ChangedValues, and InvalidValues, which also correspond to their &#x27;Cell&#x27; equivalents.</li></ul><p>Additionally:</p><ul><li>The persisters&#x27; load method and startAutoLoad method take an optional <code>initialValues</code> parameter for setting Values when a persisted Store is bootstrapped.</li><li>The Checkpoints module will undo and redo changes to keyed values in the same way they do for tabular data.</li><li>The tools module provides a getStoreValuesSchema method for inferring value-based schemas. The getStoreApi method and getPrettyStoreApi method now also provides an ORM-like code-generated API for schematized key values.</li></ul><p>All attempts have been made to provide backwards compatibility and/or easy upgrade paths.</p><p>In previous versions, getJson method would get a JSON serialization of the Store&#x27;s tabular data. That functionality is now provided by the getTablesJson method, and the getJson method instead now returns a two-part array containing the tabular data and the keyed value data.</p><p>Similarly, the getSchemaJson method used to return the tabular schema, now provided by the getTablesSchemaJson method. The getSchemaJson method instead now returns a two-part array of tabular schema and the keyed value schema.</p><p>The setJson method used to take a serialization of just the tabular data object. That&#x27;s now provided by the setTablesJson method, and the setJson method instead expects a two-part array containing the tabular data and the keyed value data (as emitted by the getJson method). However, for backwards compatibility, if the setJson method is passed an object, it <em>will</em> set the tabular data, as it did prior to v3.0.</p><p>Along similar lines, the setSchema method&#x27;s previous behavior is now provided by the setTablesSchema method. The setSchema method now takes two arguments, the second of which is optional, also aiding backward compatibility. The delSchema method removes both types of schema.</p><h2 id="v2-2">v2.2</h2><p>This release includes a new tools module. These tools are not intended for production use, but are instead to be used as part of your engineering workflow to perform tasks like generating APIs from schemas, or schemas from data. For example:</p>

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

<p>Finally, the tools module also provides ways to track the overall size and structure of a Store for use while debugging.</p><h2 id="v2-1">v2.1</h2><p>This release allows you to create indexes where a single Row Id can exist in multiple slices. You can utilize this to build simple keyword searches, for example.</p><p>Simply provide a custom getSliceIdOrIds function in the setIndexDefinition method that returns an array of Slice Ids, rather than a single Id:</p>

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

<p>This functionality is showcased in the <a href="https://beta.tinybase.org/demos/word-frequencies/">Word Frequencies</a> demo if you would like to see it in action.</p><h2 id="v2-0">v2.0</h2><p><strong>Announcing the next major version of <a href="https://beta.tinybase.org/">TinyBase</a> 2.0!</strong> This is an exciting release that evolves <a href="https://beta.tinybase.org/">TinyBase</a> towards becoming a reactive, relational data store, complete with querying, sorting, and pagination. Here are a few of the highlights...</p><h3 id="query-engine">Query Engine</h3><p>The <a href="https://beta.tinybase.org/guides/making-queries/using-queries/">flagship feature</a> of this release is the new queries module. This allows you to build expressive queries against your data with a SQL-adjacent API that we&#x27;ve cheekily called <a href="https://beta.tinybase.org/guides/making-queries/tinyql/">TinyQL</a>. The query engine lets you select, join, filter, group, sort and paginate data. And of course, it&#x27;s all reactive!</p><p>The best way to see the power of this new engine is with the two new demos we&#x27;ve included this release:</p><p><img src="https://beta.tinybase.org/car-analysis.webp" alt="Thumbnail of demo" title="Thumbnail of demo"> The <a href="https://beta.tinybase.org/demos/car-analysis/">Car Analysis</a> demo showcases the analytical query capabilities of <a href="https://beta.tinybase.org/">TinyBase</a> v2.0, grouping and sorting dimensional data for lightweight analytical usage, graphing, and tabular display. <em><a href="https://beta.tinybase.org/demos/car-analysis/">Try this demo here</a>.</em></p><p><img src="https://beta.tinybase.org/movie-database.webp" alt="Thumbnail of demo" title="Thumbnail of demo"> The <a href="https://beta.tinybase.org/demos/movie-database/">Movie Database</a> demo showcases the relational query capabilities of <a href="https://beta.tinybase.org/">TinyBase</a> v2.0, joining together information about movies, directors, and actors from across multiple source tables. <em><a href="https://beta.tinybase.org/demos/movie-database/">Try this demo here</a>.</em></p><h3 id="sorting-and-pagination">Sorting and Pagination</h3><p>To complement the query engine, you can now sort and paginate Row Ids. This makes it very easy to build grid-like user interfaces (also shown in the demos above). To achieve this, the Store now includes the getSortedRowIds method (and the addSortedRowIdsListener method for reactivity), and the Queries object includes the equivalent getResultSortedRowIds method and addResultSortedRowIdsListener method.</p><p>These are also exposed in the optional ui-react module via the useSortedRowIds hook, the useResultSortedRowIds hook, the SortedTableView component and the ResultSortedTableView component, and so on.</p><h3 id="queries-in-the-ui-react-module">Queries in the ui-react module</h3><p>The v2.0 query functionality is fully supported by the ui-react module (to match support for Store, Metrics, Indexes, and Relationship objects). The useCreateQueries hook memoizes the creation of app- or component-wide Query objects; and the useResultTable hook, useResultRow hook, useResultCell hook (and so on) let you bind you component to the results of a query.</p><p>This is, of course, supplemented with higher-level components: the ResultTableView component, the ResultRowView component, the ResultCellView component, and so on. See the <a href="https://beta.tinybase.org/guides/using-queries/building-a-ui-with-queries/">Building A UI With Queries</a> guide for more details.</p><h3 id="it-s-a-big-release">It&#x27;s a big release!</h3><p>Thank you for all your support as we brought this important new release to life, and we hope you enjoy using it as much as we did building it. Please provide feedback via <a href="https://github.com/tinyplex/tinybase">Github</a> and <a href="https://twitter.com/tinybasejs">Twitter</a>!</p><h2 id="v1-3">v1.3</h2><p>Adds support for explicit transaction start and finish methods, as well as listeners for transactions finishing.</p><p>The startTransaction method and finishTransaction method allow you to explicitly enclose a transaction that will make multiple mutations to the Store, buffering all calls to the relevant listeners until it completes when you call the finishTransaction method.</p><p>Unlike the transaction method, this approach is useful when you have a more &#x27;open-ended&#x27; transaction, such as one containing mutations triggered from other events that are asynchronous or not occurring inline to your code. You must remember to also call the finishTransaction method explicitly when the transaction is started with the startTransaction method, of course.</p>

```js
store.setTables({pets: {fido: {species: 'dog'}}});
store.addRowListener('pets', 'fido', () => console.log('Fido changed'));

store.startTransaction();
store.setCell('pets', 'fido', 'color', 'brown');
store.setCell('pets', 'fido', 'sold', true);
store.finishTransaction();
// -> 'Fido changed'
```

<p>In addition, see the addWillFinishTransactionListener method and the addDidFinishTransactionListener method for details around listening to transactions completing.</p><p>Together, this release allows stores to couple their transaction life-cycles together, which we need for the query engine.</p><p>Note: this API was updated to be more comprehensive in v4.0.</p><h2 id="v1-2">v1.2</h2><p>This adds a way to revert transactions if they have not met certain conditions.</p><p>When using the transaction method, you can provide an optional <code>doRollback</code> callback which should return true if you want to revert the whole transaction at its conclusion.</p><p>The callback is provided with two objects, <code>changedCells</code> and <code>invalidCells</code>, which list all the net changes and invalid attempts at changes that were made during the transaction. You will most likely use the contents of those objects to decide whether the transaction should be rolled back.</p><p>Note: this API was updated to be more comprehensive in v4.0.</p><h2 id="v1-1">v1.1</h2><p>This release allows you to listen to invalid data being added to a Store, allowing you to gracefully handle errors, rather than them failing silently.</p><p>There is a new listener type InvalidCellListener and a addInvalidCellListener method in the Store interface.</p><p>These allow you to keep track of failed attempts to update the Store with invalid Cell data. These listeners can also be mutators, allowing you to address any failed writes programmatically.</p><p>For more information, please see the addInvalidCellListener method documentation. In particular, this explains how this listener behaves for a Store with a TablesSchema.</p>