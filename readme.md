<section id="hero"><h2 id="the-reactive-data-store-for-local-first-apps">The <em>reactive</em> data store for <span>local-first apps</span>.</h2><p>Modern apps deserve better. Why trade reactive user experiences to be able to use relational data? Why sacrifice store features for bundle size? And why should the cloud do all the work <a href="https://www.inkandswitch.com/local-first/" target="_blank">anyway</a>?</p><p><em>TinyBase is a smart new way to structure your local app data:</em></p><ul><li>Manage <a href="#start-with-a-simple-key-value-store">key-value data</a> (<em>new!</em>), <a href="#level-up-to-use-tabular-data">tabular data</a> - or both - with optional <a href="#apply-schemas-to-tables-and-values">schematization</a> to model it.</li><li><a href="#register-listeners-at-any-granularity">Flexibly reactive</a> to reconciled updates, so your UI only spends cycles on the data that changes.</li><li><a href="#build-complex-queries-with-tinyql">Powerful query engine</a> to select, join, filter, group, sort and paginate data - reactively.</li><li><a href="#create-indexes-for-fast-lookups">Indexing</a>, <a href="#define-metrics-and-aggregations">metrics</a>, <a href="#configure-relationships-between-tables">relationships</a> - and even an <a href="#use-checkpoints-for-an-easy-undo-stack">undo stack</a> for your app state! - out of the box.</li><li>Easily <a href="#persist-data-to-browser-file-or-server">sync your data</a> to local or remote storage, and use <a href="#call-hooks-to-bind-to-data">idiomatic bindings</a> to your UI.</li><li><a href="#generate-orm-like-apis">Generate ORM-like APIs</a> (<em>new!</em>) in TypeScript, based on a schema or inferred from actual data.</li></ul><p><em>Tiny by name, tiny by nature</em>, TinyBase only costs <a href="#did-we-say-tiny">4.2kB - 8.7kB</a> when compressed, and has zero dependencies. And of course it&#x27;s <a href="#well-tested-and-documented">well tested</a>, <a href="https://tinybase.org/guides/the-basics/getting-started/">fully documented</a>, and <a href="https://github.com/tinyplex/tinybase">open source</a>. Other <a href="https://tinybase.org/guides/faq/">FAQs</a>?</p></section><p><a id="new" href="https://tinybase.org/guides/releases/#v3-0"><em>NEW!</em> v3.0 release</a></p><hr><p><a class="start" href="https://tinybase.org/guides/the-basics/getting-started/">Get started</a></p><p><a href="https://tinybase.org/demos/">Try the demos</a></p><p><a href="https://tinybase.org/api/store/interfaces/store/store/">Read the docs</a></p><hr><section><h2 id="start-with-a-simple-key-value-store">Start with a simple key-value store.</h2><p>Creating a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> requires just a simple call to the <a href="https://tinybase.org/api/store/functions/creation/createstore/"><code>createStore</code></a> function. Once you have one, you can easily set <a href="https://tinybase.org/api/store/type-aliases/store/values/"><code>Values</code></a> in it by unique <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a>. And of course you can easily get them back out again.</p><p>Read more about using keyed value data in <a href="https://tinybase.org/guides/the-basics/">The Basics</a> guide.</p></section>

```js
const store = createStore()
  .setValues({employees: 3})
  .setValue('open', true);

console.log(store.getValues());
// -> {employees: 3, open: true}
```

<section><h2 id="level-up-to-use-tabular-data">Level up to use tabular data.</h2><p>For other types of data applications, a tabular data structure is more useful. TinyBase lets you set and get nested <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a>, or <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> data, by unique <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> and in the same <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> as the keyed values.</p><p>Read more about setting and changing data in <a href="https://tinybase.org/guides/the-basics/">The Basics</a> guide.</p></section>

```js
store
  .setTable('pets', {fido: {species: 'dog'}})
  .setCell('pets', 'fido', 'color', 'brown');

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog', color: 'brown'}
```

