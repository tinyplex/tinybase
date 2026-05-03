/* eslint-disable react-hooks/rules-of-hooks */
import type {Accessor, JSXElement, Setter} from 'solid-js';
import {createRoot, createSignal} from 'solid-js';
import {render as solidRender} from 'solid-js/web';
import type {
  Checkpoints,
  Id,
  Indexes,
  MergeableStore,
  Metrics,
  Queries,
  Relationships,
  Store,
  Table,
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
import type {Persister, Persists} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {
  useAddRowCallback,
  useCell,
  useCellIds,
  useCellIdsListener,
  useCellListener,
  useCheckpoint,
  useCheckpointIds,
  useCheckpointIdsListener,
  useCheckpointListener,
  useCheckpointsIds,
  useCreatePersister,
  useCreateSynchronizer,
  useDelCellCallback,
  useDidFinishTransactionListener,
  useGoBackwardCallback,
  useGoForwardCallback,
  useHasCell,
  useHasCellListener,
  useHasRow,
  useHasRowListener,
  useHasTable,
  useHasTableCell,
  useHasTableCellListener,
  useHasTableListener,
  useHasTables,
  useHasTablesListener,
  useHasValue,
  useHasValueListener,
  useHasValues,
  useHasValuesListener,
  useIndexIds,
  useIndexesIds,
  useLinkedRowIds,
  useLinkedRowIdsListener,
  useLocalRowIds,
  useLocalRowIdsListener,
  useMetric,
  useMetricIds,
  useMetricListener,
  useMetricsIds,
  useParamValue,
  useParamValueListener,
  useParamValues,
  useParamValuesListener,
  usePersisterIds,
  usePersisterStatusListener,
  useQueriesIds,
  useQueryIds,
  useRelationshipIds,
  useRelationshipsIds,
  useRemoteRowId,
  useRemoteRowIdListener,
  useResultCell,
  useResultCellIds,
  useResultCellIdsListener,
  useResultCellListener,
  useResultRow,
  useResultRowCount,
  useResultRowCountListener,
  useResultRowIds,
  useResultRowIdsListener,
  useResultRowListener,
  useResultSortedRowIds,
  useResultSortedRowIdsListener,
  useResultTable,
  useResultTableCellIds,
  useResultTableCellIdsListener,
  useResultTableListener,
  useRow,
  useRowCount,
  useRowCountListener,
  useRowIds,
  useRowIdsListener,
  useRowListener,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetParamValueCallback,
  useSetRowCallback,
  useSetValuesCallback,
  useSliceIds,
  useSliceIdsListener,
  useSliceRowIds,
  useSliceRowIdsListener,
  useSortedRowIds,
  useSortedRowIdsListener,
  useStartTransactionListener,
  useSynchronizerIds,
  useSynchronizerStatusListener,
  useTable,
  useTableCellIds,
  useTableCellIdsListener,
  useTableIds,
  useTableIdsListener,
  useTableListener,
  useTables,
  useTablesListener,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValues,
  useValuesListener,
  useWillFinishTransactionListener,
} from 'tinybase/ui-solid';
import {describe, expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';
import {
  testCheckpointCallbackFunctions,
  testStoreListenerFunctions,
  testStoreReadFunctions,
  testWriteCallbackFunctions,
} from '../ui-common/functions.ts';
import {testContextPrimitives} from '../ui-common/primitives.ts';
import {ContextPrimitiveNoContext} from './components/ContextPrimitiveNoContext.tsx';
import {ContextPrimitiveThings} from './components/ContextPrimitiveThings.tsx';

type TestPersister = Persister<Persists.StoreOnly> & {destroy: () => void};
type TestSynchronizer = Synchronizer & {destroy: () => void};

const createTestPersister = () =>
  ({destroy: vi.fn()}) as unknown as TestPersister;

const createTestSynchronizer = () =>
  ({destroy: vi.fn()}) as unknown as TestSynchronizer;

const renderPrimitive = (primitive: () => void) => {
  return createRoot((dispose) => {
    primitive();
    return dispose;
  });
};

type Props = {[key: string]: unknown};
type SolidComponent = (props: Props) => JSXElement;

const primitiveHarness = {
  act: async (callback: () => unknown) => {
    callback();
    await pause();
  },
  render: (component: unknown, props: Props = {}) => {
    const container = document.createElement('div');
    let currentProps = props;
    const Component = component as SolidComponent;
    let unmount = solidRender(() => Component(currentProps), container);
    return {
      container,
      rerender: async (nextProps: Props) => {
        unmount();
        currentProps = {...currentProps, ...nextProps};
        unmount = solidRender(() => Component(currentProps), container);
        await pause();
      },
      unmount: () => unmount(),
    };
  },
};

const Reader = ({
  mode,
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  tableId,
  rowId,
  cellId,
  valueId,
  metricId,
  indexId,
  sliceId,
  relationshipId,
  localRowId,
  remoteRowId,
  firstRowId,
  queryId,
  descending,
  offset,
  limit,
}: {
  readonly mode: string;
  readonly store: Store;
  readonly metrics?: Metrics;
  readonly indexes?: Indexes;
  readonly relationships?: Relationships;
  readonly queries?: Queries;
  readonly checkpoints?: Checkpoints;
  readonly persister?: Persister<Persists.StoreOnly>;
  readonly synchronizer?: Synchronizer;
  readonly persister?: Persister<Persists.StoreOnly>;
  readonly synchronizer?: Synchronizer;
  readonly tableId?: Id;
  readonly rowId?: Id;
  readonly cellId?: Id;
  readonly valueId?: Id;
  readonly metricId?: Id;
  readonly indexId?: Id;
  readonly sliceId?: Id;
  readonly relationshipId?: Id;
  readonly localRowId?: Id;
  readonly remoteRowId?: Id;
  readonly firstRowId?: Id;
  readonly queryId?: Id;
  readonly descending?: boolean;
  readonly offset?: number;
  readonly limit?: number;
}) => {
  const hasTables = useHasTables(store);
  const tables = useTables(store);
  const tableIds = useTableIds(store);
  const hasTable = useHasTable(() => tableId, store);
  const table = useTable(() => tableId, store);
  const tableCellIds = useTableCellIds(() => tableId, store);
  const hasTableCell = useHasTableCell(
    () => tableId,
    () => cellId,
    store,
  );
  const rowCount = useRowCount(() => tableId, store);
  const rowIds = useRowIds(() => tableId, store);
  const sortedRowIds = useSortedRowIds(
    () => tableId,
    () => cellId,
    () => descending,
    () => offset,
    () => limit,
    store,
  );
  const hasRow = useHasRow(
    () => tableId,
    () => rowId,
    store,
  );
  const row = useRow(
    () => tableId,
    () => rowId,
    store,
  );
  const cellIds = useCellIds(
    () => tableId,
    () => rowId,
    store,
  );
  const hasCell = useHasCell(
    () => tableId,
    () => rowId,
    () => cellId,
    store,
  );
  const cell = useCell(
    () => tableId,
    () => rowId,
    () => cellId,
    store,
  );
  const hasValues = useHasValues(store);
  const values = useValues(store);
  const valueIds = useValueIds(store);
  const hasValue = useHasValue(() => valueId, store);
  const storeValue = useValue(() => valueId, store);
  const metricsIds = useMetricsIds();
  const indexesIds = useIndexesIds();
  const queriesIds = useQueriesIds();
  const relationshipsIds = useRelationshipsIds();
  const checkpointsIds = useCheckpointsIds();
  const persisterIds = usePersisterIds();
  const synchronizerIds = useSynchronizerIds();
  const metricIds = useMetricIds(metrics);
  const metric = useMetric(() => metricId, metrics);
  const indexIds = useIndexIds(indexes);
  const sliceIds = useSliceIds(() => indexId, indexes);
  const sliceRowIds = useSliceRowIds(
    () => indexId,
    () => sliceId,
    indexes,
  );
  const relationshipIds = useRelationshipIds(relationships);
  const remoteRowIdResult = useRemoteRowId(
    () => relationshipId,
    () => localRowId,
    relationships,
  );
  const localRowIds = useLocalRowIds(
    () => relationshipId,
    () => remoteRowId,
    relationships,
  );
  const linkedRowIds = useLinkedRowIds(
    () => relationshipId,
    () => firstRowId,
    relationships,
  );
  const queryIds = useQueryIds(queries);
  const resultTable = useResultTable(() => queryId, queries);
  const resultTableCellIds = useResultTableCellIds(() => queryId, queries);
  const resultRowCount = useResultRowCount(() => queryId, queries);
  const resultRowIds = useResultRowIds(() => queryId, queries);
  const resultSortedRowIds = useResultSortedRowIds(
    () => queryId,
    () => cellId,
    () => descending,
    () => offset,
    () => limit,
    queries,
  );
  const resultRow = useResultRow(
    () => queryId,
    () => rowId,
    queries,
  );
  const resultCellIds = useResultCellIds(
    () => queryId,
    () => rowId,
    queries,
  );
  const resultCell = useResultCell(
    () => queryId,
    () => rowId,
    () => cellId,
    queries,
  );
  const checkpointIds = useCheckpointIds(checkpoints);
  const valuesByMode: {[mode: string]: Accessor<unknown>} = {
    hasTables,
    tables,
    tableIds,
    hasTable,
    table,
    tableCellIds,
    hasTableCell,
    rowCount,
    rowIds,
    sortedRowIds,
    hasRow,
    row,
    cellIds,
    hasCell,
    cell,
    hasValues,
    values,
    valueIds,
    hasValue,
    value: storeValue,
    metricsIds,
    indexesIds,
    queriesIds,
    relationshipsIds,
    checkpointsIds,
    persisterIds,
    synchronizerIds,
    metricIds,
    metric,
    indexIds,
    sliceIds,
    sliceRowIds,
    relationshipIds,
    remoteRowId: remoteRowIdResult,
    localRowIds,
    linkedRowIds,
    queryIds,
    resultTable,
    resultTableCellIds,
    resultRowCount,
    resultRowIds,
    resultSortedRowIds,
    resultRow,
    resultCellIds,
    resultCell,
    checkpointIds,
  };
  return (() =>
    JSON.stringify(valuesByMode[mode]?.())) as unknown as JSXElement;
};

const Listener = ({
  mode,
  store,
  listener,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
  tableId,
  rowId,
  cellId,
  valueId,
  metricId,
  indexId,
  sliceId,
  relationshipId,
  localRowId,
  remoteRowId,
  firstRowId,
  queryId,
  paramId,
  checkpointId,
}: {
  readonly mode: string;
  readonly store: Store;
  readonly listener: any;
  readonly metrics?: Metrics;
  readonly indexes?: Indexes;
  readonly relationships?: Relationships;
  readonly queries?: Queries;
  readonly checkpoints?: Checkpoints;
  readonly persister?: Persister<Persists.StoreOnly>;
  readonly synchronizer?: Synchronizer;
  readonly tableId?: Id;
  readonly rowId?: Id;
  readonly cellId?: Id;
  readonly valueId?: Id;
  readonly metricId?: Id;
  readonly indexId?: Id;
  readonly sliceId?: Id;
  readonly relationshipId?: Id;
  readonly localRowId?: Id;
  readonly remoteRowId?: Id;
  readonly firstRowId?: Id;
  readonly queryId?: Id;
  readonly paramId?: Id;
  readonly checkpointId?: Id;
}) => {
  switch (mode) {
    case 'hasTables':
      useHasTablesListener(listener, false, store);
      break;
    case 'tables':
      useTablesListener(listener, false, store);
      break;
    case 'tableIds':
      useTableIdsListener(listener, false, store);
      break;
    case 'hasTable':
      useHasTableListener(tableId, listener, false, store);
      break;
    case 'table':
      useTableListener(tableId, listener, false, store);
      break;
    case 'tableCellIds':
      useTableCellIdsListener(tableId, listener, false, store);
      break;
    case 'hasTableCell':
      useHasTableCellListener(tableId, cellId, listener, false, store);
      break;
    case 'rowCount':
      useRowCountListener(tableId, listener, false, store);
      break;
    case 'rowIds':
      useRowIdsListener(tableId, listener, false, store);
      break;
    case 'sortedRowIds':
      useSortedRowIdsListener(
        tableId ?? '',
        cellId,
        false,
        0,
        undefined,
        listener,
        false,
        store,
      );
      break;
    case 'hasRow':
      useHasRowListener(tableId, rowId, listener, false, store);
      break;
    case 'row':
      useRowListener(tableId, rowId, listener, false, store);
      break;
    case 'cellIds':
      useCellIdsListener(tableId, rowId, listener, false, store);
      break;
    case 'hasCell':
      useHasCellListener(tableId, rowId, cellId, listener, false, store);
      break;
    case 'cell':
      useCellListener(tableId, rowId, cellId, listener, false, store);
      break;
    case 'hasValues':
      useHasValuesListener(listener, false, store);
      break;
    case 'values':
      useValuesListener(listener, false, store);
      break;
    case 'valueIds':
      useValueIdsListener(listener, false, store);
      break;
    case 'hasValue':
      useHasValueListener(valueId, listener, false, store);
      break;
    case 'value':
      useValueListener(valueId, listener, false, store);
      break;
    case 'startTransaction':
      useStartTransactionListener(listener, store);
      break;
    case 'willFinishTransaction':
      useWillFinishTransactionListener(listener, store);
      break;
    case 'didFinishTransaction':
      useDidFinishTransactionListener(listener, store);
      break;
    case 'metric':
      useMetricListener(metricId, listener, metrics);
      break;
    case 'sliceIds':
      useSliceIdsListener(indexId, listener, indexes);
      break;
    case 'sliceRowIds':
      useSliceRowIdsListener(indexId, sliceId, listener, indexes);
      break;
    case 'remoteRowId':
      useRemoteRowIdListener(
        relationshipId,
        localRowId,
        listener,
        relationships,
      );
      break;
    case 'localRowIds':
      useLocalRowIdsListener(
        relationshipId,
        remoteRowId,
        listener,
        relationships,
      );
      break;
    case 'linkedRowIds':
      useLinkedRowIdsListener(
        relationshipId ?? '',
        firstRowId ?? '',
        listener,
        relationships,
      );
      break;
    case 'resultTable':
      useResultTableListener(queryId, listener, queries);
      break;
    case 'resultTableCellIds':
      useResultTableCellIdsListener(queryId, listener, queries);
      break;
    case 'resultRowCount':
      useResultRowCountListener(queryId, listener, queries);
      break;
    case 'resultRowIds':
      useResultRowIdsListener(queryId, listener, queries);
      break;
    case 'resultSortedRowIds':
      useResultSortedRowIdsListener(
        queryId ?? '',
        cellId,
        false,
        0,
        undefined,
        listener,
        queries,
      );
      break;
    case 'resultRow':
      useResultRowListener(queryId, rowId, listener, queries);
      break;
    case 'resultCellIds':
      useResultCellIdsListener(queryId, rowId, listener, queries);
      break;
    case 'resultCell':
      useResultCellListener(queryId, rowId, cellId, listener, queries);
      break;
    case 'paramValues':
      useParamValuesListener(queryId, listener, queries);
      break;
    case 'paramValue':
      useParamValueListener(queryId, paramId, listener, queries);
      break;
    case 'checkpointIds':
      useCheckpointIdsListener(listener, checkpoints);
      break;
    case 'checkpoint':
      useCheckpointListener(checkpointId, listener, checkpoints);
      break;
    case 'persisterStatus':
      usePersisterStatusListener(listener, persister);
      break;
    case 'synchronizerStatus':
      useSynchronizerStatusListener(listener, synchronizer);
      break;
  }
  return null as unknown as JSXElement;
};

const Callback = ({
  mode,
  checkpoints,
}: {
  readonly mode: string;
  readonly checkpoints: Checkpoints;
}) => {
  const goBackward = useGoBackwardCallback(checkpoints);
  const goForward = useGoForwardCallback(checkpoints);
  return (() => {
    const button = document.createElement('button');
    button.textContent = 'Go';
    button.addEventListener(
      'click',
      mode == 'goBackward' ? goBackward : goForward,
    );
    return button;
  }) as unknown as JSXElement;
};

const Writer = ({
  mode,
  store,
  queries,
  checkpoints,
  then,
}: {
  readonly mode: string;
  readonly store?: Store;
  readonly queries?: Queries;
  readonly checkpoints?: Checkpoints;
  readonly then: any;
}) => {
  const setRow = useSetRowCallback('t1', 'r1', () => ({c1: 2}), store, then);
  const addRow = useAddRowCallback('t1', () => ({c1: 3}), store, then);
  const setCell = useSetCellCallback(
    't1',
    'r1',
    'c1',
    () => 'changed',
    store,
    then,
  );
  const delCell = useDelCellCallback('t1', 'r1', 'c1', true, store, then);
  const setValues = useSetValuesCallback(() => ({v1: 4}), store, then);
  const setParamValue = useSetParamValueCallback(
    'q1',
    'p1',
    () => 'value',
    queries,
    then,
  );
  const setCheckpoint = useSetCheckpointCallback(
    () => 'label',
    checkpoints,
    then,
  );
  return (() => {
    const button = document.createElement('button');
    const handlers: {[mode: string]: EventListener} = {
      setRow,
      addRow,
      setCell,
      delCell,
      setValues,
      setParamValue,
      setCheckpoint,
    };
    button.addEventListener('click', handlers[mode]);
    return button;
  }) as unknown as JSXElement;
};

testContextPrimitives('ui-solid', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});

testStoreReadFunctions('ui-solid', primitiveHarness, {
  Callback,
  Listener,
  Reader,
  Writer,
});
testStoreListenerFunctions('ui-solid', primitiveHarness, {
  Callback,
  Listener,
  Reader,
  Writer,
});
testCheckpointCallbackFunctions('ui-solid', primitiveHarness, {
  Callback,
  Listener,
  Reader,
  Writer,
});
testWriteCallbackFunctions('ui-solid', primitiveHarness, {
  Callback,
  Listener,
  Reader,
  Writer,
});

describe('Solid-specific', () => {
  test('reads core store primitives', async () => {
    const store = createStore()
      .setTables({t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3}}})
      .setValues({v1: 4});
    let values: {
      hasTables: Accessor<boolean>;
      tables: Accessor<ReturnType<Store['getTables']>>;
      tableIds: Accessor<string[]>;
      hasTable: Accessor<boolean>;
      table: Accessor<Table>;
      tableCellIds: Accessor<string[]>;
      rowCount: Accessor<number>;
      rowIds: Accessor<string[]>;
      sortedRowIds: Accessor<string[]>;
      hasRow: Accessor<boolean>;
      row: Accessor<ReturnType<Store['getRow']>>;
      hasCell: Accessor<boolean>;
      cell: Accessor<ReturnType<Store['getCell']>>;
      hasValues: Accessor<boolean>;
      storeValues: Accessor<ReturnType<Store['getValues']>>;
      valueIds: Accessor<string[]>;
      hasValue: Accessor<boolean>;
      value: Accessor<ReturnType<Store['getValue']>>;
    };

    const dispose = renderPrimitive(() => {
      values = {
        hasTables: useHasTables(store),
        tables: useTables(store),
        tableIds: useTableIds(store),
        hasTable: useHasTable('t1', store),
        table: useTable('t1', store),
        tableCellIds: useTableCellIds('t1', store),
        rowCount: useRowCount('t1', store),
        rowIds: useRowIds('t1', store),
        sortedRowIds: useSortedRowIds('t2', 'c1', true, 0, undefined, store),
        hasRow: useHasRow('t1', 'r1', store),
        row: useRow('t1', 'r1', store),
        hasCell: useHasCell('t1', 'r1', 'c1', store),
        cell: useCell('t1', 'r1', 'c1', store),
        hasValues: useHasValues(store),
        storeValues: useValues(store),
        valueIds: useValueIds(store),
        hasValue: useHasValue('v1', store),
        value: useValue('v1', store),
      };
    });

    expect(values!.hasTables()).toBe(true);
    expect(values!.tables()).toEqual({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3}},
    });
    expect(values!.tableIds()).toEqual(['t1', 't2']);
    expect(values!.hasTable()).toBe(true);
    expect(values!.table()).toEqual({r1: {c1: 1}});
    expect(values!.tableCellIds()).toEqual(['c1']);
    expect(values!.rowCount()).toBe(1);
    expect(values!.rowIds()).toEqual(['r1']);
    expect(values!.sortedRowIds()).toEqual(['r2', 'r1']);
    expect(values!.hasRow()).toBe(true);
    expect(values!.row()).toEqual({c1: 1});
    expect(values!.hasCell()).toBe(true);
    expect(values!.cell()).toBe(1);
    expect(values!.hasValues()).toBe(true);
    expect(values!.storeValues()).toEqual({v1: 4});
    expect(values!.valueIds()).toEqual(['v1']);
    expect(values!.hasValue()).toBe(true);
    expect(values!.value()).toBe(4);

    store.setCell('t1', 'r2', 'c1', 5).setValue('v1', 6);
    await pause();

    expect(values!.tables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c1: 5}},
      t2: {r1: {c1: 2}, r2: {c1: 3}},
    });
    expect(values!.rowCount()).toBe(2);
    expect(values!.rowIds()).toEqual(['r1', 'r2']);
    expect(values!.value()).toBe(6);

    dispose();
  });

  test('reads and updates tables', async () => {
    const store = createStore().setTables({t1: {r1: {c1: 1}}});
    let tables: Accessor<ReturnType<Store['getTables']>>;

    const dispose = renderPrimitive(() => {
      tables = useTables(store);
    });

    expect(tables!()).toEqual({t1: {r1: {c1: 1}}});

    store.setCell('t1', 'r1', 'c1', 2);
    await pause();
    expect(tables!()).toEqual({t1: {r1: {c1: 2}}});

    dispose();
  });

  test('reads derived primitives', async () => {
    const store = createStore()
      .setTables({
        t1: {r1: {c1: 1}, r2: {c1: 1}},
        t2: {R1: {C1: 3}},
        t3: {a: {c1: 'b'}, b: {c1: 'c'}, c: {c1: 'd'}},
      })
      .setValues({v1: 1});
    const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 't2', 'c1')
      .setRelationshipDefinition('r2', 't3', 't3', 'c1');
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const checkpoints = createCheckpoints(store);
    let values: {
      metricIds: Accessor<string[]>;
      metric: Accessor<number | undefined>;
      indexIds: Accessor<string[]>;
      sliceIds: Accessor<string[]>;
      sliceRowIds: Accessor<string[]>;
      relationshipIds: Accessor<string[]>;
      remoteRowId: Accessor<string | undefined>;
      localRowIds: Accessor<string[]>;
      linkedRowIds: Accessor<string[]>;
      queryIds: Accessor<string[]>;
      resultTable: Accessor<Table>;
      resultTableCellIds: Accessor<string[]>;
      resultRowCount: Accessor<number>;
      resultRowIds: Accessor<string[]>;
      resultSortedRowIds: Accessor<string[]>;
      resultRow: Accessor<ReturnType<Store['getRow']>>;
      resultCellIds: Accessor<string[]>;
      resultCell: Accessor<ReturnType<Store['getCell']>>;
      paramValues: Accessor<Record<string, unknown>>;
      paramValue: Accessor<unknown>;
      checkpointIds: Accessor<ReturnType<typeof checkpoints.getCheckpointIds>>;
      checkpoint: Accessor<string | undefined>;
    };

    checkpoints.setCheckpoint('0', 'start');

    const dispose = renderPrimitive(() => {
      values = {
        metricIds: useMetricIds(metrics),
        metric: useMetric('m1', metrics),
        indexIds: useIndexIds(indexes),
        sliceIds: useSliceIds('i1', indexes),
        sliceRowIds: useSliceRowIds('i1', '1', indexes),
        relationshipIds: useRelationshipIds(relationships),
        remoteRowId: useRemoteRowId('r1', 'r1', relationships),
        localRowIds: useLocalRowIds('r1', '1', relationships),
        linkedRowIds: useLinkedRowIds('r2', 'a', relationships),
        queryIds: useQueryIds(queries),
        resultTable: useResultTable('q1', queries),
        resultTableCellIds: useResultTableCellIds('q1', queries),
        resultRowCount: useResultRowCount('q1', queries),
        resultRowIds: useResultRowIds('q1', queries),
        resultSortedRowIds: useResultSortedRowIds(
          'q1',
          'c1',
          true,
          0,
          undefined,
          queries,
        ),
        resultRow: useResultRow('q1', 'r1', queries),
        resultCellIds: useResultCellIds('q1', 'r1', queries),
        resultCell: useResultCell('q1', 'r1', 'c1', queries),
        paramValues: useParamValues('q1', queries),
        paramValue: useParamValue('q1', 'p1', queries),
        checkpointIds: useCheckpointIds(checkpoints),
        checkpoint: useCheckpoint('0', checkpoints),
      };
    });

    expect(values!.metricIds()).toEqual(['m1']);
    expect(values!.metric()).toBe(2);
    expect(values!.indexIds()).toEqual(['i1']);
    expect(values!.sliceIds()).toEqual(['1']);
    expect(values!.sliceRowIds()).toEqual(['r1', 'r2']);
    expect(values!.relationshipIds()).toEqual(['r1', 'r2']);
    expect(values!.remoteRowId()).toBe('1');
    expect(values!.localRowIds()).toEqual(['r1', 'r2']);
    expect(values!.linkedRowIds()).toEqual(['a', 'b', 'c', 'd']);
    expect(values!.queryIds()).toEqual(['q1']);
    expect(values!.resultTable()).toEqual({r1: {c1: 1}, r2: {c1: 1}});
    expect(values!.resultTableCellIds()).toEqual(['c1']);
    expect(values!.resultRowCount()).toBe(2);
    expect(values!.resultRowIds()).toEqual(['r1', 'r2']);
    expect(values!.resultSortedRowIds()).toEqual(['r2', 'r1']);
    expect(values!.resultRow()).toEqual({c1: 1});
    expect(values!.resultCellIds()).toEqual(['c1']);
    expect(values!.resultCell()).toBe(1);
    expect(values!.paramValues()).toEqual({});
    expect(values!.paramValue()).toBeUndefined();
    expect(values!.checkpointIds()).toEqual([[], '0', []]);
    expect(values!.checkpoint()).toBe('start');

    store.setCell('t1', 'r3', 'c1', 2);
    queries.setParamValue('q1', 'p1', 'p1');
    await pause();

    expect(values!.metric()).toBe(3);
    expect(values!.sliceIds()).toEqual(['1', '2']);
    expect(values!.resultRowCount()).toBe(3);
    expect(values!.resultSortedRowIds()).toEqual(['r3', 'r2', 'r1']);
    expect(values!.paramValue()).toBe('p1');

    dispose();
  });

  test('updates when accessor arguments change', async () => {
    const store = createStore().setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}},
    });
    let table: Accessor<Table>;
    let setTableId: Setter<string>;

    const dispose = renderPrimitive(() => {
      const [tableId, setId] = createSignal('t1');
      table = useTable(tableId, store);
      setTableId = setId;
    });

    expect(table!()).toEqual({r1: {c1: 1}});

    setTableId!('t2');
    await pause();
    expect(table!()).toEqual({r1: {c1: 2}});

    dispose();
  });

  test('destroys late persister when owner is disposed', async () => {
    const persister = createTestPersister();
    let resolveCreate: (persister: TestPersister) => void;
    const create = vi.fn(
      () =>
        new Promise<TestPersister>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const then = vi.fn();

    const dispose = renderPrimitive(() => {
      useCreatePersister(createStore(), create, then);
    });

    await pause();
    dispose();
    resolveCreate!(persister);
    await pause();

    expect(create).toHaveBeenCalledTimes(1);
    expect(then).not.toHaveBeenCalled();
    expect(persister.destroy).toHaveBeenCalledTimes(1);
  });

  test('recreates persister when accessor store changes', async () => {
    const store1 = createStore();
    const store2 = createStore();
    const persister1 = createTestPersister();
    const persister2 = createTestPersister();
    const create = vi
      .fn()
      .mockResolvedValueOnce(persister1)
      .mockResolvedValueOnce(persister2);
    let persister: Accessor<TestPersister | undefined>;
    let setStore: Setter<Store>;

    const dispose = renderPrimitive(() => {
      const [store, setResolvedStore] = createSignal(store1);
      persister = useCreatePersister(store, create);
      setStore = setResolvedStore;
    });

    await pause();
    expect(persister!()).toBe(persister1);

    setStore!(store2);
    await pause();
    expect(persister!()).toBe(persister2);
    expect(persister1.destroy).toHaveBeenCalledTimes(1);

    dispose();
    expect(persister2.destroy).toHaveBeenCalledTimes(1);
  });

  test('destroys late synchronizer when owner is disposed', async () => {
    const synchronizer = createTestSynchronizer();
    let resolveCreate: (synchronizer: TestSynchronizer) => void;
    const create = vi.fn(
      () =>
        new Promise<TestSynchronizer>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const dispose = renderPrimitive(() => {
      useCreateSynchronizer(createMergeableStore(), create);
    });

    await pause();
    dispose();
    resolveCreate!(synchronizer);
    await pause();

    expect(create).toHaveBeenCalledTimes(1);
    expect(synchronizer.destroy).toHaveBeenCalledTimes(1);
  });

  test('recreates synchronizer when accessor store changes', async () => {
    const store1 = createMergeableStore();
    const store2 = createMergeableStore();
    const synchronizer1 = createTestSynchronizer();
    const synchronizer2 = createTestSynchronizer();
    const create = vi
      .fn()
      .mockResolvedValueOnce(synchronizer1)
      .mockResolvedValueOnce(synchronizer2);
    let synchronizer: Accessor<TestSynchronizer | undefined>;
    let setStore: Setter<MergeableStore>;

    const dispose = renderPrimitive(() => {
      const [store, setResolvedStore] = createSignal(store1);
      synchronizer = useCreateSynchronizer(store, create);
      setStore = setResolvedStore;
    });

    await pause();
    expect(synchronizer!()).toBe(synchronizer1);

    setStore!(store2);
    await pause();
    expect(synchronizer!()).toBe(synchronizer2);
    expect(synchronizer1.destroy).toHaveBeenCalledTimes(1);

    dispose();
    expect(synchronizer2.destroy).toHaveBeenCalledTimes(1);
  });
});
