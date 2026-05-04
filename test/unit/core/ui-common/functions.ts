import type {
  Cell,
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
import {createMergeableStore} from 'tinybase/mergeable-store';
import {createSessionPersister} from 'tinybase/persisters/persister-browser';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
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
    props: {[key: string]: unknown},
  ) => FunctionRendered;
};

export type FunctionComponents = {
  readonly Callback: unknown;
  readonly CheckpointInfo?: unknown;
  readonly Listener: unknown;
  readonly Reader: unknown;
  readonly State?: unknown;
  readonly Writer?: unknown;
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

const renderCheckpointInfo = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.CheckpointInfo, {mode, ...props});

const renderState = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.State, {mode, ...props});

const renderWriter = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.Writer, {mode, ...props});

export const testStateFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;
  let queries: Queries;

  beforeEach(() => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
    queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as Cell);
      },
      {p1: 1},
    );
  });

  describe(`${framework} state function scenarios`, () => {
    [
      {
        mode: 'tablesState',
        before: {t1: {r1: {c1: 1}}},
        after: {t1: {r1: {c1: 2}}},
        getProps: () => ({store}),
        assert: () => expect(store.getCell('t1', 'r1', 'c1')).toEqual(2),
      },
      {
        mode: 'tableState',
        before: {r1: {c1: 1}},
        after: {r1: {c1: 2}},
        getProps: () => ({store}),
        assert: () => expect(store.getCell('t1', 'r1', 'c1')).toEqual(2),
      },
      {
        mode: 'rowState',
        before: {c1: 1},
        after: {c1: 2},
        getProps: () => ({store}),
        assert: () => expect(store.getRow('t1', 'r1')).toEqual({c1: 2}),
      },
      {
        mode: 'cellState',
        before: 1,
        after: 2,
        getProps: () => ({store}),
        assert: () => expect(store.getCell('t1', 'r1', 'c1')).toEqual(2),
      },
      {
        mode: 'valuesState',
        before: {v1: 1},
        after: {v1: 2},
        getProps: () => ({store}),
        assert: () => expect(store.getValue('v1')).toEqual(2),
      },
      {
        mode: 'valueState',
        before: 1,
        after: 2,
        getProps: () => ({store}),
        assert: () => expect(store.getValue('v1')).toEqual(2),
      },
      {
        mode: 'paramValuesState',
        before: {p1: 1},
        after: {p1: 2},
        getProps: () => ({queries}),
        assert: () => expect(queries.getParamValue('q1', 'p1')).toEqual(2),
      },
      {
        mode: 'paramValueState',
        before: 1,
        after: 2,
        getProps: () => ({queries}),
        assert: () => expect(queries.getParamValue('q1', 'p1')).toEqual(2),
      },
    ].forEach(({mode, before, after, getProps, assert}) => {
      test(mode, async () => {
        const {container, unmount} = renderState(
          harness,
          components,
          mode,
          getProps(),
        );
        expect(container.textContent).toEqual(JSON.stringify(before) + 'Set');

        await harness.act(() =>
          container.querySelector<HTMLButtonElement>('button')?.click(),
        );
        expect(container.textContent).toEqual(JSON.stringify(after) + 'Set');
        assert();

        unmount();
      });
    });
  });
};

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
        const statsKey = stats as keyof ReturnType<Store['getListenerStats']>;
        expect(store.getListenerStats()[statsKey]).toEqual(0);

        const {unmount} = renderListener(harness, components, mode, {
          store,
          listener,
          ...(props ?? {}),
        });
        expect(store.getListenerStats()[statsKey]).toEqual(1);

        await harness.act(mutate);
        expect(listener).toHaveBeenCalledTimes(1);

        unmount();
        expect(store.getListenerStats()[statsKey]).toEqual(0);
      });
    });

    test('metric', async () => {
      const metrics: Metrics = createMetrics(store).setMetricDefinition(
        'm1',
        't1',
        'max',
        'c1',
      );
      const listener = vi.fn();
      expect(metrics.getListenerStats().metric).toEqual(0);

      const {unmount} = renderListener(harness, components, 'metric', {
        metrics,
        metricId: 'm1',
        listener,
      });
      expect(metrics.getListenerStats().metric).toEqual(1);

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(metrics.getListenerStats().metric).toEqual(0);
    });

    test('sliceIds', async () => {
      const indexes: Indexes = createIndexes(store).setIndexDefinition(
        'i1',
        't1',
        'c1',
      );
      const listener = vi.fn();
      expect(indexes.getListenerStats().sliceIds).toEqual(0);

      const {unmount} = renderListener(harness, components, 'sliceIds', {
        indexes,
        indexId: 'i1',
        listener,
      });
      expect(indexes.getListenerStats().sliceIds).toEqual(1);

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 'a'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(indexes.getListenerStats().sliceIds).toEqual(0);
    });

    test('sliceRowIds', async () => {
      const indexes: Indexes = createIndexes(store).setIndexDefinition(
        'i1',
        't1',
        'c1',
      );
      const listener = vi.fn();
      expect(indexes.getListenerStats().sliceRowIds).toEqual(0);

      const {unmount} = renderListener(harness, components, 'sliceRowIds', {
        indexes,
        indexId: 'i1',
        sliceId: 'a',
        listener,
      });
      expect(indexes.getListenerStats().sliceRowIds).toEqual(1);

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 'a'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
    });

    test('remoteRowId', async () => {
      const relationships: Relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const listener = vi.fn();
      expect(relationships.getListenerStats().remoteRowId).toEqual(0);

      const {unmount} = renderListener(harness, components, 'remoteRowId', {
        relationships,
        relationshipId: 'r1',
        localRowId: 'r1',
        listener,
      });
      expect(relationships.getListenerStats().remoteRowId).toEqual(1);

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(relationships.getListenerStats().remoteRowId).toEqual(0);
    });

    test('localRowIds', async () => {
      const relationships: Relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const listener = vi.fn();
      expect(relationships.getListenerStats().localRowIds).toEqual(0);

      const {unmount} = renderListener(harness, components, 'localRowIds', {
        relationships,
        relationshipId: 'r1',
        remoteRowId: 'R1',
        listener,
      });
      expect(relationships.getListenerStats().localRowIds).toEqual(1);

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(relationships.getListenerStats().localRowIds).toEqual(0);
    });

    test('linkedRowIds', async () => {
      const relationships: Relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 't1', 'c1');
      const listener = vi.fn();
      expect(relationships.getListenerStats().linkedRowIds).toEqual(0);

      const {unmount} = renderListener(harness, components, 'linkedRowIds', {
        relationships,
        relationshipId: 'r1',
        firstRowId: 'r1',
        listener,
      });
      expect(relationships.getListenerStats().linkedRowIds).toEqual(1);

      await harness.act(() =>
        store.setTables({t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}}}),
      );
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(relationships.getListenerStats().linkedRowIds).toEqual(0);
    });

    [
      {
        mode: 'resultTable',
        stats: 'table',
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
      {
        mode: 'resultTableCellIds',
        stats: 'tableCellIds',
        mutate: () => store.setCell('t1', 'r1', 'c2', 0),
      },
      {
        mode: 'resultRowCount',
        stats: 'rowCount',
        mutate: () => store.setCell('t1', 'r2', 'c1', 0),
      },
      {
        mode: 'resultRowIds',
        stats: 'rowIds',
        mutate: () => store.setCell('t1', 'r2', 'c1', 0),
      },
      {
        mode: 'resultSortedRowIds',
        stats: 'sortedRowIds',
        props: {cellId: 'c1'},
        mutate: () => store.setCell('t1', 'r2', 'c1', 0),
      },
      {
        mode: 'resultRow',
        stats: 'row',
        props: {rowId: 'r1'},
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
      {
        mode: 'resultCellIds',
        stats: 'cellIds',
        props: {rowId: 'r1'},
        mutate: () => store.setCell('t1', 'r1', 'c2', 0),
      },
      {
        mode: 'resultCell',
        stats: 'cell',
        props: {rowId: 'r1', cellId: 'c1'},
        mutate: () => store.setCell('t1', 'r1', 'c1', 2),
      },
    ].forEach(({mode, stats, props, mutate}) => {
      test(mode, async () => {
        const queries: Queries = createQueries(store).setQueryDefinition(
          'q1',
          't1',
          ({select}) => {
            select('c1');
            select('c2');
          },
        );
        const listener = vi.fn();
        const statsKey = stats as keyof ReturnType<Queries['getListenerStats']>;
        expect(queries.getListenerStats()[statsKey]).toEqual(0);

        const {unmount} = renderListener(harness, components, mode, {
          queries,
          queryId: 'q1',
          listener,
          ...(props ?? {}),
        });
        expect(queries.getListenerStats()[statsKey]).toEqual(1);

        await harness.act(mutate);
        expect(listener).toHaveBeenCalledTimes(1);

        unmount();
        expect(queries.getListenerStats()[statsKey]).toEqual(0);
      });
    });

    test('paramValues', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1},
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().paramValues).toEqual(0);

      const {unmount} = renderListener(harness, components, 'paramValues', {
        queries,
        queryId: 'q1',
        listener,
      });
      expect(queries.getListenerStats().paramValues).toEqual(1);

      await harness.act(() => queries.setParamValue('q1', 'p1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().paramValues).toEqual(0);
    });

    test('paramValue', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1},
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().paramValue).toEqual(0);

      const {unmount} = renderListener(harness, components, 'paramValue', {
        queries,
        queryId: 'q1',
        paramId: 'p1',
        listener,
      });
      expect(queries.getListenerStats().paramValue).toEqual(1);

      await harness.act(() => queries.setParamValue('q1', 'p1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().paramValue).toEqual(0);
    });

    test('checkpointIds', async () => {
      const checkpoints: Checkpoints = createCheckpoints(store);
      const listener = vi.fn();
      expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);

      const {unmount} = renderListener(harness, components, 'checkpointIds', {
        checkpoints,
        listener,
      });
      expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
    });

    test('checkpoint', async () => {
      const checkpoints: Checkpoints = createCheckpoints(store);
      const listener = vi.fn();
      expect(checkpoints.getListenerStats().checkpoint).toEqual(0);

      const {unmount} = renderListener(harness, components, 'checkpoint', {
        checkpoints,
        checkpointId: '0',
        listener,
      });
      expect(checkpoints.getListenerStats().checkpoint).toEqual(1);

      await harness.act(() => checkpoints.setCheckpoint('0', 'c1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
    });

    test('persisterStatus', async () => {
      const persister = createSessionPersister(
        store,
        `test-${framework}-listener`,
      );
      const listener = vi.fn();

      const {unmount} = renderListener(harness, components, 'persisterStatus', {
        persister,
        listener,
      });

      await harness.act(() => persister.save());
      expect(listener).toHaveBeenCalled();

      unmount();
      persister.destroy();
    });

    test('synchronizerStatus', async () => {
      const mergeableStore = createMergeableStore();
      const synchronizer = createLocalSynchronizer(mergeableStore);
      const listener = vi.fn();

      const {unmount} = renderListener(
        harness,
        components,
        'synchronizerStatus',
        {synchronizer, listener},
      );

      await harness.act(() => synchronizer.save());
      expect(listener).toHaveBeenCalled();

      unmount();
      synchronizer.destroy();
    });
  });
};

