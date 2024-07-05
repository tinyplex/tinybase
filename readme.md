<section id="hero"><h2 id="the-reactive-data-store-for-local-first-apps">The <em>reactive</em> data store for <span>local-first apps</span>.</h2></section><p><a href="https://beta.tinybase.org/guides/releases/#v5-0"><em>NEW!</em> v5.0 release</a> <span id="one-with">&quot;The One You Can Sync&quot;</span></p><p><a class="start" href="https://beta.tinybase.org/guides/the-basics/getting-started/">Get started</a></p><p><a href="https://beta.tinybase.org/demos/">Try the demos</a></p><p><a href="https://beta.tinybase.org/api/store/interfaces/store/store/">Read the docs</a></p><hr><section><h2 id="it-s-reactive">It&#x27;s <em>Reactive</em></h2><p>TinyBase lets you <a href="#register-granular-listeners">listen to changes</a> made to any part of your data. This means your app will be fast, since you only spend rendering cycles on things that change. The optional <a href="#call-hooks-to-bind-to-data">bindings to React</a> and <a href="#pre-built-reactive-components">pre-built components</a> let you easily build fully reactive UIs on top of TinyBase. You even get a built-in <a href="#set-checkpoints-for-an-undo-stack">undo stack</a>, and <a href="#an-inspector-for-your-data">developer tools</a>!</p></section><section><h2 id="it-s-database-like">It&#x27;s <em>Database-Like</em></h2><p>Store <a href="#start-with-a-simple-key-value-store">key-value data</a> and <a href="#level-up-to-use-tabular-data">tabular data</a> with optional typed <a href="&#x27;#apply-schemas-to-tables-values">schematization</a> to model your app&#x27;s data structures. TinyBase provides built-in <a href="#create-indexes-for-fast-lookups">indexing</a>, <a href="#define-metrics-and-aggregations">metric aggregation</a>, and tabular <a href="#model-table-relationships">relationships</a> APIs - or the powerful <a href="#build-complex-queries-with-tinyql">query engine</a> to select, join, filter, and group data (reactively!) without SQL.</p></section><section><h2 id="it-synchronizes">It <em>Synchronizes</em></h2><p>TinyBase is an in-memory data store, but you can easily <a href="#persist-to-storage-sqlite-crdts">persist</a> your data to <a href="https://beta.tinybase.org/api/persister-browser">browser storage</a>, <a href="https://beta.tinybase.org/api/persister-indexed-db">IndexedDB</a>, many flavors of <a href="https://beta.tinybase.org/guides/persistence/database-persistence/">database</a>, and <a href="https://beta.tinybase.org/guides/persistence/third-party-crdt-persistence/">more</a>. TinyBase now has native CRDT support, meaning that you can <a href="https://beta.tinybase.org/guides/synchronization/">natively synchronize</a> and merge data across multiple sources and clients.</p></section><section><h2 id="it-s-built-for-a-local-first-world">It&#x27;s Built For A <em>Local-First</em> World</h2><p>TinyBase works anywhere that JavaScript does, but it&#x27;s especially great for local-first apps: where data is stored locally on the user&#x27;s device and that can be run offline. It&#x27;s tiny by name, tiny by nature: just <a href="#did-we-say-tiny">5.3kB-12.7kB</a> and with no dependencies - yet <a href="#well-tested-and-documented">100% tested</a>, <a href="https://beta.tinybase.org/guides/the-basics/getting-started/">fully documented</a>, and of course, <a href="https://github.com/tinyplex/tinybase">open source</a>!</p></section><hr><section id="friends"><h2 id="tinybase-works-great-on-its-own-but-also-plays-well-with-friends">TinyBase works great on its own, but also plays well with friends!</h2><div><a href="https://beta.tinybase.org/guides/building-uis/getting-started-with-ui-react"><img width="48" src="https://beta.tinybase.org/react.svg"> React</a></div><div><a href="https://beta.tinybase.org/api/persister-partykit-client"><img width="48" src="https://beta.tinybase.org/partykit.svg"> PartyKit</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/expo.svg">Expo SQLite</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/electric.svg">ElectricSQL</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/sqlite.svg"> SQLite</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/turso.svg">Turso</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/powersync.svg">PowerSync</a></div><div><a href="https://beta.tinybase.org/api/persister-indexed-db/functions/creation/createindexeddbpersister"><img width="48" src="https://beta.tinybase.org/indexeddb.svg"> IndexedDB</a></div><div><a href="https://beta.tinybase.org/api/persister-yjs/functions/creation/createyjspersister"><img width="48" src="https://beta.tinybase.org/yjs.svg"> YJS</a></div><div><a href="https://beta.tinybase.org/api/persister-cr-sqlite-wasm"><img width="48" src="https://beta.tinybase.org/crsqlite.png"> CR-SQLite</a></div><div><a href="https://beta.tinybase.org/api/persister-automerge"><img width="48" src="https://beta.tinybase.org/automerge.svg"> Automerge</a></div></section><hr><section id="follow"><a href="https://github.com/tinyplex/tinybase" target="_blank"><img src="https://img.shields.io/github/stars/tinyplex/tinybase?style=for-the-badge&amp;logo=GitHub&amp;logoColor=%23fff&amp;label=GitHub&amp;labelColor=%23d81b60&amp;color=%23333"> </a><a href="https://discord.com/invite/mGz3mevwP8" target="_blank"><img src="https://img.shields.io/discord/1027918215323590676?style=for-the-badge&amp;logo=discord&amp;logoColor=%23fff&amp;label=Discord&amp;labelColor=%233131e8&amp;color=%23333"> </a><a href="https://twitter.com/tinybasejs" target="_blank"><img src="https://img.shields.io/twitter/follow/tinybasejs?style=for-the-badge&amp;logo=x&amp;logoColor=%23fff&amp;label=Twitter&amp;labelColor=%23333&amp;color=%23333"></a><br><a href="https://github.com/tinyplex/tinybase/discussions" target="_blank"><img src="https://img.shields.io/github/discussions/tinyplex/tinybase?style=for-the-badge&amp;logo=GitHub&amp;logoColor=%23fff&amp;label=Ideas&amp;labelColor=%23d81b60&amp;color=%23333"> </a><a href="https://github.com/tinyplex/tinybase/issues" target="_blank"><img src="https://img.shields.io/github/issues/tinyplex/tinybase?style=for-the-badge&amp;logo=GitHub&amp;logoColor=%23fff&amp;label=Issues&amp;labelColor=%23d81b60&amp;color=%23333"> </a><a href="#well-tested-and-documented"><img src="https://img.shields.io/badge/Tests-100%25-green?style=for-the-badge&amp;logo=jest&amp;logoColor=%23fff&amp;color=%23333&amp;labelColor=%2387c305"> </a><a href="https://www.npmjs.com/package/tinybase/v/5.0.0-beta.28" target="_blank"><img src="https://img.shields.io/npm/v/tinybase?style=for-the-badge&amp;logo=npm&amp;logoColor=%23fff&amp;labelColor=%23bd0005&amp;color=%23333"></a></section><hr><section><h2 id="start-with-a-simple-key-value-store">Start with a simple key-value store.</h2><p>Creating a Store requires just a simple call to the createStore function. Once you have one, you can easily set Values in it by unique Id. And of course you can easily get them back out again.</p><p>Read more about using keyed value data in <a href="https://beta.tinybase.org/guides/the-basics/">The Basics</a> guide.</p></section>

