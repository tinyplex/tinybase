<section id="hero"><h2 id="the-reactive-data-store-for-local-first-apps">The <em>reactive</em> data store for <span>local-first apps</span>.</h2><p id="copy">Build blisteringly fast web apps that work both online and offline. Manage your state locally, synchronize it to the cloud when you need to, or even make it collaborative. But, most importantly... have fun building stuff again!</p></section><p><a href="https://beta.tinybase.org/guides/releases/#v5-0"><em>NEW!</em> v5.0 release</a> <span id="one-with">&quot;The One You Can Sync&quot;</span></p><p><a class="start" href="https://beta.tinybase.org/guides/the-basics/getting-started/">Get started</a></p><p><a href="https://beta.tinybase.org/demos/">Try the demos</a></p><p><a href="https://beta.tinybase.org/api/store/interfaces/store/store/">Read the docs</a></p><hr><ul><li>Manage <a href="#start-with-a-simple-key-value-store">key-value data</a>, <a href="#level-up-to-use-tabular-data">tabular data</a> - or both - with optional <a href="#apply-schemas-to-tables-values">schematization</a> to model your app&#x27;s data structures.</li><li><a href="#register-granular-listeners">Flexibly reactive</a> to reconciled updates, so you only spend rendering cycles on things that change.</li><li><a href="#build-complex-queries-with-tinyql">Powerful query engine</a> to select, join, filter, group, sort and paginate data - reactively - and without SQL.</li><li>Built-in <a href="#create-indexes-for-fast-lookups">indexing</a>, <a href="#define-metrics-and-aggregations">metric aggregation</a>, <a href="#model-table-relationships">tabular relationships</a> - and even an <a href="#set-checkpoints-for-an-undo-stack">undo stack</a> for your app state.</li><li>Create <a href="#type-definitions-orm-like-apis">type definitions &amp; ORM-like APIs</a>, from schema or inference. <a href="#an-inspector-for-your-data">Inspect your data</a> (<em>new!</em>) directly in the browser.</li><li>Easily <a href="#persist-to-storage-sqlite-crdts">sync your data</a> to browser <a href="https://beta.tinybase.org/api/persister-browser">storage</a>, <a href="https://beta.tinybase.org/api/persister-indexed-db/">IndexedDB</a>, <a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence/">SQLite</a>, <a href="https://beta.tinybase.org/guides/schemas-and-persistence/synchronizing-data/">CRDTs</a>; and (<em>new!</em>) <a href="https://beta.tinybase.org/api/persister-partykit-client/">PartyKit</a> and <a href="https://electric-sql.com/">ElectricSQL</a>.</li><li>Optional <a href="#call-hooks-to-bind-to-data">bindings to React</a> and (<em>new!</em>) <a href="#pre-built-reactive-components">pre-built components</a> that let you easily build fully reactive user interfaces.</li><li>Tiny by name, tiny by nature: <a href="#did-we-say-tiny">5.1kB - 12.2kB</a>, no dependencies. <a href="#well-tested-and-documented">100% tested</a>, <a href="https://beta.tinybase.org/guides/the-basics/getting-started/">fully documented</a>, and of course, <a href="https://github.com/tinyplex/tinybase">open source</a>!</li></ul><hr><section id="friends"><h2 id="tinybase-works-great-on-its-own-but-also-plays-well-with-friends">TinyBase works great on its own, but also plays well with friends!</h2><div><a href="https://beta.tinybase.org/guides/building-uis/getting-started-with-ui-react"><img width="48" src="https://beta.tinybase.org/react.svg"> React</a></div><div><a href="https://beta.tinybase.org/api/persister-partykit-client"><img width="48" src="https://beta.tinybase.org/partykit.svg"> PartyKit</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/expo.svg">Expo SQLite</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/electric.svg">ElectricSQL</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/sqlite.svg"> SQLite</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/turso.svg">Turso</a></div><div><a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence"><img width="48" src="https://beta.tinybase.org/powersync.svg">PowerSync</a></div><div><a href="https://beta.tinybase.org/api/persister-indexed-db/functions/creation/createindexeddbpersister"><img width="48" src="https://beta.tinybase.org/indexeddb.svg"> IndexedDB</a></div><div><a href="https://beta.tinybase.org/api/persister-yjs/functions/creation/createyjspersister"><img width="48" src="https://beta.tinybase.org/yjs.svg"> YJS</a></div><div><a href="https://beta.tinybase.org/api/persister-cr-sqlite-wasm"><img width="48" src="https://beta.tinybase.org/crsqlite.png"> CR-SQLite</a></div><div><a href="https://beta.tinybase.org/api/persister-automerge"><img width="48" src="https://beta.tinybase.org/automerge.svg"> Automerge</a></div></section><hr><section id="follow"><a href="https://github.com/tinyplex/tinybase" target="_blank"><img src="https://img.shields.io/github/stars/tinyplex/tinybase?style=for-the-badge&amp;logo=GitHub&amp;logoColor=%23fff&amp;label=GitHub&amp;labelColor=%23d81b60&amp;color=%23333"> </a><a href="https://discord.com/invite/mGz3mevwP8" target="_blank"><img src="https://img.shields.io/discord/1027918215323590676?style=for-the-badge&amp;logo=discord&amp;logoColor=%23fff&amp;label=Discord&amp;labelColor=%233131e8&amp;color=%23333"> </a><a href="https://twitter.com/tinybasejs" target="_blank"><img src="https://img.shields.io/twitter/follow/tinybasejs?style=for-the-badge&amp;logo=x&amp;logoColor=%23fff&amp;label=Twitter&amp;labelColor=%23333&amp;color=%23333"></a><br><a href="https://github.com/tinyplex/tinybase/discussions" target="_blank"><img src="https://img.shields.io/github/discussions/tinyplex/tinybase?style=for-the-badge&amp;logo=GitHub&amp;logoColor=%23fff&amp;label=Ideas&amp;labelColor=%23d81b60&amp;color=%23333"> </a><a href="https://github.com/tinyplex/tinybase/issues" target="_blank"><img src="https://img.shields.io/github/issues/tinyplex/tinybase?style=for-the-badge&amp;logo=GitHub&amp;logoColor=%23fff&amp;label=Issues&amp;labelColor=%23d81b60&amp;color=%23333"> </a><a href="#well-tested-and-documented"><img src="https://img.shields.io/badge/Tests-100%25-green?style=for-the-badge&amp;logo=jest&amp;logoColor=%23fff&amp;color=%23333&amp;labelColor=%2387c305"> </a><a href="https://www.npmjs.com/package/tinybase/v/5.0.0-beta.17" target="_blank"><img src="https://img.shields.io/npm/v/tinybase?style=for-the-badge&amp;logo=npm&amp;logoColor=%23fff&amp;labelColor=%23bd0005&amp;color=%23333"></a></section><hr><section><h2 id="start-with-a-simple-key-value-store">Start with a simple key-value store.</h2><p>Creating a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> requires just a simple call to the <a href="https://beta.tinybase.org/api/store/functions/creation/createstore/"><code>createStore</code></a> function. Once you have one, you can easily set <a href="https://beta.tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a> in it by unique <a href="https://beta.tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a>. And of course you can easily get them back out again.</p><p>Read more about using keyed value data in <a href="https://beta.tinybase.org/guides/the-basics/">The Basics</a> guide.</p></section>

