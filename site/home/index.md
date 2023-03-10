# TinyBase

<section id="hero">
  <h2>
    The <em>reactive</em> data store for <span>local-first apps</span>.
  </h2>
  <p>
    Modern apps deserve better. Why trade reactive user experiences to be able 
    to use relational data? Why sacrifice store features for bundle size? And 
    why should the cloud do all the work 
    <a href='https://localfirstweb.dev/' target='_blank'>anyway</a>?
  </p>
  <p><em>TinyBase is a smart new way to structure your local app data:</em></p>
  <ul>
    <li>
      Manage <a href='#start-with-a-simple-key-value-store'>key-value 
      data</a> (<em>new!</em>), <a href='#level-up-to-use-tabular-data'>tabular 
      data</a> - or both - with optional 
      <a href='#apply-schemas-to-tables-and-values'>schematization</a> to model 
      it.
    </li>
    <li>
      <a href='#register-listeners-at-any-granularity'>Flexibly reactive</a> to
      reconciled updates, so your UI only spends cycles on the data that changes.
    </li>
    <li>
      <a href='#build-complex-queries-with-tinyql'>Powerful query engine</a> to
      select, join, filter, group, sort and paginate data - reactively.
    </li>
    <li>
      <a href='#create-indexes-for-fast-lookups'>Indexing</a>,
      <a href='#define-metrics-and-aggregations'>metrics</a>,
      <a href='#configure-relationships-between-tables'>relationships</a> - and
      even an <a href='#use-checkpoints-for-an-easy-undo-stack'>undo stack</a>
      for your app state! - out of the box.
    </li>
    <li>
      Easily <a href='#persist-data-to-browser-file-or-server'>sync your
      data</a> to local or remote storage, and use
      <a href='#call-hooks-to-bind-to-data'>idiomatic bindings</a> to your
      UI</a>.
    </li>
    <li>
      <a href='#generate-orm-like-apis'>Generate ORM-like APIs</a> 
      (<em>new!</em>) in TypeScript, based on a schema or inferred from actual 
      data.
    </li>
  </ul>
  <p>
    <em>Tiny by name, tiny by nature</em>, TinyBase only costs
    <a href='#did-we-say-tiny'>@@EVAL("toKb(sizes.get('store.js.gz'))") -
    @@EVAL("toKb(sizes.get('tinybase.js.gz'))")</a> when compressed, and has 
    zero dependencies. And of course it's <a href='#well-tested-and-documented'>
    well tested</a>, <a href='/guides/the-basics/getting-started/'>fully 
    documented</a>, and <a href='@@EVAL("metadata.repository")'>open source</a>.
    Other <a href="/guides/faq/">FAQs</a>?
  </p>
</section>

<a id='new' href='/guides/releases/#v3-0'><em>NEW!</em> v3.0 release</a>

---

<a class='start' href='/guides/the-basics/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/store/interfaces/store/store/'>Read the docs</a>

---

> ## Start with a simple key-value store.
>
> Creating a Store requires just a simple call to the createStore function. Once
> you have one, you can easily set Values in it by unique Id. And of course you
> can easily get them back out again.
>
> Read more about using keyed value data in The Basics guide.

```js
const store = createStore()
  .setValues({employees: 3})
  .setValue('open', true);

console.log(store.getValues());
// -> {employees: 3, open: true}
```

> ## Level up to use tabular data.
>
> For other types of data applications, a tabular data structure is more
> useful. TinyBase lets you set and get nested Table, Row, or Cell data, by
> unique Id and in the same Store as the keyed values.
>
> Read more about setting and changing data in The Basics guide.

```js
store
  .setTable('pets', {fido: {species: 'dog'}})
  .setCell('pets', 'fido', 'color', 'brown');

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog', color: 'brown'}
```

> ## Register listeners at any granularity.
>
> The magic starts to happen when you register listeners on a Value, Table, Row,
> or Cell. They get called when any part of that object changes. You can also
> use wildcards - useful when you don't know the Id of the objects that might
> change.
>
> Read more about listeners in the Listening To Stores guide.

```js
const listenerId = store.addTableListener('pets', () =>
  console.log('changed'),
);

store.setCell('pets', 'fido', 'sold', false);
// -> 'changed'

store.delListener(listenerId);
```

