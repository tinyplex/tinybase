import {
  Table,
  createIndexes,
  createMetrics,
  createStore,
} from '../../lib/debug/tinybase';
import {getNCells, getNRows, getNTables, repeat, µs} from './common';

repeat(
  'Create store without schema',
  'tables',
  'µs per table',
  (N) => [µs(() => createStore().setTables(getNTables(N))), N],
  30,
);

repeat(
  'Create store without schema',
  'rows',
  'µs per row',
  (N) => [µs(() => createStore().setTables({table: getNRows(N)})), N],
  20,
);

repeat(
  'Create store without schema',
  'cells',
  'µs per cell',
  (N) => [µs(() => createStore().setTables({table: {row: getNCells(N)}})), N],
  20,
);

repeat(
  'Create store with schema (correct)',
  'rows',
  'µs per row',
  (N) => [
    µs(() =>
      createStore()
        .setSchema({table: {cell: {type: 'number'}}})
        .setTables({table: getNRows(N)}),
    ),
    N,
  ],
  15,
);

repeat(
  'Create store with schema (defaulting)',
  'rows',
  'µs per row',
  (N) => [
    µs(() =>
      createStore()
        .setSchema({table: {cell: {type: 'number', default: 1}}})
        .setTables({table: getNRows(N)}),
    ),
    N,
  ],
  15,
);

repeat(
  'Create store with schema (incorrect)',
  'rows',
  'µs per row',
  (N) => {
    const table: Table = {};
    for (let n = 1; n <= N; n++) {
      table['row' + n] = {cell: 1, cell2: 'two'};
    }
    return [
      µs(() =>
        createStore()
          .setSchema({table: {cell: {type: 'number'}, cell2: {type: 'number'}}})
          .setTables({table}),
      ),
      N,
    ];
  },
  15,
);

repeat(
  'Create store with index',
  'rows',
  'µs per row',
  (N) => {
    const store = createStore();
    createIndexes(store).setIndexDefinition('oddEven', 'table', (getCell) =>
      (getCell('cell') as any as number) % 2 == 0 ? 'even' : 'odd',
    );
    return [µs(() => store.setTable('table', getNRows(N))), N];
  },
  30,
);

repeat(
  'Create store with metric',
  'rows',
  'µs per row',
  (N) => {
    const store = createStore();
    createMetrics(store).setMetricDefinition('max', 'table', 'max', 'cell');
    return [µs(() => store.setTable('table', getNRows(N))), N];
  },
  30,
);