```js
const store = createStore()
  .setValues({employees: 3})
  .setValue('open', true);

console.log(store.getValues());
// -> {employees: 3, open: true}
```

<section><h2 id="level-up-to-use-tabular-data">Level up to use tabular data.</h2><p>For other types of data applications, a tabular data structure is more useful. TinyBase lets you set and get nested <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a>, or <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> data, by unique <a href="https://beta.tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> - and in the same <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> as the keyed values!</p><p>Read more about setting and changing data in <a href="https://beta.tinybase.org/guides/the-basics/">The Basics</a> guide.</p></section>

```js
store
  .setTable('pets', {fido: {species: 'dog'}})
  .setCell('pets', 'fido', 'color', 'brown');

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog', color: 'brown'}
```

<section><h2 id="register-granular-listeners">Register granular listeners.</h2><p>The magic starts to happen when you register listeners on a <a href="https://beta.tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a>, <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a>, or <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>. They get called when any part of that object changes. You can also use wildcards - useful when you don&#x27;t know the <a href="https://beta.tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> of the objects that might change.</p><p>Read more about listeners in the <a href="https://beta.tinybase.org/guides/the-basics/listening-to-stores/">Listening To Stores</a> guide.</p></section>

```js
const listenerId = store.addTableListener('pets', () =>
  console.log('changed'),
);

store.setCell('pets', 'fido', 'sold', false);
// -> 'changed'

store.delListener(listenerId);
```

