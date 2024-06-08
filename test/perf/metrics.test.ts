import {createMetrics, createStore} from 'tinybase/debug';
import type {Store} from 'tinybase/debug';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
});

repeatRows(
  'Grow store, different table to metric',
  (n) => store.setRow('t2', 'r' + n, {c1: n}),
  90,
  () => createMetrics(store).setMetricDefinition('m1', 't1', 'avg', 'c1'),
);

repeatRows(
  'Grow store, same table as metric, unrelated cells',
  (n) => store.setRow('t1', 'r' + n, {c2: n}),
  90,
  () => createMetrics(store).setMetricDefinition('m1', 't1', 'avg', 'c1'),
);

['sum', 'avg', 'min', 'max'].forEach((aggregate: string) =>
  repeatRows(
    `Grow store, with ${aggregate} metric`,
    (n) => store.setRow('t1', 'r' + n, {c1: Math.random()}),
    90,
    () =>
      createMetrics(store).setMetricDefinition(
        'm1',
        't1',
        aggregate as 'sum' | 'avg' | 'min' | 'max',
        'c1',
      ),
  ),
);
