import type {
  Checkpoints,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {beforeEach, describe, expect, test, vi} from 'vitest';

export type FunctionRendered = {
  readonly container: HTMLElement;
  readonly rerender: (props: {[key: string]: unknown}) => Promise<void>;
  readonly unmount: () => void;
};

export type FunctionHarness = {
  readonly act: (callback: () => unknown) => Promise<void>;
  readonly render: (
    component: unknown,
    props?: {[key: string]: unknown},
  ) => FunctionRendered;
};

export type FunctionComponents = {
  readonly Callback: unknown;
  readonly Listener: unknown;
  readonly Reader: unknown;
};

const renderReader = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.Reader, {mode, ...props});

const renderListener = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.Listener, {mode, ...props});

const renderCallback = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.Callback, {mode, ...props});

export const testStoreReadFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;

  beforeEach(() => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
  });

  describe(`${framework} store read function scenarios`, () => {
    test('hasTables', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'hasTables',
        {store},
      );
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getTables', async () => {
      const {container, unmount} = renderReader(harness, components, 'tables', {
        store,
      });
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 1}}}),
      );

      await harness.act(() =>
        store.setTables({t1: {r1: {c1: 2}}}).setTables({t1: {r1: {c1: 2}}}),
      );
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 2}}}),
      );

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getTableIds', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'tableIds',
        {store},
      );
      expect(container.textContent).toEqual(JSON.stringify(['t1']));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['t1', 't2']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('[]');

      unmount();
    });

    test('hasTable', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasTable',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getTable', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'table',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual(JSON.stringify({}));

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 2}}));

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 3}}));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getTableCellIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'tableCellIds',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}})
          .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['c2']));

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('hasTableCell', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasTableCell',
        {store, tableId: 't0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1', cellId: 'c1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}})
          .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't1', cellId: 'c2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getRowCount', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'rowCount',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual('0');

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual('1');

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual('2');

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('0');

      unmount();
    });

    test('getRowIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'rowIds',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual(JSON.stringify(['r3', 'r4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getSortedRowIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'sortedRowIds',
        {
          store,
          tableId: 't0',
          cellId: 'c0',
          descending: false,
          offset: 0,
          limit: undefined,
        },
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1', cellId: 'c1', descending: false});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      await rerender({
        tableId: 't2',
        cellId: 'c1',
        descending: true,
        offset: 0,
        limit: 2,
      });
      expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

      await harness.act(() => store.setRow('t2', 'r5', {c1: 5}));
      expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getSortedRowIds defaults', () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'sortedRowIds',
        {store, tableId: 't1', cellId: 'c1'},
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1']));
      unmount();
    });

    test('hasRow', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasRow',
        {store, tableId: 't0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1', rowId: 'r1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't1', rowId: 'r2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getRow', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'row',
        {store, tableId: 't0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify({}));

      await rerender({tableId: 't1', rowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
      );
      expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

      await rerender({tableId: 't1', rowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getCellIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'cellIds',
        {store, tableId: 't0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1', rowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}})
          .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['c2']));

      await rerender({tableId: 't1', rowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('hasCell', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasCell',
        {store, tableId: 't0', rowId: 'r0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2, c2: 2}})
          .setTable('t1', {r1: {c1: 2, c2: 2}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getCell', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'cell',
        {store, tableId: 't0', rowId: 'r0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2, c2: 2}})
          .setTable('t1', {r1: {c1: 2, c2: 2}}),
      );
      expect(container.textContent).toEqual('2');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c2'});
      expect(container.textContent).toEqual('2');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('hasValues', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'hasValues',
        {store},
      );
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getValues', async () => {
      const {container, unmount} = renderReader(harness, components, 'values', {
        store,
      });
      expect(container.textContent).toEqual(JSON.stringify({v1: 1}));

      await harness.act(() => store.setValues({v1: 2}).setValues({v1: 2}));
      expect(container.textContent).toEqual(JSON.stringify({v1: 2}));

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getValueIds', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'valueIds',
        {store},
      );
      expect(container.textContent).toEqual(JSON.stringify(['v1']));

      await harness.act(() =>
        store.setValues({v1: 1, v2: 2}).setValues({v1: 1, v2: 2}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['v1', 'v2']));

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('[]');

      unmount();
    });

    test('hasValue', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasValue',
        {store, valueId: 'v0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({valueId: 'v1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({valueId: 'v2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getValue', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'value',
        {store, valueId: 'v0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({valueId: 'v1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3}),
      );
      expect(container.textContent).toEqual('2');

      await rerender({valueId: 'v2'});
      expect(container.textContent).toEqual('3');

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('context object ids default to empty', () => {
      const modes = [
        'metricsIds',
        'indexesIds',
        'queriesIds',
        'relationshipsIds',
        'checkpointsIds',
        'persisterIds',
        'synchronizerIds',
      ];
      modes.forEach((mode) => {
        const {container, unmount} = renderReader(harness, components, mode);
        expect(container.textContent).toEqual('[]');
        unmount();
      });
    });

    test('getMetricIds', async () => {
      const metrics: Metrics = createMetrics(store);
      const {container, unmount} = renderReader(
        harness,
        components,
        'metricIds',
        {metrics},
      );
      expect(container.textContent).toEqual('[]');

      await harness.act(() =>
        metrics.setMetricDefinition('m1', 't1').setMetricDefinition('m2', 't2'),
      );
      expect(container.textContent).toEqual('["m1","m2"]');

      await harness.act(() => metrics.delMetricDefinition('m1'));
      expect(container.textContent).toEqual('["m2"]');

      unmount();
    });

    test('getMetric', async () => {
      const metrics: Metrics = createMetrics(store)
        .setMetricDefinition('m1', 't1')
        .setMetricDefinition('m2', 't1', 'max', 'c1')
        .setMetricDefinition('m3', 't3');
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'metric',
        {metrics, metricId: 'm0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({metricId: 'm1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store.setCell('t1', 'r2', 'c1', 3).setCell('t1', 'r2', 'c1', 3),
      );
      expect(container.textContent).toEqual('2');

      await rerender({metricId: 'm2'});
      expect(container.textContent).toEqual('3');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('');

      await rerender({metricId: 'm3'});
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('getIndexIds', async () => {
      const indexes: Indexes = createIndexes(store);
      const {container, unmount} = renderReader(
        harness,
        components,
        'indexIds',
        {indexes},
      );
      expect(container.textContent).toEqual('[]');

      await harness.act(() =>
        indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't2'),
      );
      expect(container.textContent).toEqual('["i1","i2"]');

      await harness.act(() => indexes.delIndexDefinition('i1'));
      expect(container.textContent).toEqual('["i2"]');

      unmount();
    });

    test('getSliceIds', async () => {
      const indexes: Indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't1', 'c2')
        .setIndexDefinition('i3', 't3', 'c3');
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'sliceIds',
        {indexes, indexId: 'i0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({indexId: 'i1'});
      expect(container.textContent).toEqual(JSON.stringify(['1']));

      await harness.act(() =>
        store
          .setCell('t1', 'r2', 'c1', 2)
          .setCell('t1', 'r2', 'c1', 2)
          .setCell('t1', 'r2', 'c2', 3),
      );
      expect(container.textContent).toEqual(JSON.stringify(['1', '2']));

      await rerender({indexId: 'i2'});
      expect(container.textContent).toEqual(JSON.stringify(['', '3']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({indexId: 'i3'});
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getSliceRowIds', async () => {
      const indexes: Indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c2');
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'sliceRowIds',
        {indexes, indexId: 'i0', sliceId: '0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({indexId: 'i1', sliceId: '1'});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store
          .setCell('t1', 'r2', 'c1', 1)
          .setCell('t1', 'r2', 'c1', 1)
          .setCell('t1', 'r3', 'c1', 2),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));

      await rerender({indexId: 'i1', sliceId: '2'});
      expect(container.textContent).toEqual(JSON.stringify(['r3']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({indexId: 'i2', sliceId: '2'});
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getRelationshipIds', async () => {
      const relationships: Relationships = createRelationships(store);
      const {container, unmount} = renderReader(
        harness,
        components,
        'relationshipIds',
        {relationships},
      );
      expect(container.textContent).toEqual('[]');

      await harness.act(() =>
        relationships
          .setRelationshipDefinition('r1', 't1', 't2', 'c1')
          .setRelationshipDefinition('r2', 't2', 't2', 'c1'),
      );
      expect(container.textContent).toEqual('["r1","r2"]');

      await harness.act(() => relationships.delRelationshipDefinition('r1'));
      expect(container.textContent).toEqual('["r2"]');

      unmount();
    });

    test('getRemoteRowId', async () => {
      const relationships: Relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'remoteRowId',
        {relationships, relationshipId: 'r0', localRowId: 'r0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({relationshipId: 'r1', localRowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify('1'));

      await harness.act(() =>
        store.setTables({
          t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
          T1: {R1: {C1: 1}, R2: {C1: 2}},
        }),
      );
      expect(container.textContent).toEqual(JSON.stringify('R1'));

      await rerender({relationshipId: 'r1', localRowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify('R2'));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('');

      await rerender({relationshipId: 'r2', localRowId: 'r2'});
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('getLocalRowIds', async () => {
      const relationships: Relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'localRowIds',
        {relationships, relationshipId: 'r0', remoteRowId: 'R0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({relationshipId: 'r1', remoteRowId: 'R1'});
      expect(container.textContent).toEqual(JSON.stringify([]));

      await harness.act(() =>
        store.setTables({
          t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R2'}},
          T1: {R1: {C1: 1}, R2: {C1: 2}},
        }),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));

      await rerender({relationshipId: 'r1', remoteRowId: 'R2'});
      expect(container.textContent).toEqual(JSON.stringify(['r3']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({relationshipId: 'r2', remoteRowId: 'R2'});
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getLinkedRowIds', async () => {
      const relationships: Relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 't1', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'c2');
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'linkedRowIds',
        {relationships, relationshipId: 'r0', firstRowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify(['r0']));

      await rerender({relationshipId: 'r1', firstRowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify(['r1', '1']));

      await harness.act(() =>
        store.setTables({
          t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
        }),
      );
      expect(container.textContent).toEqual(
        JSON.stringify(['r1', 'r2', 'r3', 'r4']),
      );

      await rerender({relationshipId: 'r1', firstRowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify(['r2', 'r3', 'r4']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      await rerender({relationshipId: 'r2', firstRowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      unmount();
    });

    test('getQueryIds', async () => {
      const queries: Queries = createQueries(store);
      const {container, unmount} = renderReader(
        harness,
        components,
        'queryIds',
        {queries},
      );
      expect(container.textContent).toEqual('[]');

      await harness.act(() =>
        queries
          .setQueryDefinition('q1', 't1', () => undefined)
          .setQueryDefinition('q2', 't2', () => undefined),
      );
      expect(container.textContent).toEqual('["q1","q2"]');

      await harness.act(() => queries.delQueryDefinition('q1'));
      expect(container.textContent).toEqual('["q2"]');

      unmount();
    });

    test('getResultTable', async () => {
      const queries: Queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't1', ({select, where}) => {
          select('c1');
          where('c1', 3);
        });
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultTable',
        {queries, queryId: 'q0'},
      );
      expect(container.textContent).toEqual(JSON.stringify({}));

      await rerender({queryId: 'q1'});
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
      );
      expect(container.textContent).toEqual(
        JSON.stringify({r1: {c1: 2}, r2: {c1: 3}}),
      );

      await rerender({queryId: 'q2'});
      expect(container.textContent).toEqual(JSON.stringify({r2: {c1: 3}}));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getResultTableCellIds', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultTableCellIds',
        {queries, queryId: 'q0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({queryId: 'q1'});
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2, c2: 3}}})
          .setTables({t1: {r1: {c1: 2, c2: 3}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['c1', 'c2']));

      unmount();
    });

    test('getResultRowCount', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultRowCount',
        {queries, queryId: 'q0'},
      );
      expect(container.textContent).toEqual('0');

      await rerender({queryId: 'q1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
      );
      expect(container.textContent).toEqual('2');

      unmount();
    });

    test('getResultRowIds', async () => {
      const queries: Queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't1', ({select, where}) => {
          select('c1');
          select('c2');
          where('c1', 3);
        });
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultRowIds',
        {queries, queryId: 'q0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({queryId: 'q1'});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store.setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        }),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2', 'r3']));

      await rerender({queryId: 'q2'});
      expect(container.textContent).toEqual(JSON.stringify(['r2', 'r3']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getResultSortedRowIds', async () => {
      const queries: Queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't1', ({select, where}) => {
          select('c1');
          select('c2');
          where('c1', 3);
        });
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultSortedRowIds',
        {
          queries,
          queryId: 'q0',
          cellId: 'c0',
          descending: false,
          offset: 0,
          limit: undefined,
        },
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({queryId: 'q1', cellId: 'c1', descending: false});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store.setTables({
          t1: {
            r1: {c1: 2},
            r2: {c1: 1},
            r3: {c1: 3, c2: 1},
            r4: {c1: 3, c2: 2},
          },
        }),
      );
      expect(container.textContent).toEqual(
        JSON.stringify(['r2', 'r1', 'r3', 'r4']),
      );

      await rerender({
        queryId: 'q2',
        cellId: 'c2',
        descending: true,
        offset: 0,
        limit: 2,
      });
      expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

      await harness.act(() => store.setRow('t1', 'r5', {c1: 3, c2: 3}));
      expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getResultSortedRowIds defaults', () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const {container, unmount} = renderReader(
        harness,
        components,
        'resultSortedRowIds',
        {queries, queryId: 'q1', cellId: 'c1'},
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1']));
      unmount();
    });

    test('getResultRow', async () => {
      const queries: Queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't1', ({select, where}) => {
          select('c1');
          where('c1', 3);
        });
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultRow',
        {queries, queryId: 'q0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify({}));

      await rerender({queryId: 'q1', rowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

      await rerender({queryId: 'q2', rowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getResultCellIds', async () => {
      const queries: Queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't1', ({select, where}) => {
          select('c1');
          select('c2');
          select('c3');
          where('c1', 3);
        });
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultCellIds',
        {queries, queryId: 'q0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({queryId: 'q1', rowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await rerender({queryId: 'q2', rowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify(['c1', 'c2']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getResultCell', async () => {
      const queries: Queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't1', ({select, where}) => {
          select('c1');
          select('c2');
          where('c1', 3);
        });
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'resultCell',
        {queries, queryId: 'q0', rowId: 'r0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({queryId: 'q1', rowId: 'r1', cellId: 'c1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
          .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}}),
      );
      expect(container.textContent).toEqual('2');

      await rerender({queryId: 'q2', rowId: 'r2', cellId: 'c2'});
      expect(container.textContent).toEqual('4');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('getCheckpointIds', async () => {
      const checkpoints: Checkpoints = createCheckpoints(store);
      const {container, unmount} = renderReader(
        harness,
        components,
        'checkpointIds',
        {checkpoints},
      );
      expect(container.textContent).toEqual(JSON.stringify([[], '0', []]));

      await harness.act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(container.textContent).toEqual(
        JSON.stringify([['0'], undefined, []]),
      );

      await harness.act(() => checkpoints.addCheckpoint());
      expect(container.textContent).toEqual(JSON.stringify([['0'], '1', []]));

      unmount();
    });
  });
};

export const testStoreListenerFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;

  beforeEach(() => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
  });

  describe(`${framework} store listener function scenarios`, () => {
    [
      {
        mode: 'hasTables',
        stats: 'hasTables',
        mutate: () => store.delTables(),
      },
      {
        mode: 'tables',
        stats: 'tables',
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
      {
        mode: 'tableIds',
        stats: 'tableIds',
        mutate: () => store.setCell('t2', 'r1', 'c1', 0),
      },
      {
        mode: 'hasTable',
        stats: 'hasTable',
        props: {tableId: 't1'},
        mutate: () => store.delTable('t1'),
      },
      {
        mode: 'table',
        stats: 'table',
        props: {tableId: 't1'},
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
      {
        mode: 'tableCellIds',
        stats: 'tableCellIds',
        props: {tableId: 't1'},
        mutate: () => store.setCell('t1', 'r1', 'c2', 0),
      },
      {
        mode: 'hasTableCell',
        stats: 'hasTableCell',
        props: {tableId: 't1', cellId: 'c1'},
        mutate: () => store.delCell('t1', 'r1', 'c1'),
      },
      {
        mode: 'rowCount',
        stats: 'rowCount',
        props: {tableId: 't1'},
        mutate: () => store.setCell('t1', 'r2', 'c1', 0),
      },
      {
        mode: 'rowIds',
        stats: 'rowIds',
        props: {tableId: 't1'},
        mutate: () => store.setCell('t1', 'r2', 'c1', 0),
      },
      {
        mode: 'sortedRowIds',
        stats: 'sortedRowIds',
        props: {tableId: 't1', cellId: 'c1'},
        mutate: () => store.setCell('t1', 'r2', 'c1', 0),
      },
      {
        mode: 'hasRow',
        stats: 'hasRow',
        props: {tableId: 't1', rowId: 'r1'},
        mutate: () => store.delRow('t1', 'r1'),
      },
      {
        mode: 'row',
        stats: 'row',
        props: {tableId: 't1', rowId: 'r1'},
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
      {
        mode: 'cellIds',
        stats: 'cellIds',
        props: {tableId: 't1', rowId: 'r1'},
        mutate: () => store.setCell('t1', 'r1', 'c2', 0),
      },
      {
        mode: 'hasCell',
        stats: 'hasCell',
        props: {tableId: 't1', rowId: 'r1', cellId: 'c1'},
        mutate: () => store.delCell('t1', 'r1', 'c1'),
      },
      {
        mode: 'cell',
        stats: 'cell',
        props: {tableId: 't1', rowId: 'r1', cellId: 'c1'},
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
      {
        mode: 'hasValues',
        stats: 'hasValues',
        mutate: () => store.delValues(),
      },
      {
        mode: 'values',
        stats: 'values',
        mutate: () => store.setValue('v1', 2),
      },
      {
        mode: 'valueIds',
        stats: 'valueIds',
        mutate: () => store.setValue('v2', 0),
      },
      {
        mode: 'hasValue',
        stats: 'hasValue',
        props: {valueId: 'v1'},
        mutate: () => store.delValue('v1'),
      },
      {
        mode: 'value',
        stats: 'value',
        props: {valueId: 'v1'},
        mutate: () => store.setValue('v1', 2),
      },
      {
        mode: 'startTransaction',
        stats: 'transaction',
        mutate: () => store.setValue('v1', 2),
      },
      {
        mode: 'willFinishTransaction',
        stats: 'transaction',
        mutate: () => store.setValue('v1', 2),
      },
      {
        mode: 'didFinishTransaction',
        stats: 'transaction',
        mutate: () => store.setValue('v1', 2),
      },
    ].forEach(({mode, stats, props, mutate}) => {
      test(mode, async () => {
        const listener = vi.fn();
        expect(store.getListenerStats()[stats]).toEqual(0);

        const {unmount} = renderListener(harness, components, mode, {
          store,
          listener,
          ...(props ?? {}),
        });
        expect(store.getListenerStats()[stats]).toEqual(1);

        await harness.act(mutate);
        expect(listener).toHaveBeenCalledTimes(1);

        unmount();
        expect(store.getListenerStats()[stats]).toEqual(0);
      });
    });
  });
};

export const testCheckpointCallbackFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;
  let checkpoints: Checkpoints;

  beforeEach(() => {
    store = createStore().setTables({t1: {r1: {c1: 1}}});
    checkpoints = createCheckpoints(store);
    store.setTables({t1: {r1: {c1: 2}}});
    checkpoints.addCheckpoint();
    store.setTables({t1: {r1: {c1: 3}}});
    checkpoints.addCheckpoint();
  });

  describe(`${framework} checkpoint callback scenarios`, () => {
    test('goBackward', async () => {
      const {container, unmount} = renderCallback(
        harness,
        components,
        'goBackward',
        {checkpoints},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1', '2']]);

      unmount();
    });

    test('goForward', async () => {
      const {container, unmount} = renderCallback(
        harness,
        components,
        'goForward',
        {checkpoints},
      );

      checkpoints.goTo('0');

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      unmount();
    });
  });
};