<section><h2 id="call-hooks-to-bind-to-data">Call hooks to bind to data.</h2><p>If you&#x27;re using React in your application, the optional <a href="https://beta.tinybase.org/api/ui-react/"><code>ui-react</code></a> module provides hooks to bind to the data in a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>More magic! The <a href="https://beta.tinybase.org/api/ui-react/functions/store-hooks/usecell/"><code>useCell</code></a> hook in this example fetches the dog&#x27;s color. But it also registers a listener on that cell that will fire and re-render the component whenever the value changes.</p><p>Basically you simply describe what data you want in your user interface and TinyBase will take care of the whole lifecycle of updating it for you.</p><p>Read more about the using hooks in the <a href="https://beta.tinybase.org/guides/building-uis/using-react-hooks/">Using React Hooks</a> guide.</p></section>

```jsx
const App1 = () => {
  const color = useCell('pets', 'fido', 'color', store);
  return <>Color: {color}</>;
};

const app = document.createElement('div');
const root = ReactDOMClient.createRoot(app);
root.render(<App1 />);
console.log(app.innerHTML);
// -> 'Color: brown'

store.setCell('pets', 'fido', 'color', 'walnut');
console.log(app.innerHTML);
// -> 'Color: walnut'
```

<section><h2 id="pre-built-reactive-components">Pre-built reactive components.</h2><p>The <a href="https://beta.tinybase.org/api/ui-react/"><code>ui-react</code></a> module provides bare React components that let you build up a fully reactive user interface based on a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>For web applications in particular, the new <a href="https://beta.tinybase.org/api/ui-react-dom/"><code>ui-react-dom</code></a> module provides pre-built components for tabular display of your data, with lots of customization and interactivity options.</p><p>Try them out in the <a href="https://beta.tinybase.org/demos/ui-components/">UI Components</a> demos, and read more about the underlying <a href="https://beta.tinybase.org/api/ui-react/"><code>ui-react</code></a> module in the <a href="https://beta.tinybase.org/guides/building-uis/">Building UIs</a> guides.</p></section><img src="https://beta.tinybase.org/ui-react-dom.webp"><section><h2 id="an-inspector-for-your-data">An inspector for your data.</h2><p>If you are building a web application, the new <a href="https://beta.tinybase.org/api/ui-react-dom/functions/development-components/storeinspector/"><code>StoreInspector</code></a> component lets you overlay a view of the data in your <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, <a href="https://beta.tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a>, <a href="https://beta.tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a>, and so on. You can even edit the data in place and see it update in your app immediately.</p><p>Read more about this powerful new tool in the <a href="https://beta.tinybase.org/guides/developer-tools/inspecting-data/">Inspecting Data</a> guide.</p></section><img src="https://beta.tinybase.org/store-inspector.webp"><section><h2 id="apply-schemas-to-tables-values">Apply schemas to tables &amp; values.</h2><p>By default, a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> can contain any arbitrary <a href="https://beta.tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a>, and a <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> can contain any arbitrary <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>. But you can add a <a href="https://beta.tinybase.org/api/store/type-aliases/schema/valuesschema/"><code>ValuesSchema</code></a> or a <a href="https://beta.tinybase.org/api/store/type-aliases/schema/tablesschema/"><code>TablesSchema</code></a> to a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> to ensure that the values are always what you expect: constraining their types, and providing defaults.</p><p>In this example, we set a new <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> without the <code>sold</code> <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> in it. The schema ensures it&#x27;s present with default of <code>false</code>.</p><p>Read more about schemas in the <a href="https://beta.tinybase.org/guides/schemas-and-persistence/using-schemas/">Using Schemas</a> guide.</p></section>

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

