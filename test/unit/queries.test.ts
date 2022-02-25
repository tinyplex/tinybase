import {
  Queries,
  Store,
  createQueries,
  createStore,
} from '../../lib/debug/tinybase';
import {
  QueriesListener,
  createQueriesListener,
  expectChanges,
  expectNoChanges,
} from './common';

let store: Store;
let queries: Queries;
let listener: QueriesListener;

beforeEach(() => {
  store = createStore();
  queries = createQueries(store);
});

describe('Sets', () => {
  null;
});

describe('Listens to Queries when sets', () => {
  null;
});

describe('Miscellaneous', () => {
  test('remove listener', () => {
    listener = createQueriesListener(queries);
    const listenerId = listener.listenToResultTable('/q1', 'q1');
    expect(queries.getListenerStats().table).toEqual(1);
    expect(listenerId).toEqual('0');
    queries.setQueryDefinition('q1', 't1', () => null);
    expectChanges(listener, '/q1');
    expectNoChanges(listener);
    queries.delListener(listenerId);
    expect(queries.getListenerStats().table).toEqual(0);
    expectNoChanges(listener);
  });

  test('forEachQuery', () => {
    queries
      .setQueryDefinition('q1', 't1', () => null)
      .setQueryDefinition('q2', 't1', () => null);
    const eachQuery: any = {};
    queries.forEachQuery(
      (queryId) => (eachQuery[queryId] = queries.getResultTable(queryId)),
    );
    expect(eachQuery).toEqual({q1: {}, q2: {}});
  });

  test('getQueryIds', () => {
    queries
      .setQueryDefinition('q1', 't1', () => null)
      .setQueryDefinition('q2', 't1', () => null);
    expect(queries.getQueryIds()).toEqual(['q1', 'q2']);
  });

  test('are things present', () => {
    expect(queries.hasQuery('q1')).toEqual(false);
    queries.setQueryDefinition('q1', 't1', () => null);
    expect(queries.hasQuery('q1')).toEqual(true);
  });

  test('get the tables back out', () => {
    queries.setQueryDefinition('q1', 't1', () => null);
    expect(queries.getTableId('q1')).toEqual('t1');
  });

  test('creates new queries against different store', () => {
    const store1 = createStore();
    const store2 = createStore();
    const queries1 = createQueries(store1);
    const queries2 = createQueries(store2);
    expect(queries1).not.toBe(queries2);
  });

  test('reuses queries against existing store', () => {
    const store = createStore();
    const queries1 = createQueries(store);
    const queries2 = createQueries(store);
    expect(queries1).toBe(queries2);
  });

  test('getStore', () => {
    expect(queries.getStore()).toEqual(store);
  });

  test('removes query definition', () => {
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    queries.setQueryDefinition('q1', 't1', () => null);
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    queries.delQueryDefinition('q1');
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    expect(queries.getResultTable('q1')).toEqual({});
  });

  test('destroys', () => {
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    queries.setQueryDefinition('q1', 't1', () => null);
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    queries.destroy();
    expect(queries.getStore().getListenerStats().row).toEqual(0);
  });
});
