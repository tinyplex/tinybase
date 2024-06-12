import {
  createIndexes,
  createMetrics,
  createQueries,
  createStore,
} from 'tinybase';
import {
  getNCells,
  getNRows,
  getNTables,
  getNValues,
  repeat,
  µs,
} from './common.ts';
import type {Table} from 'tinybase';

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
  (N) => [µs(() => createStore().setTables({t1: getNRows(N)})), N],
  20,
);

repeat(
  'Create store without schema',
  'cells',
  'µs per cell',
  (N) => [µs(() => createStore().setTables({t1: {r1: getNCells(N)}})), N],
  20,
);

repeat(
  'Create store without schema',
  'values',
  'µs per value',
  (N) => [µs(() => createStore().setValues(getNValues(N))), N],
  20,
);

repeat(
  'Create store with schema (correct)',
  'rows',
  'µs per row',
  (N) => [
    µs(() =>
      createStore()
        .setTablesSchema({t1: {c1: {type: 'number'}}})
        .setTables({t1: getNRows(N)}),
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
        .setTablesSchema({t1: {c1: {type: 'number', default: 1}}})
        .setTables({t1: getNRows(N)}),
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
    const t1: Table = {};
    for (let n = 1; n <= N; n++) {
      t1['r' + n] = {c1: 1, c2: 'two'};
    }
    return [
      µs(() =>
        createStore()
          .setTablesSchema({t1: {c1: {type: 'number'}, c2: {type: 'number'}}})
          .setTables({t1}),
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
    createIndexes(store).setIndexDefinition('i1', 't1', (getCell) =>
      (getCell('c1') as any as number) % 2 == 0 ? 'even' : 'odd',
    );
    return [µs(() => store.setTable('t1', getNRows(N))), N];
  },
  30,
);

repeat(
  'Create store with metric',
  'rows',
  'µs per row',
  (N) => {
    const store = createStore();
    createMetrics(store).setMetricDefinition('m1', 't1', 'max', 'c1');
    return [µs(() => store.setTable('t1', getNRows(N))), N];
  },
  30,
);

repeat(
  'Create store with expensive query after creation',
  'rows',
  'µs per row',
  (N) => {
    const store = createStore();
    for (let n = 0; n <= N; n++) {
      store.setRow('t1', 'r' + n, {
        c1: Math.round(Math.random() * 100),
        c2: Math.random(),
      });
    }
    return [
      µs(() => {
        createQueries(store).setQueryDefinition(
          'q1',
          't1',
          ({select, where, group, having}) => {
            select('c1');
            select('c2');
            where((getTableCell) => (getTableCell('c1') as number) > 25);
            group('c2', 'avg');
            having(
              (getSelectedOrGroupedCell) =>
                (getSelectedOrGroupedCell('c2') as number) > 0.5,
            );
          },
        );
      }),
      N,
    ];
  },
  30,
);