<section><h2 id="persist-to-storage-sqlite-crdts">Persist to storage, SQLite, CRDTs.</h2><p>You can easily persist a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> between browser page reloads or sessions. You can also synchronize it with a web endpoint, or (if you&#x27;re using TinyBase in an appropriate environment), load and save it to a file. <a href="https://beta.tinybase.org/guides/releases/#v4-0">New in v4.0</a>, you can bind <a href="https://beta.tinybase.org/guides/schemas-and-persistence/database-persistence/">TinyBase to SQLite</a> via a range of modules, or to <a href="https://yjs.dev/">Yjs</a> or <a href="https://automerge.org/">Automerge</a> CRDT documents.</p><p>Read more about persisters in the <a href="https://beta.tinybase.org/guides/schemas-and-persistence/persisting-data/">Persisting Data</a> guide.</p></section>

```js
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

<section><h2 id="build-complex-queries-with-tinyql">Build complex queries with <a href="https://beta.tinybase.org/guides/making-queries/tinyql/">TinyQL</a>.</h2><p>The <a href="https://beta.tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> object lets you query data across tables, with filtering and aggregation - using a SQL-adjacent syntax called <a href="https://beta.tinybase.org/guides/making-queries/tinyql/">TinyQL</a>.</p><p>Accessors and listeners let you sort and paginate the results efficiently, making building rich tabular interfaces easier than ever.</p><p>In this example, we have two tables: of pets and their owners. They are joined together by the pet&#x27;s ownerId <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>. We select the pet&#x27;s species, and the owner&#x27;s state, and then aggregate the prices for the combinations.</p><p>We access the results by descending price, essentially answering the question: &quot;which is the highest-priced species, and in which state?&quot;</p><p>Needless to say, the results are reactive too! You can add listeners to queries just as easily as you do to raw tables.</p><p>Read more about <a href="https://beta.tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> in the <a href="https://beta.tinybase.org/guides/releases/#v2-0">v2.0 Release Notes</a>, the <a href="https://beta.tinybase.org/guides/making-queries/">Making Queries</a> guide, and the <a href="https://beta.tinybase.org/demos/car-analysis/">Car Analysis</a> demo and <a href="https://beta.tinybase.org/demos/movie-database/">Movie Database</a> demo.</p></section>

```js
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

<section><h2 id="define-metrics-and-aggregations">Define metrics and aggregations.</h2><p>A <a href="https://beta.tinybase.org/api/metrics/interfaces/metrics/metrics/"><code>Metrics</code></a> object makes it easy to keep a running aggregation of <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> values in each <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> of a <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>. This is useful for counting rows, but also supports averages, ranges of values, or arbitrary aggregations.</p><p>In this example, we create a new table of the pet species, and keep a track of which is most expensive. When we add horses to our pet store, the listener detects that the highest price has changed.</p><p>Read more about <a href="https://beta.tinybase.org/api/metrics/interfaces/metrics/metrics/"><code>Metrics</code></a> in the <a href="https://beta.tinybase.org/guides/metrics-and-indexes/using-metrics/">Using Metrics</a> guide.</p></section>

```js
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

<section><h2 id="create-indexes-for-fast-lookups">Create indexes for fast lookups.</h2><p>An <a href="https://beta.tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> object makes it easy to look up all the <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> objects that have a certain value in a <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>.</p><p>In this example, we create an index on the <code>species</code> <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> values. We can then get the the list of distinct <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> value present for that index (known as &#x27;slices&#x27;), and the set of <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> objects that match each value.</p><p><a href="https://beta.tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> objects are reactive too. So you can set listeners on them just as you do for the data in the underlying <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>Read more about <a href="https://beta.tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> in the <a href="https://beta.tinybase.org/guides/metrics-and-indexes/using-indexes/">Using Indexes</a> guide.</p></section>

```js
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

<section><h2 id="model-table-relationships">Model table relationships.</h2><p>A <a href="https://beta.tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> object lets you associate a <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> in a local <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> with the <a href="https://beta.tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> of a <a href="https://beta.tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> in a remote <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>. You can also reference a table to itself to create linked lists.</p><p>In this example, the <code>species</code> <a href="https://beta.tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> of the <code>pets</code> <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> is used to create a relationship to the <code>species</code> <a href="https://beta.tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, so that we can access the price of a given pet.</p><p>Like everything else, you can set listeners on <a href="https://beta.tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> too.</p><p>Read more about <a href="https://beta.tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> in the <a href="https://beta.tinybase.org/guides/relationships-and-checkpoints/using-relationships/">Using Relationships</a> guide.</p></section>

```js
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

<section><h2 id="set-checkpoints-for-an-undo-stack">Set checkpoints for an undo stack.</h2><p>A <a href="https://beta.tinybase.org/api/checkpoints/interfaces/checkpoints/checkpoints/"><code>Checkpoints</code></a> object lets you set checkpoints on a <a href="https://beta.tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>. Move forward and backward through them to create undo and redo functions.</p><p>In this example, we set a checkpoint, then sell one of the pets. Later, the pet is brought back to the shop, and we go back to that checkpoint to revert the store to its previous state.</p><p>Read more about <a href="https://beta.tinybase.org/api/checkpoints/interfaces/checkpoints/checkpoints/"><code>Checkpoints</code></a> in the <a href="https://beta.tinybase.org/guides/relationships-and-checkpoints/using-checkpoints/">Using Checkpoints</a> guide.</p></section>

```js
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

<section><h2 id="type-definitions-orm-like-apis">Type definitions &amp; ORM-like APIs</h2><p>TinyBase has comprehensive type definitions, and even offers definitions that infer API types from the data schemas you apply.</p><p>Furthermore, you can easily create TypeScript <code>.d.ts</code> definitions that model your data and encourage type-safety when reading and writing data - as well as <code>.ts</code> implementations that provide ORM-like methods for your named tables.</p><p>Read more about type support in the <a href="https://beta.tinybase.org/guides/the-basics/tinybase-and-typescript/">TinyBase and TypeScript</a> guide.</p></section>

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

<section><h2 id="did-we-say-tiny">Did we say tiny?</h2><p>If you use the basic <a href="https://beta.tinybase.org/api/store/"><code>store</code></a> module alone, you&#x27;ll only add a gzipped <em>5.1kB</em> to your app. Incrementally add the other modules as you need more functionality, or get it all for <em>12.2kB</em>.</p><p>The optional <a href="https://beta.tinybase.org/api/ui-react/"><code>ui-react</code></a> module is just another <em>4.6kB</em>, the auxiliary <a href="https://beta.tinybase.org/api/tools/"><code>tools</code></a> module is <em>11.1kB</em>, and everything is super fast. Life&#x27;s easy when you have zero dependencies!</p><p>Read more about how TinyBase is structured and packaged in the <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/architecture/">Architecture</a> guide.</p></section><div class="table"><table class="fixed"><tbody><tr><th width="30%"> </th><th>.js.gz</th><th>.js</th><th>debug.js</th><th>.d.ts</th></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/store/">store</a></th><td>5.1kB</td><td>12.1kB</td><td>52.3kB</td><td>255.3kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/metrics/">metrics</a></th><td>1.8kB</td><td>3.7kB</td><td>15.3kB</td><td>30.9kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/indexes/">indexes</a></th><td>2.0kB</td><td>3.9kB</td><td>17.3kB</td><td>35.6kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/relationships/">relationships</a></th><td>1.9kB</td><td>3.8kB</td><td>17.2kB</td><td>44.2kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/queries/">queries</a></th><td>2.8kB</td><td>5.7kB</td><td>25.8kB</td><td>126.0kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/checkpoints/">checkpoints</a></th><td>1.6kB</td><td>3.2kB</td><td>13.5kB</td><td>35.1kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/mergeable-store/">mergeable-store</a></th><td>7.1kB</td><td>17.0kB</td><td>72.2kB</td><td>4.4kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/persisters/">persisters</a></th><td>0.9kB</td><td>1.7kB</td><td>6.2kB</td><td>47.3kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/synchronizers/">synchronizers</a></th><td>1.8kB</td><td>3.7kB</td><td>13.8kB</td><td>3.8kB</td></tr><tr><th class="right"><a href="https://beta.tinybase.org/api/common/">common</a></th><td>0.3kB</td><td>0.3kB</td><td>0.7kB</td><td>3.6kB</td></tr><tr><th class="right">tinybase (all)</th><td>12.2kB</td><td>29.9kB</td><td>129.3kB</td><td>0.4kB</td></tr></tbody></table></div><section><h2 id="well-tested-and-documented">Well tested and documented.</h2><p>TinyBase has <em>100.0%</em> test coverage, including the code throughout the documentation - even on this page! The guides, demos, and API examples are designed to make it as easy as possible for you to get your TinyBase-powered app up and running.</p><p>Read more about how TinyBase is tested in the Unit <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/testing/">Testing</a> guide.</p></section><div class="table"><table class="fixed"><tbody><tr><th width="30%"> </th><th>Total</th><th>Tested</th><th>Coverage</th></tr><tr><th class="right">Lines</th><td>2,368</td><td>2,368</td><td>100.0%</td></tr><tr><th class="right">Statements</th><td>2,552</td><td>2,552</td><td>100.0%</td></tr><tr><th class="right">Functions</th><td>996</td><td>996</td><td>100.0%</td></tr><tr><th class="right">Branches</th><td>948</td><td>948</td><td>100.0%</td></tr><tr><th class="right">Tests</th><td colspan="3">6,717</td></tr><tr><th class="right">Assertions</th><td colspan="3">31,378</td></tr></tbody></table></div><hr><section id="sponsors"><h2 id="proud-to-be-sponsored-by">Proud to be sponsored by:</h2><a href="https://github.com/cpojer" target="_blank"><img title="cpojer" src="https://github.com/cpojer.png?size=48" width="48" height="48"></a><a href="https://github.com/expo" target="_blank"><img title="expo" src="https://github.com/expo.png?size=48" width="48" height="48"></a><a href="https://github.com/beekeeb" target="_blank"><img title="beekeeb" src="https://github.com/beekeeb.png?size=48" width="48" height="48"></a><a href="https://github.com/cancelself" target="_blank"><img title="cancelself" src="https://github.com/cancelself.png?size=48" width="48" height="48"></a><a href="https://github.com/WonderPanda" target="_blank"><img title="WonderPanda" src="https://github.com/WonderPanda.png?size=48" width="48" height="48"></a><a href="https://github.com/arpitBhalla" target="_blank"><img title="arpitBhalla" src="https://github.com/arpitBhalla.png?size=48" width="48" height="48"></a></section><section id="users"><h2 id="excited-to-be-used-by">Excited to be used by:</h2><a href="https://github.com/Apocalypsor" target="_blank"><img title="Apocalypsor" src="https://github.com/Apocalypsor.png?size=48" width="48" height="48"></a><a href="https://github.com/brentvatne" target="_blank"><img title="brentvatne" src="https://github.com/brentvatne.png?size=48" width="48" height="48"></a><a href="https://github.com/byCedric" target="_blank"><img title="byCedric" src="https://github.com/byCedric.png?size=48" width="48" height="48"></a><a href="https://github.com/circadian-risk" target="_blank"><img title="circadian-risk" src="https://github.com/circadian-risk.png?size=48" width="48" height="48"></a><a href="https://github.com/cpojer" target="_blank"><img title="cpojer" src="https://github.com/cpojer.png?size=48" width="48" height="48"></a><a href="https://github.com/cubecull" target="_blank"><img title="cubecull" src="https://github.com/cubecull.png?size=48" width="48" height="48"></a><a href="https://github.com/erwinkn" target="_blank"><img title="erwinkn" src="https://github.com/erwinkn.png?size=48" width="48" height="48"></a><a href="https://github.com/expo" target="_blank"><img title="expo" src="https://github.com/expo.png?size=48" width="48" height="48"></a><a href="https://github.com/ezra-en" target="_blank"><img title="ezra-en" src="https://github.com/ezra-en.png?size=48" width="48" height="48"></a><a href="https://github.com/fdfontes" target="_blank"><img title="fdfontes" src="https://github.com/fdfontes.png?size=48" width="48" height="48"></a><a href="https://github.com/feychenie" target="_blank"><img title="feychenie" src="https://github.com/feychenie.png?size=48" width="48" height="48"></a><a href="https://github.com/flaming-codes" target="_blank"><img title="flaming-codes" src="https://github.com/flaming-codes.png?size=48" width="48" height="48"></a><a href="https://github.com/fostertheweb" target="_blank"><img title="fostertheweb" src="https://github.com/fostertheweb.png?size=48" width="48" height="48"></a><a href="https://github.com/fostertheweb" target="_blank"><img title="fostertheweb" src="https://github.com/fostertheweb.png?size=48" width="48" height="48"></a><a href="https://github.com/generates" target="_blank"><img title="generates" src="https://github.com/generates.png?size=48" width="48" height="48"></a><a href="https://github.com/Giulio987" target="_blank"><img title="Giulio987" src="https://github.com/Giulio987.png?size=48" width="48" height="48"></a><a href="https://github.com/itsdevcoffee" target="_blank"><img title="itsdevcoffee" src="https://github.com/itsdevcoffee.png?size=48" width="48" height="48"></a><a href="https://github.com/jaysc" target="_blank"><img title="jaysc" src="https://github.com/jaysc.png?size=48" width="48" height="48"></a><a href="https://github.com/jbolda" target="_blank"><img title="jbolda" src="https://github.com/jbolda.png?size=48" width="48" height="48"></a><a href="https://github.com/Kayoo-asso" target="_blank"><img title="Kayoo-asso" src="https://github.com/Kayoo-asso.png?size=48" width="48" height="48"></a><a href="https://github.com/kotofurumiya" target="_blank"><img title="kotofurumiya" src="https://github.com/kotofurumiya.png?size=48" width="48" height="48"></a><a href="https://github.com/Kudo" target="_blank"><img title="Kudo" src="https://github.com/Kudo.png?size=48" width="48" height="48"></a><a href="https://github.com/learn-anything" target="_blank"><img title="learn-anything" src="https://github.com/learn-anything.png?size=48" width="48" height="48"></a><a href="https://github.com/lluc" target="_blank"><img title="lluc" src="https://github.com/lluc.png?size=48" width="48" height="48"></a><a href="https://github.com/marksteve" target="_blank"><img title="marksteve" src="https://github.com/marksteve.png?size=48" width="48" height="48"></a><a href="https://github.com/miking-the-viking" target="_blank"><img title="miking-the-viking" src="https://github.com/miking-the-viking.png?size=48" width="48" height="48"></a><a href="https://github.com/mjamesderocher" target="_blank"><img title="mjamesderocher" src="https://github.com/mjamesderocher.png?size=48" width="48" height="48"></a><a href="https://github.com/mouktardev" target="_blank"><img title="mouktardev" src="https://github.com/mouktardev.png?size=48" width="48" height="48"></a><a href="https://github.com/nickmessing" target="_blank"><img title="nickmessing" src="https://github.com/nickmessing.png?size=48" width="48" height="48"></a><a href="https://github.com/nikitavoloboev" target="_blank"><img title="nikitavoloboev" src="https://github.com/nikitavoloboev.png?size=48" width="48" height="48"></a><a href="https://github.com/nkzw-tech" target="_blank"><img title="nkzw-tech" src="https://github.com/nkzw-tech.png?size=48" width="48" height="48"></a><a href="https://github.com/palerdot" target="_blank"><img title="palerdot" src="https://github.com/palerdot.png?size=48" width="48" height="48"></a><a href="https://github.com/PorcoRosso85" target="_blank"><img title="PorcoRosso85" src="https://github.com/PorcoRosso85.png?size=48" width="48" height="48"></a><a href="https://github.com/primodiumxyz" target="_blank"><img title="primodiumxyz" src="https://github.com/primodiumxyz.png?size=48" width="48" height="48"></a><a href="https://github.com/shaneosullivan" target="_blank"><img title="shaneosullivan" src="https://github.com/shaneosullivan.png?size=48" width="48" height="48"></a><a href="https://github.com/sudo-self" target="_blank"><img title="sudo-self" src="https://github.com/sudo-self.png?size=48" width="48" height="48"></a><a href="https://github.com/SuperSonicHub1" target="_blank"><img title="SuperSonicHub1" src="https://github.com/SuperSonicHub1.png?size=48" width="48" height="48"></a><a href="https://github.com/threepointone" target="_blank"><img title="threepointone" src="https://github.com/threepointone.png?size=48" width="48" height="48"></a><a href="https://github.com/uptonking" target="_blank"><img title="uptonking" src="https://github.com/uptonking.png?size=48" width="48" height="48"></a><a href="https://github.com/ViktorZhurbin" target="_blank"><img title="ViktorZhurbin" src="https://github.com/ViktorZhurbin.png?size=48" width="48" height="48"></a><a href="https://github.com/WonderPanda" target="_blank"><img title="WonderPanda" src="https://github.com/WonderPanda.png?size=48" width="48" height="48"></a></section><hr><p><a class="start" href="https://beta.tinybase.org/guides/the-basics/getting-started/">Get started</a></p><p><a href="https://beta.tinybase.org/demos/">Try the demos</a></p><p><a href="https://beta.tinybase.org/api/store/interfaces/store/store/">Read the docs</a></p><hr><section id="about"><h2 id="about">About</h2><p>Modern apps deserve better. Why trade reactive user experiences to be able to use relational data? Or sacrifice features for bundle size? And why does the cloud do all the work <a href="https://localfirstweb.dev/" target="_blank">anyway</a>?</p><p>Building TinyBase was originally an interesting exercise for <a rel="me" href="https://tripleodeon.com">me</a> in API design, minification, and documentation. But now it has taken on a life of its own, and has grown beyond my wildest expectations.</p><p>It could not have been built without these great <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/credits/#giants">projects</a> and <a href="https://beta.tinybase.org/guides/how-tinybase-is-built/credits/#and-friends">friends</a>, and I hope you enjoy using it as much as I do building it!</p></section><section id="story"><h2 id="the-story">The story</h2><a href="https://youtu.be/hXL7OkW-Prk?t=1232" target="_blank"><img src="https://beta.tinybase.org/youtube.webp"></a></section>