export const testStoreListenerOverloadFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;
  let queries: Queries;

  beforeEach(() => {
    store = createStore().setTables({
      t1: {r1: {c1: 1}, r2: {c1: 2}},
    });
    queries = createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
      select('c1'),
    );
  });

  describe(`${framework} listener overload function scenarios`, () => {
    test('sortedRowIds object args', async () => {
      const listener = vi.fn();
      const {unmount} = renderListener(
        harness,
        components,
        'sortedRowIdsObject',
        {store, listener},
      );

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 3));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('sortedRowIds defaults', async () => {
      const listener = vi.fn();
      const {unmount} = renderListener(
        harness,
        components,
        'sortedRowIdsDefaults',
        {store, listener},
      );

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 3));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('resultSortedRowIds defaults', async () => {
      const listener = vi.fn();
      const {unmount} = renderListener(
        harness,
        components,
        'resultSortedRowIdsDefaults',
        {queries, listener},
      );

      await harness.act(() => store.setCell('t1', 'r1', 'c1', 3));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
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

export const testCheckpointInformationFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;
  let checkpoints: Checkpoints;

  beforeEach(() => {
    store = createStore().setTables({t1: {r1: {c1: 1}}});
    checkpoints = createCheckpoints(store);
    store.setCell('t1', 'r1', 'c1', 2);
    checkpoints.addCheckpoint('first');
    store.setCell('t1', 'r1', 'c1', 3);
    checkpoints.addCheckpoint('second');
  });

  describe(`${framework} checkpoint information scenarios`, () => {
    test('undoInformation', async () => {
      const {container, unmount} = renderCheckpointInfo(
        harness,
        components,
        'undoInformation',
        {checkpoints},
      );
      expect(container.textContent).toEqual(
        JSON.stringify([true, '2', 'second']),
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      unmount();
    });

    test('redoInformation', async () => {
      checkpoints.goTo('0');
      const {container, unmount} = renderCheckpointInfo(
        harness,
        components,
        'redoInformation',
        {checkpoints},
      );
      expect(container.textContent).toEqual(
        JSON.stringify([true, '1', 'first']),
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      unmount();
    });

    test('information label fallbacks', () => {
      const emptyCheckpoints = createCheckpoints(createStore());
      const {container, unmount} = renderCheckpointInfo(
        harness,
        components,
        'undoInformation',
        {checkpoints: emptyCheckpoints},
      );
      expect(container.textContent).toEqual(JSON.stringify([false, '0', '']));
      unmount();
    });
  });
};

export const testWriteCallbackFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;
  let queries: Queries;
  let checkpoints: Checkpoints;

  beforeEach(() => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
    queries = createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
      select('c1'),
    );
    checkpoints = createCheckpoints(store);
  });

  describe(`${framework} write callback scenarios`, () => {
    test('setRow', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(harness, components, 'setRow', {
        store,
        then,
      });

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getRow('t1', 'r1')).toEqual({c1: 2});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setTables', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setTables',
        {store, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setTable', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setTable',
        {store, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getTable('t1')).toEqual({r1: {c1: 2}});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('addRow', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(harness, components, 'addRow', {
        store,
        then,
      });

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getRow('t1', '0')).toEqual({c1: 3});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setCell', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setCell',
        {
          store,
          then,
        },
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('changed');
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setPartialRow', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setPartialRow',
        {store, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getRow('t1', 'r1')).toEqual({c1: 1, c2: 2});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('delCell', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'delCell',
        {
          store,
          then,
        },
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setValues', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setValues',
        {store, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getValues()).toEqual({v1: 4});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setPartialValues', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setPartialValues',
        {store, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getValues()).toEqual({v1: 1, v2: 2});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setValue', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setValue',
        {store, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(store.getValue('v1')).toEqual(2);
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setParamValue', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setParamValue',
        {queries, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(queries.getParamValue('q1', 'p1')).toEqual('value');
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setParamValues', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setParamValues',
        {queries, then},
      );

      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(queries.getParamValues('q1')).toEqual({p1: 'value'});
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('setCheckpoint', async () => {
      const then = vi.fn();
      const {container, unmount} = renderWriter(
        harness,
        components,
        'setCheckpoint',
        {checkpoints, then},
      );

      store.setCell('t1', 'r1', 'c1', 2);
      await harness.act(() =>
        container.querySelector<HTMLButtonElement>('button')?.click(),
      );
      expect(checkpoints.getCheckpoint('1')).toEqual('label');
      expect(then).toHaveBeenCalledTimes(1);

      unmount();
    });

    [
      {
        mode: 'delRow',
        assert: () => expect(store.hasRow('t1', 'r1')).toBe(false),
      },
      {
        mode: 'delTable',
        assert: () => expect(store.hasTable('t1')).toBe(false),
      },
      {
        mode: 'delTables',
        assert: () => expect(store.hasTables()).toBe(false),
      },
      {
        mode: 'delValue',
        assert: () => expect(store.hasValue('v1')).toBe(false),
      },
      {
        mode: 'delValues',
        assert: () => expect(store.hasValues()).toBe(false),
      },
    ].forEach(({mode, assert}) => {
      test(mode, async () => {
        const then = vi.fn();
        const {container, unmount} = renderWriter(harness, components, mode, {
          store,
          then,
        });

        await harness.act(() =>
          container.querySelector<HTMLButtonElement>('button')?.click(),
        );
        assert();
        expect(then).toHaveBeenCalledTimes(1);

        unmount();
      });
    });
  });
};
