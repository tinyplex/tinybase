// NB: an exclamation mark after a line visually indicates an expected TS error

import {createMetrics, createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'number', default: 0},
    c1s: {type: 'string', default: ''},
  },
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema);
const metricsWithSchema = createMetrics(storeWithSchemas);

const metricsWithNoSchema = createMetrics(createStore());
metricsWithNoSchema.getStore().getTables().t1;
metricsWithNoSchema.getStore().getTables().t2;

metricsWithSchema.setMetricDefinition('m1', 't1', 'sum', 'c1');
metricsWithSchema.setMetricDefinition('m1', 't1', 'sum', (getCell) =>
  getCell('c1d'),
);
metricsWithSchema.setMetricDefinition('m1', 't2', 'sum', 'c1'); // !
metricsWithSchema.setMetricDefinition('m1', 't1', 'sum', 'c2'); // !
metricsWithSchema.setMetricDefinition(
  'm1',
  't1',
  'sum',
  (getCell) => getCell('c1'), // !
);
metricsWithSchema.setMetricDefinition(
  'm1',
  't1',
  'sum',
  (getCell) => getCell('c1s'), // !
);
metricsWithSchema.setMetricDefinition(
  'm1',
  't1',
  'sum',
  (getCell) => getCell('c2'), // !
);

metricsWithSchema.delMetricDefinition('m1').getStore().getTables().t1;
metricsWithSchema.delMetricDefinition('m1').getStore().getTables().t2; // !

metricsWithSchema.getStore().getTables().t1;
metricsWithSchema.getStore().getTables().t2; // !

metricsWithSchema.forEachMetric((_metricId, metric) => {
  metric as number;
  metric as string; // !
});

metricsWithSchema.getTableId('m1') == 't0';
metricsWithSchema.getTableId('m1') == 't1';
metricsWithSchema.getTableId('m1') == 't2'; // !

metricsWithSchema.addMetricListener('m1', (metrics) => {
  metrics.getStore().getTables().t1;
  metrics.getStore().getTables().t2; // !
});

metricsWithSchema.delListener('m1').getStore().getTables().t1;
metricsWithSchema.delListener('m1').getStore().getTables().t2; // !