```js
import {createStore} from 'tinybase';

const store = createStore()
  .setValues({employees: 3})
  .setValue('open', true);

console.log(store.getValues());
// -> {employees: 3, open: true}
```

<section><h2 id="level-up-to-use-tabular-data">Level up to use tabular data.</h2><p>For other types of data applications, a tabular data structure is more useful. TinyBase lets you set and get nested Table, Row, or Cell data, by unique Id - and in the same Store as the keyed values!</p><p>Read more about setting and changing data in <a href="https://beta.tinybase.org/guides/the-basics/">The Basics</a> guide.</p></section>

```js
store
  .setTable('pets', {fido: {species: 'dog'}})
  .setCell('pets', 'fido', 'color', 'brown');

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog', color: 'brown'}
```

<section><h2 id="register-granular-listeners">Register granular listeners.</h2><p>The magic starts to happen when you register listeners on a Value, Table, Row, or Cell. They get called when any part of that object changes. You can also use wildcards - useful when you don&#x27;t know the Id of the objects that might change.</p><p>Read more about listeners in the <a href="https://beta.tinybase.org/guides/the-basics/listening-to-stores/">Listening To Stores</a> guide.</p></section>

```js
const listenerId = store.addTableListener('pets', () =>
  console.log('changed'),
);

store.setCell('pets', 'fido', 'sold', false);
// -> 'changed'

store.delListener(listenerId);
```