<section><h2 id="register-listeners-at-any-granularity">Register listeners at any granularity.</h2><p>The magic starts to happen when you register listeners on a <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a>, <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a>, or <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>. They get called when any part of that object changes. You can also use wildcards - useful when you don&#x27;t know the <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> of the objects that might change.</p><p>Read more about listeners in the <a href="https://tinybase.org/guides/the-basics/listening-to-stores/">Listening To Stores</a> guide.</p></section>

```js
const listenerId = store.addTableListener('pets', () =>
  console.log('changed'),
);

store.setCell('pets', 'fido', 'sold', false);
// -> 'changed'

store.delListener(listenerId);
```

<section><h2 id="call-hooks-to-bind-to-data">Call hooks to bind to data.</h2><p>If you&#x27;re using React in your application, the optional <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module provides hooks to bind to the data in a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>More magic! The <a href="https://tinybase.org/api/ui-react/functions/store-hooks/usecell/"><code>useCell</code></a> hook in this example fetches the dog&#x27;s color. But it also registers a listener on that cell that will fire and re-render the component whenever the value changes.</p><p>Basically you simply describe what data you want in your user interface and TinyBase will take care of the whole lifecycle of updating it for you.</p><p>Read more about the using hooks in the <a href="https://tinybase.org/guides/building-uis/using-react-hooks/">Using React Hooks</a> guide.</p></section>

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

<section><h2 id="use-components-for-reactive-apps">Use components for reactive apps.</h2><p>The react module provides simple React components with bindings that make it easy to create a fully reactive user interface based on a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>In this example, the library&#x27;s <a href="https://tinybase.org/api/ui-react/functions/store-components/rowview/"><code>RowView</code></a> component just needs a reference to the <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>, the <code>tableId</code>, and the <code>rowId</code> in order to render the contents of that row. An optional <code>cellComponent</code> prop lets you override how you want each <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> rendered. Again, all the listeners and updates are taken care of for you.</p><p>The module also includes a context Provider that sets up default for an entire app to use, reducing the need to drill all your props down into your app&#x27;s hierarchy.</p><p>Most of the demos showcase the use of these React hooks and components. Take a look at <a href="https://tinybase.org/demos/todo-app/todo-app-v1-the-basics/">Todo App v1 (the basics)</a> to see these user interface binding patterns in action.</p><p>Read more about the <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module in the <a href="https://tinybase.org/guides/building-uis/">Building UIs</a> guides.</p></section>

```jsx
const MyCellView = (props) => (
  <>
    {props.cellId}: <CellView {...props} />
    <hr />
  </>
);

const App2 = () => (
  <RowView
    store={store}
    tableId="pets"
    rowId="fido"
    cellComponent={MyCellView}
  />
);

root.render(<App2 />);
console.log(app.innerHTML);
// -> 'species: dog<hr>color: walnut<hr>sold: false<hr>'

store.setCell('pets', 'fido', 'sold', true);
console.log(app.innerHTML);
// -> 'species: dog<hr>color: walnut<hr>sold: true<hr>'

root.unmount();
```

<section><h2 id="apply-schemas-to-tables-and-values">Apply schemas to tables and values.</h2><p>By default, a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> can contain any arbitrary <a href="https://tinybase.org/api/store/type-aliases/store/value/"><code>Value</code></a>, and a <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> can contain any arbitrary <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>. But you can add a <a href="https://tinybase.org/api/store/type-aliases/schema/valuesschema/"><code>ValuesSchema</code></a> or a <a href="https://tinybase.org/api/store/type-aliases/schema/tablesschema/"><code>TablesSchema</code></a> to a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> to ensure that the values are always what you expect: constraining their types, and providing defaults.</p><p>In this example, we set a second <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> without the <code>sold</code> <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> in it. The schema ensures it&#x27;s present with default of <code>false</code>.</p><p>Read more about schemas in the <a href="https://tinybase.org/guides/schemas-and-persistence/using-schemas/">Using Schemas</a> guide.</p></section>