> ## Call hooks to bind to data.
>
> If you're using React in your application, the optional ui-react module
> provides hooks to bind to the data in a Store.
>
> More magic! The useCell hook in this example fetches the dog's color. But it
> also registers a listener on that cell that will fire and re-render the
> component whenever the value changes.
>
> Basically you simply describe what data you want in your user interface and
> TinyBase will take care of the whole lifecycle of updating it for you.
>
> Read more about the using hooks in the Using React Hooks guide.

```jsx
const App1 = () => {
  const color = useCell('pets', 'fido', 'color', store);
  return <>Color: {color}</>;
};

const app = document.createElement('div');
const root = ReactDOMClient.createRoot(app);
root.render(<App1 />); // !act
console.log(app.innerHTML);
// -> 'Color: brown'

store.setCell('pets', 'fido', 'color', 'walnut'); // !act
console.log(app.innerHTML);
// -> 'Color: walnut'
```

> ## Use components for reactive apps.
>
> The react module provides simple React components with bindings that make it
> easy to create a fully reactive user interface based on a Store.
>
> In this example, the library's RowView component just needs a reference to the
> Store, the `tableId`, and the `rowId` in order to render the contents of that
> row. An optional `cellComponent` prop lets you override how you want each Cell
> rendered. Again, all the listeners and updates are taken care of for you.
>
> The module also includes a context Provider that sets up default for an entire
> app to use, reducing the need to drill all your props down into your app's
> hierarchy.
>
> Most of the demos showcase the use of these React hooks and components. Take a
> look at Todo App v1 (the basics) to see these user interface binding patterns
> in action.
>
> Read more about the ui-react module in the Building UIs guides.

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

root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> 'species: dog<hr>color: walnut<hr>sold: false<hr>'

store.setCell('pets', 'fido', 'sold', true); // !act
console.log(app.innerHTML);
// -> 'species: dog<hr>color: walnut<hr>sold: true<hr>'

root.unmount(); // !act
```

> ## Apply schemas to tables and values.
>
> By default, a Store can contain any arbitrary Value, and a Row can contain any
> arbitrary Cell. But you can add a ValuesSchema or a TablesSchema to a Store to
> ensure that the values are always what you expect: constraining their types,
> and providing defaults.
>
> In this example, we set a second Row without the `sold` Cell in it. The schema
> ensures it's present with default of `false`.
>
> Read more about schemas in the Using Schemas guide.

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

> ## Persist data to browser, file, or server.
>
> You can easily persist a Store between browser page reloads or sessions. You
> can also synchronize it with a web endpoint, or (if you're using TinyBase in
> an appropriate environment), load and save it to a file.
>
> Read more about persisters in the Persisting Data guide.

```js
const persister = createSessionPersister(store, 'demo');
await persister.save();

console.log(sessionStorage.getItem('demo'));
// -> '[{"pets":{"fido":{"species":"dog","color":"walnut","sold":true},"felix":{"species":"cat","sold":false}}},{"employees":3,"open":true}]'