<section><h2 id="call-hooks-to-bind-to-data">Call hooks to bind to data.</h2><p>If you&#x27;re using React in your application, the optional ui-react module provides hooks to bind to the data in a Store.</p><p>More magic! The useCell hook in this example fetches the dog&#x27;s color. But it also registers a listener on that cell that will fire and re-render the component whenever the value changes.</p><p>Basically you simply describe what data you want in your user interface and TinyBase will take care of the whole lifecycle of updating it for you.</p><p>Read more about the using hooks in the <a href="https://beta.tinybase.org/guides/building-uis/using-react-hooks/">Using React Hooks</a> guide.</p></section>

```jsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useCell} from 'tinybase/ui-react';

const App1 = () => {
  const color = useCell('pets', 'fido', 'color', store);
  return <>Color: {color}</>;
};

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App1 />);
console.log(app.innerHTML);
// -> 'Color: brown'

store.setCell('pets', 'fido', 'color', 'walnut');
console.log(app.innerHTML);
// -> 'Color: walnut'
```

<section><h2 id="pre-built-reactive-components">Pre-built reactive components.</h2><p>The ui-react module provides bare React components that let you build up a fully reactive user interface based on a Store.</p><p>For web applications in particular, the new ui-react-dom module provides pre-built components for tabular display of your data, with lots of customization and interactivity options.</p><p>Try them out in the <a href="https://beta.tinybase.org/demos/ui-components/">UI Components</a> demos, and read more about the underlying ui-react module in the <a href="https://beta.tinybase.org/guides/building-uis/">Building UIs</a> guides.</p></section><img src="https://beta.tinybase.org/ui-react-dom.webp"><section><h2 id="an-inspector-for-your-data">An inspector for your data.</h2><p>If you are building a web application, the new Inspector component lets you overlay a view of the data in your Store, Indexes, Relationships, and so on. You can even edit the data in place and see it update in your app immediately.</p><p>Read more about this powerful new tool in the <a href="https://beta.tinybase.org/guides/developer-tools/inspecting-data/">Inspecting Data</a> guide.</p></section><img src="https://beta.tinybase.org/store-inspector.webp"><section><h2 id="apply-schemas-to-tables-values">Apply schemas to tables &amp; values.</h2><p>By default, a Store can contain any arbitrary Value, and a Row can contain any arbitrary Cell. But you can add a ValuesSchema or a TablesSchema to a Store to ensure that the values are always what you expect: constraining their types, and providing defaults.</p><p>In this example, we set a new Row without the <code>sold</code> Cell in it. The schema ensures it&#x27;s present with default of <code>false</code>.</p><p>Read more about schemas in the <a href="https://beta.tinybase.org/guides/schemas/">Schemas</a> guide.</p></section>

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    color: {type: 'string'},
    sold: {type: 'boolean', default: false},
  },
});

store.setRow('pets', 'polly', {species: 'parrot'});
console.log(store.getRow('pets', 'polly'));
// -> {species: 'parrot', sold: false}

