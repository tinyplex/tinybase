# TinyBase

<section id="hero">
  <h2>
    The <em>reactive</em> data store for <span>local-first apps</span>.
  </h2>
  <p id='copy'>
    Build blisteringly fast web apps that work both online and offline. Manage 
    your state locally, synchronize it to the cloud when you need to, or even 
    make it collaborative. But, most importantly... have fun building stuff 
    again!
  </p>
</section>

<a href='/guides/releases/#v5-0'><em>NEW!</em> v5.0 release</a> <span
id="one-with">"The One You Can Sync"</span>

<a class='start' href='/guides/the-basics/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/store/interfaces/store/store/'>Read the docs</a>

---

<ul>
  <li>
    Manage <a href='#start-with-a-simple-key-value-store'>key-value 
    data</a>, <a href='#level-up-to-use-tabular-data'>tabular data</a> - or 
    both - with optional 
    <a href='#apply-schemas-to-tables-values'>schematization</a> to model 
    your app's data structures.
  </li>
  <li>
    <a href='#register-granular-listeners'>Flexibly reactive</a> to
    reconciled updates, so you only spend rendering cycles on things that 
    change.
  </li>
  <li>
    <a href='#build-complex-queries-with-tinyql'>Powerful query engine</a> to
    select, join, filter, group, sort and paginate data - reactively - and 
    without SQL.
  </li>
  <li>
    Built-in <a href='#create-indexes-for-fast-lookups'>indexing</a>,
    <a href='#define-metrics-and-aggregations'>metric aggregation</a>,
    <a href='#model-table-relationships'>tabular relationships</a> - and
    even an <a href='#set-checkpoints-for-an-undo-stack'>undo stack</a>
    for your app state.
  </li>
  <li>
    Create <a href='#type-definitions-orm-like-apis'>type definitions &amp; 
    ORM-like APIs</a>, from schema or inference. 
    <a href='#an-inspector-for-your-data'>Inspect your data</a> (<em>new!</em>) 
    directly in the browser.
  </li>
  <li>
    Easily <a href='#persist-to-storage-sqlite-crdts'>sync your data</a> to 
    browser <a href='/api/persister-browser'>storage</a>, 
    <a href='/api/persister-indexed-db/'>IndexedDB</a>,
    <a href='/guides/schemas-and-persistence/database-persistence/'>SQLite</a>, 
    <a href='/guides/schemas-and-persistence/synchronizing-data/'>CRDTs</a>; and 
    (<em>new!</em>) <a href='/api/persister-partykit-client/'>PartyKit</a> and
    <a href='https://electric-sql.com/'>ElectricSQL</a>.
  </li>
  <li>
    Optional <a href='#call-hooks-to-bind-to-data'>bindings to React</a> and 
    (<em>new!</em>) <a href='#pre-built-reactive-components'>pre-built 
    components</a> that let you easily build fully reactive user interfaces.
  </li>
  <li>
    Tiny by name, tiny by nature:
    <a href='#did-we-say-tiny'>@@EVAL("toKb(sizes.get('store.js.gz'))") -
    @@EVAL("toKb(sizes.get('tinybase.js.gz'))")</a>, no dependencies. <a href='#well-tested-and-documented'>100% tested</a>, 
    <a href='/guides/the-basics/getting-started/'>fully documented</a>, and of 
    course, <a href='@@EVAL("metadata.repository")'>open source</a>!
  </li>
</ul>

---

<section id="friends">
<h2>TinyBase works great on its own, but also plays well with friends!</h2>
<div>
  <a href='/guides/building-uis/getting-started-with-ui-react'>
    <img width="48" src="/react.svg" /> React
  </a>
</div>
<div>
  <a href='/api/persister-partykit-client'>
    <img width="48" src="/partykit.svg" /> PartyKit
  </a>
</div>
<div>
  <a href='/guides/schemas-and-persistence/database-persistence'>
    <img width="48" src="/expo.svg" />Expo SQLite
  </a>
