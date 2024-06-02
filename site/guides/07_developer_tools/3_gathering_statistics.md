# Gathering Statistics

Finally, the Tools object lets you inspect various statistics about the size of
a Store at runtime, via the getStoreStats method.

Again, this is used for debugging purposes and should not be invoked in a
production environment since there is a small performance cost to tallying the
entries. However, you may find it useful to track the size of your Store's size
in a debug build to make sure you are not losing track of your data.

## Basic Statistics

The getStoreStats method returns a StoreStats object, containing statistics
about the Store. To get a basic summary, call the method with no arguments:

```js
import {createStore} from 'tinybase';
import {createTools} from 'tinybase/tools';

const store = createStore()
  .setTable('pets', {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
    cujo: {species: 'dog', friendly: false},
  })
  .setValues({open: true, employees: 3});

const tools = createTools(store);
const basicStats = tools.getStoreStats();

console.log(basicStats);
// -> {jsonLength: 133, totalTables: 1, totalRows: 3, totalCells: 4, totalValues: 2}
```

## Detailed Statistics

When passed a `detail` flag, the getStoreStats method still returns a StoreStats
object, but a new `detail` key within it will contain a StoreStatsDetail object.
This is a more detailed Table by Table, Row by Row breakdown.

```js
const detailStats = tools.getStoreStats(true);

console.log(detailStats.detail.tables.pets.rows);
// -> {fido: {rowCells: 1}, felix: {rowCells: 1}, cujo: {rowCells: 2}}
console.log(detailStats.detail.tables.pets.tableRows);
// -> 3
console.log(detailStats.detail.tables.pets.tableCells);
// -> 4
```

We finish off by learning about the tools CLI in the Command Line guide.
