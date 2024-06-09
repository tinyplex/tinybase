import type {Metrics, Store} from 'tinybase/debug';
import {createMetrics, createStore} from 'tinybase/debug';
import {expectChanges, expectNoChanges} from '../common/expect.ts';
import {MetricsListener} from '../common/types.ts';
import {createMetricsListener} from '../common/listeners.ts';
import {getMetricsObject} from '../common/other.ts';
import {jest} from '@jest/globals';

let store: Store;
let metrics: Metrics;
let listener: MetricsListener;

const setCells = () =>
  store
    .setTables({t1: {r1: {c1: 1}}})
    .setTable('t1', {r1: {c1: 1}, r2: {c1: 2}})
    .setRow('t1', 'r3', {c1: 3})
    .setCell('t1', 'r4', 'c1', 4)
    .setCell('t1', 'r4', 'c1', 5);

const delCells = () =>
  store
    .delCell('t1', 'r4', 'c1')
    .delRow('t1', 'r2')
    .delRow('t1', 'r3')
    .delTable('t1')
    .delTables();

beforeEach(() => {
  store = createStore();
  metrics = createMetrics(store);
});

describe('Sets', () => {
  test('count', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1');
    expect(metrics.getMetric('m1')).toBe(4);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(4);
    store.delCell('t1', 'r4', 'c1').delRow('t1', 'r3').delRow('t1', 'r2');
    expect(metrics.getMetric('m1')).toBe(1);
    store.delRow('t1', 'r1');
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('sum', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'sum', 'c1');
    expect(metrics.getMetric('m1')).toBe(11);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(6);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('avg', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'avg', 'c1');
    expect(metrics.getMetric('m1')).toBe(2.75);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(2);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('min', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'min', 'c1');
    expect(metrics.getMetric('m1')).toBe(1);
    store.delCell('t1', 'r1', 'c1');
    store.setCell('t1', 'r1', 'c1', 1);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(1);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('max', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    expect(metrics.getMetric('m1')).toBe(5);
    store.setCell('t1', 'r1', 'c1', 6);
    store.setCell('t1', 'r1', 'c1', 1);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(3);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('definition before data', () => {
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    setCells();
    expect(metrics.getMetric('m1')).toBe(5);
  });

  test('change definition', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    expect(metrics.getMetric('m1')).toBe(5);
    metrics.setMetricDefinition('m1', 't1', 'min', 'c1');
    expect(metrics.getMetric('m1')).toBe(1);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('two definitions', () => {
    setCells();
    metrics
      .setMetricDefinition('m1', 't1', 'max', 'c1')
      .setMetricDefinition('m2', 't1', 'min', 'c1');
    expect(metrics.getMetric('m1')).toBe(5);
    expect(metrics.getMetric('m2')).toBe(1);
    expect(getMetricsObject(metrics)).toEqual({m1: 5, m2: 1});
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(3);
    expect(metrics.getMetric('m2')).toBe(1);
    expect(getMetricsObject(metrics)).toEqual({m1: 3, m2: 1});
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
    expect(metrics.getMetric('m2')).toBeUndefined();
    expect(getMetricsObject(metrics)).toEqual({});
  });

  test('custom aggregation', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', (values) => values.length ** 2);
    expect(metrics.getMetric('m1')).toBe(16);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(16);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('custom cells', () => {
    setCells();
    metrics.setMetricDefinition(
      'm1',
      't1',
      'sum',
      (getCell) => (getCell('c1') as number) % 2,
    );
    expect(metrics.getMetric('m1')).toBe(3);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(2);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('custom aggregation and cells', () => {
    setCells();
    metrics.setMetricDefinition(
      'm1',
      't1',
      (values) => values.reduce((previous, current) => previous * current, 1),
      (getCell) => -(getCell('c1') as number),
    );
    expect(metrics.getMetric('m1')).toBe(30);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(-6);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('custom aggregation and optimizations', () => {
    setCells();
    metrics.setMetricDefinition(
      'm1',
      't1',
      (values) => values.reduce((previous, current) => previous * current, 1),
      'c1',
      (metric, add) => metric * add,
      (metric, remove) => metric / remove,
      (metric, add, remove) => (metric * add) / remove,
    );
    expect(metrics.getMetric('m1')).toBe(30);
    store.setCell('t1', 'r4', 'c1', 'd1');
    expect(metrics.getMetric('m1')).toBe(6);
    delCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });
});

test('Listens to MetricIds', () => {
  const listener = createMetricsListener(metrics);
  const listenerId = listener.listenToMetricIds('/m');
  metrics.setMetricDefinition('m1', 't1');
  metrics.setMetricDefinition('m2', 't2');
  metrics.delMetricDefinition('m1');
  expectChanges(listener, '/m', ['m1'], ['m1', 'm2'], ['m2']);
  expectNoChanges(listener);
  metrics.delListener(listenerId);
});

describe('Listens to Metrics when sets', () => {
  beforeEach(() => {
    listener = createMetricsListener(metrics);
    listener.listenToMetric('/m*', null);
    listener.listenToMetric('/m1', 'm1');
  });

  test('and callback with ids', () => {
    expect.assertions(5);
    store.setTables({t1: {r1: {c1: 1}}});
    metrics.setMetricDefinition('m1', 't1');
    const listener = jest.fn((metrics2, metricId, newMetric, oldMetric) => {
      expect(metrics2).toEqual(metrics);
      expect(metricId).toEqual('m1');
      expect(oldMetric).toEqual(1);
      expect(newMetric).toEqual(2);
    });
    metrics.addMetricListener('m1', listener);
    store.setTables({t1: {r1: {c1: 1}, r2: {c2: 2}}});
    expect(listener).toHaveBeenCalled();
  });

  test('count', () => {
    metrics.setMetricDefinition('m1', 't1');
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 3},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 3},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('sum', () => {
    metrics.setMetricDefinition('m1', 't1', 'sum', 'c1');
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 3},
      {m1: 6},
      {m1: 10},
      {m1: 11},
      {m1: 6},
      {m1: 4},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 3},
      {m1: 6},
      {m1: 10},
      {m1: 11},
      {m1: 6},
      {m1: 4},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('avg', () => {
    metrics.setMetricDefinition('m1', 't1', 'avg', 'c1');
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 1.5},
      {m1: 2},
      {m1: 2.5},
      {m1: 2.75},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 1.5},
      {m1: 2},
      {m1: 2.5},
      {m1: 2.75},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('min', () => {
    metrics.setMetricDefinition('m1', 't1', 'min', 'c1');
    setCells();
    store.setCell('t1', 'r1', 'c1', 6);
    store.setCell('t1', 'r1', 'c1', 1);
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(listener, '/m1', {m1: 1}, {m1: 2}, {m1: 1}, {m1: undefined});
    expectChanges(listener, '/m*', {m1: 1}, {m1: 2}, {m1: 1}, {m1: undefined});
  });

  test('max', () => {
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    setCells();
    store.setCell('t1', 'r1', 'c1', 6);
    store.setCell('t1', 'r1', 'c1', 1);
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 5},
      {m1: 6},
      {m1: 5},
      {m1: 3},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 5},
      {m1: 6},
      {m1: 5},
      {m1: 3},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('definition after data', () => {
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    expect(metrics.getMetric('m1')).toBe(5);
    expectChanges(listener, '/m1', {m1: 5});
    expectChanges(listener, '/m*', {m1: 5});
  });

  test('change definition', () => {
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    setCells();
    metrics.setMetricDefinition('m1', 't1', 'min', 'c1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 5},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 5},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('two definitions', () => {
    listener.listenToMetric('/m2', 'm2');
    metrics
      .setMetricDefinition('m1', 't1', 'max', 'c1')
      .setMetricDefinition('m2', 't1', 'min', 'c1');
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 5},
      {m1: 3},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(listener, '/m2', {m2: 1}, {m2: undefined});
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m2: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 5},
      {m1: 3},
      {m1: 1},
      {m1: undefined},
      {m2: undefined},
    );
    expectNoChanges(listener);
  });

  test('custom aggregation', () => {
    metrics.setMetricDefinition('m1', 't1', (values) => values.length ** 2);
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 4},
      {m1: 9},
      {m1: 16},
      {m1: 9},
      {m1: 4},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 4},
      {m1: 9},
      {m1: 16},
      {m1: 9},
      {m1: 4},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('custom cells', () => {
    metrics.setMetricDefinition(
      'm1',
      't1',
      'sum',
      (getCell) => (getCell('c1') as number) % 2,
    );
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('custom aggregation and cells', () => {
    metrics.setMetricDefinition(
      'm1',
      't1',
      (values) => values.reduce((previous, current) => previous * current, 1),
      (getCell) => -(getCell('c1') as number),
    );
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: -1},
      {m1: 2},
      {m1: -6},
      {m1: 24},
      {m1: 30},
      {m1: -6},
      {m1: 3},
      {m1: -1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: -1},
      {m1: 2},
      {m1: -6},
      {m1: 24},
      {m1: 30},
      {m1: -6},
      {m1: 3},
      {m1: -1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('custom aggregation and optimizations', () => {
    metrics.setMetricDefinition(
      'm1',
      't1',
      (values) => values.reduce((previous, current) => previous * current, 1),
      'c1',
      (metric, add) => metric * add,
      (metric, remove) => metric / remove,
      (metric, add, remove) => (metric * add) / remove,
    );
    setCells();
    store.setCell('t1', 'r4', 'c1', 'd1');
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 6},
      {m1: 24},
      {m1: 30},
      {m1: 6},
      {m1: 3},
      {m1: 1},
      {m1: undefined},
    );
    expectChanges(
      listener,
      '/m*',
      {m1: 1},
      {m1: 2},
      {m1: 6},
      {m1: 24},
      {m1: 30},
      {m1: 6},
      {m1: 3},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
  });

  test('listener stats', () => {
    expect(metrics.getListenerStats().metric).toEqual(2);
  });
});

describe('Miscellaneous', () => {
  test('Listener cannot mutate original store', () => {
    const listener = jest.fn(() => {
      store.setValue('mutated', true);
    });
    metrics.setMetricDefinition('m1', 't1');
    metrics.addMetricListener('m1', listener);
    store.setCell('t1', 'r1', 'c1', 1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(metrics.getMetric('m1')).toEqual(1);
    expect(store.getValues()).toEqual({});
  });

  test('remove listener', () => {
    listener = createMetricsListener(metrics);
    const listenerId = listener.listenToMetric('/m1', 'm1');
    expect(metrics.getListenerStats().metric).toEqual(1);
    expect(listenerId).toEqual('0');
    metrics.setMetricDefinition('m1', 't1');
    setCells();
    delCells();
    expectChanges(
      listener,
      '/m1',
      {m1: 1},
      {m1: 2},
      {m1: 3},
      {m1: 4},
      {m1: 3},
      {m1: 2},
      {m1: 1},
      {m1: undefined},
    );
    expectNoChanges(listener);
    metrics.delListener(listenerId);
    expect(metrics.getListenerStats().metric).toEqual(0);
    setCells();
    delCells();
    expectNoChanges(listener);
  });

  test('forEachMetric', () => {
    metrics
      .setMetricDefinition('m1', 't1', 'max', 'c1')
      .setMetricDefinition('m2', 't1', 'min', 'c1');
    setCells();
    const eachMetric: any = {};
    metrics.forEachMetric(
      (metricId, metric) => (eachMetric[metricId] = metric),
    );
    expect(eachMetric).toEqual({m1: 5, m2: 1});
  });

  test('getMetricIds', () => {
    metrics
      .setMetricDefinition('m1', 't1', 'max', 'c1')
      .setMetricDefinition('m2', 't1', 'min', 'c1');
    setCells();
    expect(metrics.getMetricIds()).toEqual(['m1', 'm2']);
  });

  test('are things present', () => {
    expect(metrics.hasMetric('m1')).toEqual(false);
    metrics.setMetricDefinition('m1', 't1');
    expect(metrics.hasMetric('m1')).toEqual(false);
    setCells();
    expect(metrics.hasMetric('m1')).toEqual(true);
  });

  test('get the tables back out', () => {
    metrics.setMetricDefinition('m1', 't1', 'max', 'c1');
    expect(metrics.getTableId('m1')).toEqual('t1');
  });

  test('creates new metrics against different store', () => {
    const store1 = createStore();
    const store2 = createStore();
    const metrics1 = createMetrics(store1);
    const metrics2 = createMetrics(store2);
    expect(metrics1).not.toBe(metrics2);
  });

  test('re-uses metrics against existing store', () => {
    const store = createStore();
    const metrics1 = createMetrics(store);
    const metrics2 = createMetrics(store);
    expect(metrics1).toBe(metrics2);
  });

  test('getStore', () => {
    expect(metrics.getStore()).toEqual(store);
  });

  test('removes metric definition', () => {
    expect(metrics.getStore().getListenerStats().table).toEqual(0);
    expect(metrics.getStore().getListenerStats().row).toEqual(0);
    metrics.setMetricDefinition('m1', 't1');
    expect(metrics.getStore().getListenerStats().table).toEqual(1);
    expect(metrics.getStore().getListenerStats().row).toEqual(1);
    metrics.delMetricDefinition('m1');
    expect(metrics.getStore().getListenerStats().table).toEqual(0);
    expect(metrics.getStore().getListenerStats().row).toEqual(0);
    setCells();
    expect(metrics.getMetric('m1')).toBeUndefined();
  });

  test('destroys', () => {
    expect(metrics.getStore().getListenerStats().table).toEqual(0);
    expect(metrics.getStore().getListenerStats().row).toEqual(0);
    metrics.setMetricDefinition('m1', 't1');
    expect(metrics.getStore().getListenerStats().table).toEqual(1);
    expect(metrics.getStore().getListenerStats().row).toEqual(1);
    metrics.destroy();
    expect(metrics.getStore().getListenerStats().table).toEqual(0);
    expect(metrics.getStore().getListenerStats().row).toEqual(0);
  });
});