persister.destroy();
sessionStorage.clear();
```

> ## Build complex queries with TinyQL.
>
> The Queries object lets you query data across tables, with filtering and
> aggregation - using a SQL-adjacent syntax called TinyQL.
>
> Accessors and listeners let you sort and paginate the results efficiently,
> making building rich tabular interfaces easier than ever.
>
> In this example, we have two tables: of pets and their owners. They are joined
> together by the pet's ownerId Cell. We select the pet's species, and the owner's
> state, and then aggregate the prices for the combinations.
>
> We access the results by descending price, essentially answering the question:
> "which is the highest-priced species, and in which state?"
>
> Needless to say, the results are reactive too! You can add listeners to
> queries just as easily as you do to raw tables.
>
> Read more about Queries in the [v2.0 Release Notes](/guides/releases/#v2-0),
> the Making Queries guide, and the Car Analysis demo and Movie Database demo.

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

> ## Define metrics and aggregations.
>
> A Metrics object makes it easy to keep a running aggregation of Cell values in
> each Row of a Table. This is useful for counting rows, but also supports
> averages, ranges of values, or arbitrary aggregations.
>
> In this example, we create a new table of the pet species, and keep a track of
> which is most expensive. When we add horses to our pet store, the listener
> detects that the highest price has changed.
>
> Read more about Metrics in the Using Metrics guide.

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

> ## Create indexes for fast lookups.
>
> An Indexes object makes it easy to look up all the Row objects that have a
> certain value in a Cell.
>
> In this example, we create an index on the `species` Cell values. We can then
> get the the list of distinct Cell value present for that index (known as
> 'slices'), and the set of Row objects that match each value.
>
> Indexes objects are reactive too. So you can set listeners on them just as you
> do for the data in the underlying Store.
>
> Read more about Indexes in the Using Indexes guide.

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

> ## Model relationships between tables.
>
> A Relationships object lets you associate a Row in a local Table with the Id
> of a Row in a remote Table. You can also reference a table to itself to create
> linked lists.
>
> In this example, the `species` Cell of the `pets` Table is used to create a
> relationship to the `species` Table, so that we can access the price of a
> given pet.
>
> Like everything else, you can set listeners on Relationships too.
>
> Read more about Relationships in the Using Relationships guide.

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

> ## Set checkpoints for an undo stack.
>
> A Checkpoints object lets you set checkpoints on a Store. Move forward and
> backward through them to create undo and redo functions.
>
> In this example, we set a checkpoint, then sell one of the pets. Later, the
> pet is brought back to the shop, and we go back to that checkpoint to revert
> the store to its previous state.
>
> Read more about Checkpoints in the Using Checkpoints guide.

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

> ## Generate ORM-like APIs
>
> You can easily create TypeScript `.d.ts` definitions that model your data and
> encourage type-safety when reading and writing data - as well as `.ts`
> implementations that provide ORM-like methods for your named tables.
>
> Read more about TinyBase's tools and CLI in the Developer Tools guide.

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

> ## Did we say tiny?
>
> If you use the basic store module alone, you'll only add a gzipped
> _@@EVAL("toKb(sizes.get('store.js.gz'))")_ to your app. You can incrementally
> add the other modules as you need more functionality, or get it all for
> _@@EVAL("toKb(sizes.get('tinybase.js.gz'))")_.
>
> The ui-react module is just another
> _@@EVAL("toKb(sizes.get('ui-react.js.gz'))")_, the tools module is
> _@@EVAL("toKb(sizes.get('tools.js.gz'))")_, and everything is fast. Life's
> easy when you have zero dependencies!
>
> Read more about how TinyBase is structured in the Architecture guide.

@@EVAL("getSizeTable()")

> ## Well tested and documented.
>
> TinyBase has _@@EVAL("coverage.lines.pct.toFixed(1)")%_ test coverage,
> including the code throughout the documentation - even on this page! The
> guides, demos, and API examples are designed to make it as easy as possible to
> get up and running.
>
> Read more about how TinyBase is tested in the Unit Testing guide.

@@EVAL("getCoverageTable()")

---

<a class='start' href='/guides/the-basics/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/store/interfaces/store/store/'>Read the docs</a>

---

<section>
  <h2>Follow</h2>
  <ul>
    <li>
      News and updates on <a href='https://twitter.com/tinybasejs'>Twitter</a>, 
      <a href='https://discord.com/invite/mGz3mevwP8'>Discord</a>, and 
      <a href='https://facebook.com/tinybasejs'>Facebook</a>.
    </li>
    <li>
      <a href='@@EVAL("metadata.repository")/discussions'>Discussions</a> and 
      <a href='@@EVAL("metadata.repository")/issues'>issues</a> on 
      <a href='@@EVAL("metadata.repository")'>GitHub</a>.
    </li>
    <li>
      <a href='/guides/releases/'>Release notes</a> for each version.
    </li>
    <li>
      Packages on <a href='@@EVAL("metadata.package")'>NPM</a>.
    </li>
  </ul>
</section>

> ## About
>
> Building TinyBase was originally an interesting exercise for <a rel="me"
> href="https://hachyderm.io/@jamesgpearce">me</a> in API design, minification,
> and documentation. It could not have been built without these great
> [projects](/guides/how-tinybase-is-built/credits/#giants) and
> [friends](/guides/how-tinybase-is-built/credits/#and-friends), and I hope you
> enjoy using it!