store.delTablesSchema();
```

<section><h2 id="persist-to-storage-sqlite-crdts">Persist to storage, SQLite, CRDTs.</h2><p>You can easily persist a Store between browser page reloads or sessions. You can also synchronize it with a web endpoint, or (if you&#x27;re using TinyBase in an appropriate environment), load and save it to a file. <a href="https://beta.tinybase.org/guides/releases/#v4-0">New in v4.0</a>, you can bind <a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence/">TinyBase to SQLite</a> via a range of modules, or to <a href="https://yjs.dev/">Yjs</a> or <a href="https://automerge.org/">Automerge</a> CRDT documents.</p><p>Read more about persisters in the <a href="https://beta.tinybase.org/guides/persistence/">Persistence</a> guides.</p></section>

```js
import {createSessionPersister} from 'tinybase/persisters/persister-browser';

const persister = createSessionPersister(store, 'demo');
await persister.save();

console.log(sessionStorage.getItem('demo'));
// ->
`
[
  {
    "pets":{
      "fido":{"species":"dog","color":"walnut","sold":false},
      "polly":{"species":"parrot","sold":false}
    }
  },
  {"employees":3,"open":true}
]
`;

persister.destroy();
sessionStorage.clear();
```

<section><h2 id="build-complex-queries-with-tinyql">Build complex queries with <a href="https://beta.tinybase.org/guides/using-queries/tinyql/">TinyQL</a>.</h2><p>The Queries object lets you query data across tables, with filtering and aggregation - using a SQL-adjacent syntax called <a href="https://beta.tinybase.org/guides/using-queries/tinyql/">TinyQL</a>.</p><p>Accessors and listeners let you sort and paginate the results efficiently, making building rich tabular interfaces easier than ever.</p><p>In this example, we have two tables: of pets and their owners. They are joined together by the pet&#x27;s ownerId Cell. We select the pet&#x27;s species, and the owner&#x27;s state, and then aggregate the prices for the combinations.</p><p>We access the results by descending price, essentially answering the question: &quot;which is the highest-priced species, and in which state?&quot;</p><p>Needless to say, the results are reactive too! You can add listeners to queries just as easily as you do to raw tables.</p><p>Read more about Queries in the <a href="https://beta.tinybase.org/guides/releases/#v2-0">v2.0 Release Notes</a>, the <a href="https://beta.tinybase.org/guides/using-queries/">Using Queries</a> guide, and the <a href="https://beta.tinybase.org/demos/car-analysis/">Car Analysis</a> demo and <a href="https://beta.tinybase.org/demos/movie-database/">Movie Database</a> demo.</p></section>

```js
import {createQueries} from 'tinybase';

store
  .setTable('pets', {
    fido: {species: 'dog', ownerId: '1', price: 5},
    rex: {species: 'dog', ownerId: '2', price: 4},
    felix: {species: 'cat', ownerId: '2', price: 3},
    cujo: {species: 'dog', ownerId: '3', price: 4},
  })
  .setTable('owners', {
    1: {name: 'Alice', state: 'CA'},
    2: {name: 'Bob', state: 'CA'},
    3: {name: 'Carol', state: 'WA'},
  });

const queries = createQueries(store);
queries.setQueryDefinition(
  'prices',
  'pets',
  ({select, join, group}) => {
    select('species');
    select('owners', 'state');
    select('price');
    join('owners', 'ownerId');
    group('price', 'avg').as('avgPrice');
  },
);

queries
  .getResultSortedRowIds('prices', 'avgPrice', true)
  .forEach((rowId) => {
    console.log(queries.getResultRow('prices', rowId));
  });
// -> {species: 'dog', state: 'CA', avgPrice: 4.5}
// -> {species: 'dog', state: 'WA', avgPrice: 4}
// -> {species: 'cat', state: 'CA', avgPrice: 3}

queries.destroy();
```

<section><h2 id="define-metrics-and-aggregations">Define metrics and aggregations.</h2><p>A Metrics object makes it easy to keep a running aggregation of Cell values in each Row of a Table. This is useful for counting rows, but also supports averages, ranges of values, or arbitrary aggregations.</p><p>In this example, we create a new table of the pet species, and keep a track of which is most expensive. When we add horses to our pet store, the listener detects that the highest price has changed.</p><p>Read more about Metrics in the <a href="https://beta.tinybase.org/guides/using-metrics/">Using Metrics</a> guide.</p></section>

```js
import {createMetrics} from 'tinybase';

