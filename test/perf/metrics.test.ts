import {Store, createMetrics, createStore} from '../../lib/debug/tinybase';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
});

repeatRows(
  'Grow store, different table to metric',
  (n) => store.setRow('table2', 'row' + n, {cell: n}),
  90,
  () =>
    createMetrics(store).setMetricDefinition('metric', 'table', 'avg', 'cell'),
);

repeatRows(
  'Grow store, same table as metric, unrelated cells',
  (n) => store.setRow('table', 'row' + n, {cell2: n}),
  90,
  () =>
    createMetrics(store).setMetricDefinition('metric', 'table', 'avg', 'cell'),
);

['sum', 'avg', 'min', 'max'].forEach((metric: string) =>
  repeatRows(
    `Grow store, with ${metric} metric`,
    (n) => store.setRow('table', 'row' + n, {cell: Math.random()}),
    90,
    () =>
      createMetrics(store).setMetricDefinition(
        'metric',
        'table',
        metric as 'sum' | 'avg' | 'min' | 'max',
        'cell',
      ),
  ),
);