```js
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    color: {type: 'string'},
    sold: {type: 'boolean', default: false},
  },
});

store.setRow('pets', 'felix', {species: 'cat'});
console.log(store.getRow('pets', 'felix'));
// -> {species: 'cat', sold: false}

store.delTablesSchema();
```

<section><h2 id="persist-data-to-browser-file-or-server">Persist data to browser, file, or server.</h2><p>You can easily persist a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a> between browser page reloads or sessions. You can also synchronize it with a web endpoint, or (if you&#x27;re using TinyBase in an appropriate environment), load and save it to a file.</p><p>Read more about persisters in the <a href="https://tinybase.org/guides/schemas-and-persistence/persisting-data/">Persisting Data</a> guide.</p></section>

```js
const persister = createSessionPersister(store, 'demo');
await persister.save();

console.log(sessionStorage.getItem('demo'));
// -> '[{"pets":{"fido":{"species":"dog","color":"walnut","sold":true},"felix":{"species":"cat","sold":false}}},{"employees":3,"open":true}]'

persister.destroy();
sessionStorage.clear();
```

<section><h2 id="build-complex-queries-with-tinyql">Build complex queries with <a href="https://tinybase.org/guides/making-queries/tinyql/">TinyQL</a>.</h2><p>The <a href="https://tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> object lets you query data across tables, with filtering and aggregation - using a SQL-adjacent syntax called <a href="https://tinybase.org/guides/making-queries/tinyql/">TinyQL</a>.</p><p>Accessors and listeners let you sort and paginate the results efficiently, making building rich tabular interfaces easier than ever.</p><p>In this example, we have two tables: of pets and their owners. They are joined together by the pet&#x27;s ownerId <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>. We select the pet&#x27;s species, and the owner&#x27;s state, and then aggregate the prices for the combinations.</p><p>We access the results by descending price, essentially answering the question: &quot;which is the highest-priced species, and in which state?&quot;</p><p>Needless to say, the results are reactive too! You can add listeners to queries just as easily as you do to raw tables.</p><p>Read more about <a href="https://tinybase.org/api/queries/interfaces/queries/queries/"><code>Queries</code></a> in the <a href="https://tinybase.org/guides/releases/#v2-0">v2.0 Release Notes</a>, the <a href="https://tinybase.org/guides/making-queries/">Making Queries</a> guide, and the <a href="https://tinybase.org/demos/car-analysis/">Car Analysis</a> demo and <a href="https://tinybase.org/demos/movie-database/">Movie Database</a> demo.</p></section>

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

<section><h2 id="define-metrics-and-aggregations">Define metrics and aggregations.</h2><p>A <a href="https://tinybase.org/api/metrics/interfaces/metrics/metrics/"><code>Metrics</code></a> object makes it easy to keep a running aggregation of <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> values in each <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> of a <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>. This is useful for counting rows, but also supports averages, ranges of values, or arbitrary aggregations.</p><p>In this example, we create a new table of the pet species, and keep a track of which is most expensive. When we add horses to our pet store, the listener detects that the highest price has changed.</p><p>Read more about <a href="https://tinybase.org/api/metrics/interfaces/metrics/metrics/"><code>Metrics</code></a> in the <a href="https://tinybase.org/guides/metrics-and-indexes/using-metrics/">Using Metrics</a> guide.</p></section>

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

<section><h2 id="create-indexes-for-fast-lookups">Create indexes for fast lookups.</h2><p>An <a href="https://tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> object makes it easy to look up all the <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> objects that have a certain value in a <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a>.</p><p>In this example, we create an index on the <code>species</code> <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> values. We can then get the the list of distinct <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> value present for that index (known as &#x27;slices&#x27;), and the set of <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> objects that match each value.</p><p><a href="https://tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> objects are reactive too. So you can set listeners on them just as you do for the data in the underlying <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>.</p><p>Read more about <a href="https://tinybase.org/api/indexes/interfaces/indexes/indexes/"><code>Indexes</code></a> in the <a href="https://tinybase.org/guides/metrics-and-indexes/using-indexes/">Using Indexes</a> guide.</p></section>

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

<section><h2 id="model-relationships-between-tables">Model relationships between tables.</h2><p>A <a href="https://tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> object lets you associate a <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> in a local <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> with the <a href="https://tinybase.org/api/common/type-aliases/identity/id/"><code>Id</code></a> of a <a href="https://tinybase.org/api/store/type-aliases/store/row/"><code>Row</code></a> in a remote <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>. You can also reference a table to itself to create linked lists.</p><p>In this example, the <code>species</code> <a href="https://tinybase.org/api/store/type-aliases/store/cell/"><code>Cell</code></a> of the <code>pets</code> <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a> is used to create a relationship to the <code>species</code> <a href="https://tinybase.org/api/store/type-aliases/store/table/"><code>Table</code></a>, so that we can access the price of a given pet.</p><p>Like everything else, you can set listeners on <a href="https://tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> too.</p><p>Read more about <a href="https://tinybase.org/api/relationships/interfaces/relationships/relationships/"><code>Relationships</code></a> in the <a href="https://tinybase.org/guides/relationships-and-checkpoints/using-relationships/">Using Relationships</a> guide.</p></section>

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

<section><h2 id="set-checkpoints-for-an-undo-stack">Set checkpoints for an undo stack.</h2><p>A <a href="https://tinybase.org/api/checkpoints/interfaces/checkpoints/checkpoints/"><code>Checkpoints</code></a> object lets you set checkpoints on a <a href="https://tinybase.org/api/store/interfaces/store/store/"><code>Store</code></a>. Move forward and backward through them to create undo and redo functions.</p><p>In this example, we set a checkpoint, then sell one of the pets. Later, the pet is brought back to the shop, and we go back to that checkpoint to revert the store to its previous state.</p><p>Read more about <a href="https://tinybase.org/api/checkpoints/interfaces/checkpoints/checkpoints/"><code>Checkpoints</code></a> in the <a href="https://tinybase.org/guides/relationships-and-checkpoints/using-checkpoints/">Using Checkpoints</a> guide.</p></section>

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

<section><h2 id="generate-orm-like-apis">Generate ORM-like APIs</h2><p>You can easily create TypeScript <code>.d.ts</code> definitions that model your data and encourage type-safety when reading and writing data - as well as <code>.ts</code> implementations that provide ORM-like methods for your named tables.</p><p>Read more about TinyBase&#x27;s tools and CLI in the <a href="https://tinybase.org/guides/developer-tools/">Developer Tools</a> guide.</p></section>

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

<section><h2 id="did-we-say-tiny">Did we say tiny?</h2><p>If you use the basic <a href="https://tinybase.org/api/store/"><code>store</code></a> module alone, you&#x27;ll only add a gzipped <em>4.2kB</em> to your app. You can incrementally add the other modules as you need more functionality, or get it all for <em>8.7kB</em>.</p><p>The <a href="https://tinybase.org/api/ui-react/"><code>ui-react</code></a> module is just another <em>3.4kB</em>, the <a href="https://tinybase.org/api/tools/"><code>tools</code></a> module is <em>5.4kB</em>, and everything is fast. Life&#x27;s easy when you have zero dependencies!</p><p>Read more about how TinyBase is structured in the <a href="https://tinybase.org/guides/how-tinybase-is-built/architecture/">Architecture</a> guide.</p></section><div class="table"><table class="fixed"><tbody><tr><th width="30%"> </th><th>.js.gz</th><th>.js</th><th>debug.js</th><th>.d.ts</th></tr><tr><th class="right"><a href="https://tinybase.org/api/store/">store</a></th><td>4.2kB</td><td>10.0kB</td><td>43.9kB</td><td>184.6kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/metrics/">metrics</a></th><td>1.8kB</td><td>3.6kB</td><td>14.8kB</td><td>29.1kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/indexes/">indexes</a></th><td>1.9kB</td><td>3.7kB</td><td>16.6kB</td><td>33.9kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/relationships/">relationships</a></th><td>1.8kB</td><td>3.6kB</td><td>16.8kB</td><td>42.1kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/queries/">queries</a></th><td>2.6kB</td><td>5.5kB</td><td>24.9kB</td><td>106.8kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/checkpoints/">checkpoints</a></th><td>1.5kB</td><td>3.0kB</td><td>12.5kB</td><td>33.4kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/persisters/">persisters</a></th><td>0.8kB</td><td>1.7kB</td><td>5.2kB</td><td>27.2kB</td></tr><tr><th class="right"><a href="https://tinybase.org/api/common/">common</a></th><td>0.1kB</td><td>0.1kB</td><td>0.1kB</td><td>3.5kB</td></tr><tr><th class="right">tinybase (all)</th><td>8.7kB</td><td>21.1kB</td><td>92.8kB</td><td>0.3kB</td></tr></tbody></table></div><section><h2 id="well-tested-and-documented">Well tested and documented.</h2><p>TinyBase has <em>100.0%</em> test coverage, including the code throughout the documentation - even on this page! The guides, demos, and API examples are designed to make it as easy as possible to get up and running.</p><p>Read more about how TinyBase is tested in the Unit <a href="https://tinybase.org/guides/how-tinybase-is-built/testing/">Testing</a> guide.</p></section><div class="table"><table class="fixed"><tbody><tr><th width="30%"> </th><th>Total</th><th>Tested</th><th>Coverage</th></tr><tr><th class="right">Lines</th><td>1,794</td><td>1,794</td><td>100.0%</td></tr><tr><th class="right">Statements</th><td>1,932</td><td>1,932</td><td>100.0%</td></tr><tr><th class="right">Functions</th><td>768</td><td>768</td><td>100.0%</td></tr><tr><th class="right">Branches</th><td>628</td><td>628</td><td>100.0%</td></tr><tr><th class="right">Tests</th><td colspan="3">2,581</td></tr><tr><th class="right">Assertions</th><td colspan="3">12,421</td></tr></tbody></table></div><hr><p><a class="start" href="https://tinybase.org/guides/the-basics/getting-started/">Get started</a></p><p><a href="https://tinybase.org/demos/">Try the demos</a></p><p><a href="https://tinybase.org/api/store/interfaces/store/store/">Read the docs</a></p><hr><section><h2 id="follow">Follow</h2><ul><li>News and updates on <a href="https://twitter.com/tinybasejs">Twitter</a>, <a href="https://discord.com/invite/mGz3mevwP8">Discord</a>, and <a href="https://facebook.com/tinybasejs">Facebook</a>.</li><li><a href="https://github.com/tinyplex/tinybase/discussion">Discussions</a> and <a href="https://github.com/tinyplex/tinybase/issues">issues</a> on <a href="https://github.com/tinyplex/tinybase">GitHub</a>.</li><li><a href="https://tinybase.org/guides/releases/">Release notes</a> for each version.</li><li>Packages on <a href="https://www.npmjs.com/package/tinybase/v/3.0.2">NPM</a>.</li></ul></section><section><h2 id="about">About</h2><p>Building TinyBase was originally an interesting exercise for <a rel="me" href="https://hachyderm.io/@jamesgpearce">me</a> in API design, minification, and documentation. It could not have been built without these great <a href="https://tinybase.org/guides/how-tinybase-is-built/credits/#giants">projects</a> and <a href="https://tinybase.org/guides/how-tinybase-is-built/credits/#and-friends">friends</a>, and I hope you enjoy using it!</p></section>