store.setTable('species', {
  dog: {price: 5},
  cat: {price: 4},
  worm: {price: 1},
});

const metrics = createMetrics(store);
metrics.setMetricDefinition(
  'highestPrice', // metricId
  'species', //      tableId to aggregate
  'max', //          aggregation
  'price', //        cellId to aggregate
);

console.log(metrics.getMetric('highestPrice'));
// -> 5

metrics.addMetricListener('highestPrice', () =>
  console.log(metrics.getMetric('highestPrice')),
);
store.setCell('species', 'horse', 'price', 20);
// -> 20

metrics.destroy();
```

<section><h2 id="create-indexes-for-fast-lookups">Create indexes for fast lookups.</h2><p>An Indexes object makes it easy to look up all the Row objects that have a certain value in a Cell.</p><p>In this example, we create an index on the <code>species</code> Cell values. We can then get the the list of distinct Cell value present for that index (known as &#x27;slices&#x27;), and the set of Row objects that match each value.</p><p>Indexes objects are reactive too. So you can set listeners on them just as you do for the data in the underlying Store.</p><p>Read more about Indexes in the <a href="https://beta.tinybase.org/guides/using-indexes/">Using Indexes</a> guide.</p></section>

```js
import {createIndexes} from 'tinybase';

const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index
);

console.log(indexes.getSliceIds('bySpecies'));
// -> ['dog', 'cat']
console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['fido', 'rex', 'cujo']

indexes.addSliceIdsListener('bySpecies', () =>
  console.log(indexes.getSliceIds('bySpecies')),
);
store.setRow('pets', 'lowly', {species: 'worm'});
// -> ['dog', 'cat', 'worm']

indexes.destroy();
```

<section><h2 id="model-table-relationships">Model table relationships.</h2><p>A Relationships object lets you associate a Row in a local Table with the Id of a Row in a remote Table. You can also reference a table to itself to create linked lists.</p><p>In this example, the <code>species</code> Cell of the <code>pets</code> Table is used to create a relationship to the <code>species</code> Table, so that we can access the price of a given pet.</p><p>Like everything else, you can set listeners on Relationships too.</p><p>Read more about Relationships in the <a href="https://beta.tinybase.org/guides/using-relationships/">Using Relationships</a> guide.</p></section>

```js
import {createRelationships} from 'tinybase';

const relationships = createRelationships(store);
relationships.setRelationshipDefinition(
  'petSpecies', // relationshipId
  'pets', //       local tableId to link from
  'species', //    remote tableId to link to
  'species', //    cellId containing remote key
);

console.log(
  store.getCell(
    relationships.getRemoteTableId('petSpecies'),
    relationships.getRemoteRowId('petSpecies', 'fido'),
    'price',
  ),
);
// -> 5

relationships.destroy();
```

<section><h2 id="set-checkpoints-for-an-undo-stack">Set checkpoints for an undo stack.</h2><p>A Checkpoints object lets you set checkpoints on a Store. Move forward and backward through them to create undo and redo functions.</p><p>In this example, we set a checkpoint, then sell one of the pets. Later, the pet is brought back to the shop, and we go back to that checkpoint to revert the store to its previous state.</p><p>Read more about Checkpoints in the <a href="https://beta.tinybase.org/guides/using-checkpoints/">Using Checkpoints</a> guide.</p></section>

```js
import {createCheckpoints} from 'tinybase';

const checkpoints = createCheckpoints(store);

store.setCell('pets', 'felix', 'sold', false);
checkpoints.addCheckpoint('pre-sale');

store.setCell('pets', 'felix', 'sold', true);
console.log(store.getCell('pets', 'felix', 'sold'));
// -> true