</div>
<div>
  <a href='/guides/schemas-and-persistence/database-persistence'>
    <img width="48" src="/electric.svg" />ElectricSQL
  </a>
</div>
<div>
  <a href='/guides/schemas-and-persistence/database-persistence'>
    <img width="48" src="/sqlite.svg" /> SQLite
  </a>
</div>
<div>
  <a href='/guides/schemas-and-persistence/database-persistence'>
    <img width="48" src="/turso.svg" />Turso
  </a>
</div>
<div>
  <a href='/guides/schemas-and-persistence/database-persistence'>
    <img width="48" src="/powersync.svg" />PowerSync
  </a>
</div>
<div>
  <a href='/api/persister-indexed-db/functions/creation/createindexeddbpersister'>
    <img width="48" src="/indexeddb.svg" /> IndexedDB
  </a>
</div>
<div>
  <a href='/api/persister-yjs/functions/creation/createyjspersister'>
    <img width="48" src="/yjs.svg" /> YJS
  </a>
</div>
<div>
  <a href='/api/persister-cr-sqlite-wasm'>
    <img width="48" src="/crsqlite.png" /> CR-SQLite
  </a>
</div>
<div>
  <a href='/api/persister-automerge'>
    <img width="48" src="/automerge.svg" /> Automerge
  </a>
</div>
</section>

---

<section id="follow">

  <a href='@@EVAL("metadata.repository")' target='_blank'>
    <img src="https://img.shields.io/github/stars/tinyplex/tinybase?style=for-the-badge&logo=GitHub&logoColor=%23fff&label=GitHub&labelColor=%23d81b60&color=%23333">
  </a>

  <a href='https://discord.com/invite/mGz3mevwP8' target='_blank'>
    <img src="https://img.shields.io/discord/1027918215323590676?style=for-the-badge&logo=discord&logoColor=%23fff&label=Discord&labelColor=%233131e8&color=%23333" />
  </a>

  <a href='https://twitter.com/tinybasejs' target='_blank'>
    <img src="https://img.shields.io/twitter/follow/tinybasejs?style=for-the-badge&logo=x&logoColor=%23fff&label=Twitter&labelColor=%23333&color=%23333" />
  </a>
  
  <br />

  <a href='@@EVAL("metadata.repository")/discussions' target='_blank'>
    <img src="https://img.shields.io/github/discussions/tinyplex/tinybase?style=for-the-badge&logo=GitHub&logoColor=%23fff&label=Ideas&labelColor=%23d81b60&color=%23333">
  </a>

  <a href='@@EVAL("metadata.repository")/issues' target='_blank'>
    <img src="https://img.shields.io/github/issues/tinyplex/tinybase?style=for-the-badge&logo=GitHub&logoColor=%23fff&label=Issues&labelColor=%23d81b60&color=%23333">
  </a>

  <a href='#well-tested-and-documented'>
    <img src="https://img.shields.io/badge/Tests-100%25-green?style=for-the-badge&logo=jest&logoColor=%23fff&color=%23333&labelColor=%2387c305" />
  </a>

  <a href='@@EVAL("metadata.package")' target='_blank'>
    <img src="https://img.shields.io/npm/v/tinybase?style=for-the-badge&logo=npm&logoColor=%23fff&labelColor=%23bd0005&color=%23333" />
  </a>

</section>

---

> ## Start with a simple key-value store.
>
> Creating a Store requires just a simple call to the createStore function. Once
> you have one, you can easily set Values in it by unique Id. And of course you
> can easily get them back out again.
>
> Read more about using keyed value data in The Basics guide.

```js
import {createStore} from 'tinybase';

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
> unique Id - and in the same Store as the keyed values!
>
> Read more about setting and changing data in The Basics guide.

```js
store
  .setTable('pets', {fido: {species: 'dog'}})
  .setCell('pets', 'fido', 'color', 'brown');

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog', color: 'brown'}
```

> ## Register granular listeners.
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
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useCell} from 'tinybase/ui-react';

const App1 = () => {
  const color = useCell('pets', 'fido', 'color', store);
  return <>Color: {color}</>;
};

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App1 />); // !act
console.log(app.innerHTML);
// -> 'Color: brown'

store.setCell('pets', 'fido', 'color', 'walnut'); // !act
console.log(app.innerHTML);
// -> 'Color: walnut'
```