checkpoints.goBackward();
console.log(store.getCell('pets', 'felix', 'sold'));
// -> false
```

<section><h2 id="type-definitions-orm-like-apis">Type definitions &amp; ORM-like APIs</h2><p>TinyBase has comprehensive type definitions, and even offers definitions that infer API types from the data schemas you apply.</p><p>Furthermore, you can easily create TypeScript <code>.d.ts</code> definitions that model your data and encourage type-safety when reading and writing data - as well as <code>.ts</code> implementations that provide ORM-like methods for your named tables.</p><p>Read more about type support in the <a href="https://beta.tinybase.org/guides/the-basics/tinybase-and-typescript/">TinyBase And TypeScript</a> guide.</p></section>

```js yolo
const tools = createTools(store);
const [dTs, ts] = tools.getStoreApi('shop');

// -- shop.d.ts --
/* Represents the 'pets' Table. */
export type PetsTable = {[rowId: Id]: PetsRow};
/* Represents a Row when getting the content of the 'pets' Table. */
export type PetsRow = {species: string /* ... */};
//...

// -- shop.ts --
export const createShop: typeof createShopDecl = () => {
  //...
};
```

<section><h2 id="did-we-say-tiny">Did we say tiny?</h2><p>If you use the basic store module alone, you&#x27;ll only add a gzipped <em>5.3kB</em> to your app. Incrementally add the other modules as you need more functionality, or get it all for <em>12.7kB</em>.</p><p>The optional ui-react module is just <em>4.6kB</em>, the ui-react-dom components are another <em>2.5kB</em>, and everything is super fast. Life&#x27;s easy when you have zero dependencies!</p><p>Read more about how TinyBase is structured and packaged in the <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/architecture/">Architecture</a> guide.</p></section><div class="table"><table class="fixed"><tbody><tr><th> </th><th>Minified .js.gz</th><th>Source .js</th></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/store/">tinybase/store</a> (minimal)</th><td>5.3kB</td><td>52.3kB</td></tr><tr><th class="right">tinybase (complete)</th><td>12.7kB</td><td>129.8kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/ui-react/">ui-react</a></th><td>4.6kB</td><td>48.1kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/ui-react-dom/">ui-react-dom</a></th><td>2.5kB</td><td>20.4kB</td></tr></tbody></table></div><section><h2 id="well-tested-and-documented">Well tested and documented.</h2><p>TinyBase has <em>100.0%</em> test coverage, including the code throughout the documentation - even on this page! The guides, demos, and API examples are designed to make it as easy as possible for you to get your TinyBase-powered app up and running.</p><p>Read more about how TinyBase is tested in the Unit <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/testing/">Testing</a> guide.</p></section><div class="table"><table class="fixed"><tbody><tr><th width="30%"> </th><th>Total</th><th>Tested</th><th>Coverage</th></tr><tr><th class="right">Lines</th><td>2,371</td><td>2,371</td><td>100.0%</td></tr><tr><th class="right">Statements</th><td>2,555</td><td>2,555</td><td>100.0%</td></tr><tr><th class="right">Functions</th><td>1,000</td><td>1,000</td><td>100.0%</td></tr><tr><th class="right">Branches</th><td>951</td><td>951</td><td>100.0%</td></tr><tr><th class="right">Tests</th><td colspan="3">6,814</td></tr><tr><th class="right">Assertions</th><td colspan="3">31,994</td></tr></tbody></table></div><hr><section id="sponsors"><h2 id="proud-to-be-sponsored-by">Proud to be sponsored by:</h2><a href="https://github.com/cpojer" target="_blank"><img title="cpojer" src="https://github.com/cpojer.png?size=48" width="48" height="48"></a><a href="https://github.com/expo" target="_blank"><img title="expo" src="https://github.com/expo.png?size=48" width="48" height="48"></a><a href="https://github.com/beekeeb" target="_blank"><img title="beekeeb" src="https://github.com/beekeeb.png?size=48" width="48" height="48"></a><a href="https://github.com/cancelself" target="_blank"><img title="cancelself" src="https://github.com/cancelself.png?size=48" width="48" height="48"></a><a href="https://github.com/WonderPanda" target="_blank"><img title="WonderPanda" src="https://github.com/WonderPanda.png?size=48" width="48" height="48"></a><a href="https://github.com/arpitBhalla" target="_blank"><img title="arpitBhalla" src="https://github.com/arpitBhalla.png?size=48" width="48" height="48"></a></section><section id="users"><h2 id="excited-to-be-used-by">Excited to be used by:</h2><a href="https://github.com/Apocalypsor" target="_blank"><img title="Apocalypsor" src="https://github.com/Apocalypsor.png?size=48" width="48" height="48"></a><a href="https://github.com/brentvatne" target="_blank"><img title="brentvatne" src="https://github.com/brentvatne.png?size=48" width="48" height="48"></a><a href="https://github.com/byCedric" target="_blank"><img title="byCedric" src="https://github.com/byCedric.png?size=48" width="48" height="48"></a><a href="https://github.com/circadian-risk" target="_blank"><img title="circadian-risk" src="https://github.com/circadian-risk.png?size=48" width="48" height="48"></a><a href="https://github.com/cpojer" target="_blank"><img title="cpojer" src="https://github.com/cpojer.png?size=48" width="48" height="48"></a><a href="https://github.com/cubecull" target="_blank"><img title="cubecull" src="https://github.com/cubecull.png?size=48" width="48" height="48"></a><a href="https://github.com/erwinkn" target="_blank"><img title="erwinkn" src="https://github.com/erwinkn.png?size=48" width="48" height="48"></a><a href="https://github.com/expo" target="_blank"><img title="expo" src="https://github.com/expo.png?size=48" width="48" height="48"></a><a href="https://github.com/ezra-en" target="_blank"><img title="ezra-en" src="https://github.com/ezra-en.png?size=48" width="48" height="48"></a><a href="https://github.com/fdfontes" target="_blank"><img title="fdfontes" src="https://github.com/fdfontes.png?size=48" width="48" height="48"></a><a href="https://github.com/feychenie" target="_blank"><img title="feychenie" src="https://github.com/feychenie.png?size=48" width="48" height="48"></a><a href="https://github.com/flaming-codes" target="_blank"><img title="flaming-codes" src="https://github.com/flaming-codes.png?size=48" width="48" height="48"></a><a href="https://github.com/fostertheweb" target="_blank"><img title="fostertheweb" src="https://github.com/fostertheweb.png?size=48" width="48" height="48"></a><a href="https://github.com/generates" target="_blank"><img title="generates" src="https://github.com/generates.png?size=48" width="48" height="48"></a><a href="https://github.com/Giulio987" target="_blank"><img title="Giulio987" src="https://github.com/Giulio987.png?size=48" width="48" height="48"></a><a href="https://github.com/itsdevcoffee" target="_blank"><img title="itsdevcoffee" src="https://github.com/itsdevcoffee.png?size=48" width="48" height="48"></a><a href="https://github.com/jaysc" target="_blank"><img title="jaysc" src="https://github.com/jaysc.png?size=48" width="48" height="48"></a><a href="https://github.com/jbolda" target="_blank"><img title="jbolda" src="https://github.com/jbolda.png?size=48" width="48" height="48"></a><a href="https://github.com/Kayoo-asso" target="_blank"><img title="Kayoo-asso" src="https://github.com/Kayoo-asso.png?size=48" width="48" height="48"></a><a href="https://github.com/kotofurumiya" target="_blank"><img title="kotofurumiya" src="https://github.com/kotofurumiya.png?size=48" width="48" height="48"></a><a href="https://github.com/Kudo" target="_blank"><img title="Kudo" src="https://github.com/Kudo.png?size=48" width="48" height="48"></a><a href="https://github.com/learn-anything" target="_blank"><img title="learn-anything" src="https://github.com/learn-anything.png?size=48" width="48" height="48"></a><a href="https://github.com/lluc" target="_blank"><img title="lluc" src="https://github.com/lluc.png?size=48" width="48" height="48"></a><a href="https://github.com/marksteve" target="_blank"><img title="marksteve" src="https://github.com/marksteve.png?size=48" width="48" height="48"></a><a href="https://github.com/miking-the-viking" target="_blank"><img title="miking-the-viking" src="https://github.com/miking-the-viking.png?size=48" width="48" height="48"></a><a href="https://github.com/mjamesderocher" target="_blank"><img title="mjamesderocher" src="https://github.com/mjamesderocher.png?size=48" width="48" height="48"></a><a href="https://github.com/mouktardev" target="_blank"><img title="mouktardev" src="https://github.com/mouktardev.png?size=48" width="48" height="48"></a><a href="https://github.com/nickmessing" target="_blank"><img title="nickmessing" src="https://github.com/nickmessing.png?size=48" width="48" height="48"></a><a href="https://github.com/nikitavoloboev" target="_blank"><img title="nikitavoloboev" src="https://github.com/nikitavoloboev.png?size=48" width="48" height="48"></a><a href="https://github.com/nkzw-tech" target="_blank"><img title="nkzw-tech" src="https://github.com/nkzw-tech.png?size=48" width="48" height="48"></a><a href="https://github.com/palerdot" target="_blank"><img title="palerdot" src="https://github.com/palerdot.png?size=48" width="48" height="48"></a><a href="https://github.com/PorcoRosso85" target="_blank"><img title="PorcoRosso85" src="https://github.com/PorcoRosso85.png?size=48" width="48" height="48"></a><a href="https://github.com/primodiumxyz" target="_blank"><img title="primodiumxyz" src="https://github.com/primodiumxyz.png?size=48" width="48" height="48"></a><a href="https://github.com/shaneosullivan" target="_blank"><img title="shaneosullivan" src="https://github.com/shaneosullivan.png?size=48" width="48" height="48"></a><a href="https://github.com/sudo-self" target="_blank"><img title="sudo-self" src="https://github.com/sudo-self.png?size=48" width="48" height="48"></a><a href="https://github.com/SuperSonicHub1" target="_blank"><img title="SuperSonicHub1" src="https://github.com/SuperSonicHub1.png?size=48" width="48" height="48"></a><a href="https://github.com/threepointone" target="_blank"><img title="threepointone" src="https://github.com/threepointone.png?size=48" width="48" height="48"></a><a href="https://github.com/uptonking" target="_blank"><img title="uptonking" src="https://github.com/uptonking.png?size=48" width="48" height="48"></a><a href="https://github.com/ViktorZhurbin" target="_blank"><img title="ViktorZhurbin" src="https://github.com/ViktorZhurbin.png?size=48" width="48" height="48"></a><a href="https://github.com/WonderPanda" target="_blank"><img title="WonderPanda" src="https://github.com/WonderPanda.png?size=48" width="48" height="48"></a></section><hr><p><a class="start" href="https://beta.tinybase.org/guides/the-basics/getting-started/">Get started</a></p><p><a href="https://beta.tinybase.org/demos/">Try the demos</a></p><p><a href="https://beta.tinybase.org/api/store/interfaces/store/store/">Read the docs</a></p><hr><section id="about"><h2 id="about">About</h2><p>Modern apps deserve better. Why trade reactive user experiences to be able to use relational data? Or sacrifice features for bundle size? And why does the cloud do all the work <a href="https://localfirstweb.dev/" target="_blank">anyway</a>?</p><p>Building TinyBase was originally an interesting exercise for <a rel="me" href="https://tripleodeon.com">me</a> in API design, minification, and documentation. But now it has taken on a life of its own, and has grown beyond my wildest expectations.</p><p>It could not have been built without these great <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/credits/#giants">projects</a> and <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/credits/#and-friends">friends</a>, and I hope you enjoy using it as much as I do building it!</p></section><section id="story"><h2 id="the-story">The story</h2><a href="https://youtu.be/hXL7OkW-Prk?t=1232" target="_blank"><img src="https://beta.tinybase.org/youtube.webp"></a></section>