> ## Pre-built reactive components.
>
> The ui-react module provides bare React components that let you build up a
> fully reactive user interface based on a Store.
>
> For web applications in particular, the new ui-react-dom module provides
> pre-built components for tabular display of your data, with lots of
> customization and interactivity options.
>
> Try them out in the UI Components demos, and read more about the underlying
> ui-react module in the Building UIs guides.

<img src='/ui-react-dom.webp' />

> ## An inspector for your data.
>
> If you are building a web application, the new StoreInspector component lets
> you overlay a view of the data in your Store, Indexes, Relationships, and so
> on. You can even edit the data in place and see it update in your app
> immediately.
>
> Read more about this powerful new tool in the Inspecting Data guide.

<img src='/store-inspector.webp' />

> ## Apply schemas to tables & values.
>
> By default, a Store can contain any arbitrary Value, and a Row can contain any
> arbitrary Cell. But you can add a ValuesSchema or a TablesSchema to a Store to
> ensure that the values are always what you expect: constraining their types,
> and providing defaults.
>
> In this example, we set a new Row without the `sold` Cell in it. The schema
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

store.setRow('pets', 'polly', {species: 'parrot'});
console.log(store.getRow('pets', 'polly'));
// -> {species: 'parrot', sold: false}

store.delTablesSchema();
```

> ## Persist to storage, SQLite, CRDTs.
>
> You can easily persist a Store between browser page reloads or sessions. You
> can also synchronize it with a web endpoint, or (if you're using TinyBase in
> an appropriate environment), load and save it to a file. [New in
> v4.0](/guides/releases/#v4-0), you can bind [TinyBase to
> SQLite](/guides/schemas-and-persistence/database-persistence/) via a range of
> modules, or to [Yjs](https://yjs.dev/) or [Automerge](https://automerge.org/)
> CRDT documents.
>
> Read more about persisters in the Persisting Data guide.

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

> ## Build complex queries with TinyQL.
>
> The Queries object lets you query data across tables, with filtering and
> aggregation - using a SQL-adjacent syntax called TinyQL.
>
> Accessors and listeners let you sort and paginate the results efficiently,
> making building rich tabular interfaces easier than ever.
>
> In this example, we have two tables: of pets and their owners. They are joined
> together by the pet's ownerId Cell. We select the pet's species, and the
> owner's state, and then aggregate the prices for the combinations.
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

> ## Model table relationships.
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

> ## Type definitions &amp; ORM-like APIs
>
> TinyBase has comprehensive type definitions, and even offers definitions that
> infer API types from the data schemas you apply.
>
> Furthermore, you can easily create TypeScript `.d.ts` definitions that model
> your data and encourage type-safety when reading and writing data - as well as
> `.ts` implementations that provide ORM-like methods for your named tables.
>
> Read more about type support in the TinyBase and TypeScript guide.

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
> _@@EVAL("toKb(sizes.get('store.js.gz'))")_ to your app. Incrementally add the
> other modules as you need more functionality, or get it all for
> _@@EVAL("toKb(sizes.get('tinybase.js.gz'))")_.
>
> The optional ui-react module is just another
> _@@EVAL("toKb(sizes.get('ui-react.js.gz'))")_, the auxiliary tools module is
> _@@EVAL("toKb(sizes.get('tools.js.gz'))")_, and everything is super fast.
> Life's easy when you have zero dependencies!
>
> Read more about how TinyBase is structured and packaged in the Architecture
> guide.

@@EVAL("getSizeTable()")

> ## Well tested and documented.
>
> TinyBase has _@@EVAL("coverage.lines.pct.toFixed(1)")%_ test coverage,
> including the code throughout the documentation - even on this page! The
> guides, demos, and API examples are designed to make it as easy as possible
> for you to get your TinyBase-powered app up and running.
>
> Read more about how TinyBase is tested in the Unit Testing guide.

@@EVAL("getCoverageTable()")

---

<section id="sponsors">
<h2>Proud to be sponsored by:</h2>
@@EVAL("getGitHubAvatar('expo')")
@@EVAL("getGitHubAvatar('beekeeb')")
@@EVAL("getGitHubAvatar('cancelself')")
@@EVAL("getGitHubAvatar('WonderPanda')")
@@EVAL("getGitHubAvatar('arpitBhalla')")
</section>

<section id="users">
<h2>Excited to be used by:</h2>
@@EVAL("getGitHubAvatar('Apocalypsor')")
@@EVAL("getGitHubAvatar('brentvatne')")
@@EVAL("getGitHubAvatar('circadian-risk')")
@@EVAL("getGitHubAvatar('cubecull')")
@@EVAL("getGitHubAvatar('erwinkn')")
@@EVAL("getGitHubAvatar('expo')")
@@EVAL("getGitHubAvatar('ezra-en')")
@@EVAL("getGitHubAvatar('fdfontes')")
@@EVAL("getGitHubAvatar('feychenie')")
@@EVAL("getGitHubAvatar('flaming-codes')")
@@EVAL("getGitHubAvatar('fostertheweb')")
@@EVAL("getGitHubAvatar('fostertheweb')")
@@EVAL("getGitHubAvatar('generates')")
@@EVAL("getGitHubAvatar('Giulio987')")
@@EVAL("getGitHubAvatar('itsdevcoffee')")
@@EVAL("getGitHubAvatar('jaysc')")
@@EVAL("getGitHubAvatar('jbolda')")
@@EVAL("getGitHubAvatar('Kayoo-asso')")
@@EVAL("getGitHubAvatar('kotofurumiya')")
@@EVAL("getGitHubAvatar('Kudo')")
@@EVAL("getGitHubAvatar('learn-anything')")
@@EVAL("getGitHubAvatar('lluc')")
@@EVAL("getGitHubAvatar('marksteve')")
@@EVAL("getGitHubAvatar('miking-the-viking')")
@@EVAL("getGitHubAvatar('mjamesderocher')")
@@EVAL("getGitHubAvatar('nikitavoloboev')")
@@EVAL("getGitHubAvatar('palerdot')")
@@EVAL("getGitHubAvatar('PorcoRosso85')")
@@EVAL("getGitHubAvatar('shaneosullivan')")
@@EVAL("getGitHubAvatar('sudo-self')")
@@EVAL("getGitHubAvatar('SuperSonicHub1')")
@@EVAL("getGitHubAvatar('threepointone')")
@@EVAL("getGitHubAvatar('uptonking')")
@@EVAL("getGitHubAvatar('WonderPanda')")
</section>

---

<a class='start' href='/guides/the-basics/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/store/interfaces/store/store/'>Read the docs</a>

---

<section id="about">
  <h2>About</h2>
  <p>Modern apps deserve better. Why trade reactive user experiences to be able
  to use relational data? Or sacrifice features for bundle size? And why does 
  the cloud do all the work 
  <a href='https://localfirstweb.dev/' target='_blank'>anyway</a>?</p>

  <p>Building TinyBase was originally an interesting exercise for <a rel="me"
  href="https://tripleodeon.com">me</a> in API design, minification, and
  documentation. But now it has taken on a life of its own, and has grown
  beyond my wildest expectations.</p>

  <p>It could not have been built without these great
  <a href='/guides/how-tinybase-is-built/credits/#giants'>projects</a> and
  <a href='/guides/how-tinybase-is-built/credits/#and-friends'>friends</a>, and 
  I hope you enjoy using it as much as I do building it!</p>
</section>

<section id="story">
  <h2>The story</h2>
  <a href='https://youtu.be/hXL7OkW-Prk?t=1232' target='_blank'>
    <img src="/youtube.webp">
  </a>
</section>
