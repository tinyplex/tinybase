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
  useCellState,
  useCheckpoint,
  useCheckpointIds,
  useCheckpointIdsListener,
  useCheckpointListener,
  useCheckpointsIds,
  useCreateCheckpoints,
  useCreateIndexes,
  useCreateMergeableStore,
  useCreateMetrics,
  useCreatePersister,
  useCreateQueries,
  useCreateRelationships,
  useCreateStore,
  useCreateSynchronizer,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useDelValueCallback,
  useDelValuesCallback,
  useDidFinishTransactionListener,
  useGoBackwardCallback,
  useGoForwardCallback,
  useGoToCallback,
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
  useParamValueState,
  useParamValues,
  useParamValuesListener,
  useParamValuesState,
  usePersisterIds,
  usePersisterStatus,
  usePersisterStatusListener,
  useQueriesIds,
  useQueryIds,
  useRedoInformation,
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
  useRowState,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetParamValueCallback,
  useSetParamValuesCallback,
  useSetPartialRowCallback,
  useSetPartialValuesCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetTablesCallback,
  useSetValueCallback,
  useSetValuesCallback,
  useSliceIds,
  useSliceIdsListener,
  useSliceRowIds,
  useSliceRowIdsListener,
  useSortedRowIds,
  useSortedRowIdsListener,
  useStartTransactionListener,
  useStore,
  useSynchronizerIds,
  useSynchronizerStatus,
  useSynchronizerStatusListener,
  useTable,
  useTableCellIds,
  useTableCellIdsListener,
  useTableIds,
  useTableIdsListener,
  useTableListener,
  useTableState,
  useTables,
  useTablesListener,
  useTablesState,
  useUndoInformation,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValueState,
  useValues,
  useValuesListener,
  useValuesState,
  useWillFinishTransactionListener,
} from 'tinybase/ui-solid';
import {describe, expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';
import {
  testCheckpointCallbackFunctions,
  testCheckpointInformationFunctions,
  testStateFunctions,
  testStoreListenerFunctions,
  testStoreListenerOverloadFunctions,
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
  readonly tableId: Id;
  readonly rowId: Id;
  readonly cellId: Id;
  readonly valueId: Id;
  readonly metricId: Id;
  readonly indexId: Id;
  readonly sliceId: Id;
  readonly relationshipId: Id;
  readonly localRowId: Id;
  readonly remoteRowId: Id;
  readonly firstRowId: Id;
  readonly queryId: Id;
  readonly descending: boolean;
  readonly offset: number;
  readonly limit: number;
}) => {
  const hasTables = useHasTables(store);
  const tables = useTables(store);
  const tableIds = useTableIds(store);
  const hasTable = useHasTable(tableId, store);
  const table = useTable(tableId, store);
  const tableCellIds = useTableCellIds(tableId, store);
  const hasTableCell = useHasTableCell(tableId, cellId, store);
  const rowCount = useRowCount(tableId, store);
  const rowIds = useRowIds(tableId, store);
  const sortedRowIds = useSortedRowIds(
    tableId,
    cellId,
    descending,
    offset,
    limit,
    store,
  );
  const hasRow = useHasRow(tableId, rowId, store);
  const row = useRow(tableId, rowId, store);
  const cellIds = useCellIds(tableId, rowId, store);
  const hasCell = useHasCell(tableId, rowId, cellId, store);
  const cell = useCell(tableId, rowId, cellId, store);
  const hasValues = useHasValues(store);
  const values = useValues(store);
  const valueIds = useValueIds(store);
  const hasValue = useHasValue(valueId, store);
  const storeValue = useValue(valueId, store);
  const metricsIds = useMetricsIds();
  const indexesIds = useIndexesIds();
  const queriesIds = useQueriesIds();
  const relationshipsIds = useRelationshipsIds();
  const checkpointsIds = useCheckpointsIds();
  const persisterIds = usePersisterIds();
  const synchronizerIds = useSynchronizerIds();
  const metricIds = useMetricIds(metrics);
  const metric = useMetric(metricId, metrics);
  const indexIds = useIndexIds(indexes);
  const sliceIds = useSliceIds(indexId, indexes);
  const sliceRowIds = useSliceRowIds(indexId, sliceId, indexes);
  const relationshipIds = useRelationshipIds(relationships);
  const remoteRowIdResult = useRemoteRowId(
    relationshipId,
    localRowId,
    relationships,
  );
  const localRowIds = useLocalRowIds(
    relationshipId,
    remoteRowId,
    relationships,
  );
  const linkedRowIds = useLinkedRowIds(
    relationshipId,
    firstRowId,
    relationships,
  );
  const queryIds = useQueryIds(queries);
  const resultTable = useResultTable(queryId, queries);
  const resultTableCellIds = useResultTableCellIds(queryId, queries);
  const resultRowCount = useResultRowCount(queryId, queries);
  const resultRowIds = useResultRowIds(queryId, queries);
  const resultSortedRowIds = useResultSortedRowIds(
    queryId,
    cellId,
    descending,
    offset,
    limit,
    queries,
  );
  const resultRow = useResultRow(queryId, rowId, queries);
  const resultCellIds = useResultCellIds(queryId, rowId, queries);
  const resultCell = useResultCell(queryId, rowId, cellId, queries);
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
  readonly tableId: Id;
  readonly rowId: Id;
  readonly cellId: Id;
  readonly valueId: Id;
  readonly metricId: Id;
  readonly indexId: Id;
  readonly sliceId: Id;
  readonly relationshipId: Id;
  readonly localRowId: Id;
  readonly remoteRowId: Id;
  readonly firstRowId: Id;
  readonly queryId: Id;
  readonly paramId: Id;
  readonly checkpointId: Id;
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
    case 'sortedRowIdsObject':
      useSortedRowIdsListener(
        {tableId: 't1', cellId: 'c1'},
        listener,
        false,
        store,
      );
      break;
    case 'sortedRowIdsDefaults':
      useSortedRowIdsListener(
        't1',
        'c1',
        undefined as unknown as boolean,
        undefined as unknown as number,
        undefined as unknown as number,
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
    case 'resultSortedRowIdsDefaults':
      useResultSortedRowIdsListener(
        'q1',
        'c1',
        undefined as unknown as boolean,
        undefined as unknown as number,
        undefined as unknown as number,
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

const CheckpointInfo = ({
  mode,
  checkpoints,
}: {
  readonly mode: string;
  readonly checkpoints: Checkpoints;
}) => {
  const undoInformation = useUndoInformation(checkpoints);
  const redoInformation = useRedoInformation(checkpoints);
  return (() => {
    const button = document.createElement('button');
    const [available, action, checkpointId, label] =
      mode == 'undoInformation' ? undoInformation : redoInformation;
    button.addEventListener('click', action);
    return [JSON.stringify([available, checkpointId ?? null, label]), button];
  }) as unknown as JSXElement;
};

const State = ({
  mode,
  store,
  queries,
}: {
  readonly mode: string;
  readonly store?: Store;
  readonly queries?: Queries;
}) => {
  const [tables, setTables] = useTablesState(store);
  const [table, setTable] = useTableState('t1', store);
  const [row, setRow] = useRowState('t1', 'r1', store);
  const [cell, setCell] = useCellState('t1', 'r1', 'c1', store);
  const [values, setValues] = useValuesState(store);
  const [value, setValue] = useValueState('v1', store);
  const [paramValues, setParamValues] = useParamValuesState('q1', queries);
  const [paramValue, setParamValue] = useParamValueState('q1', 'p1', queries);
  const state = {
    tablesState: [tables, () => setTables({t1: {r1: {c1: 2}}})],
    tableState: [table, () => setTable({r1: {c1: 2}})],
    rowState: [row, () => setRow({c1: 2})],
    cellState: [cell, () => setCell(2)],
    valuesState: [values, () => setValues({v1: 2})],
    valueState: [value, () => setValue(2)],
    paramValuesState: [paramValues, () => setParamValues({p1: 2})],
    paramValueState: [paramValue, () => setParamValue(2)],
  }[mode] as [Accessor<unknown>, () => void];
  return (() => {
    const button = document.createElement('button');
    button.textContent = 'Set';
    button.addEventListener('click', state[1]);
    return [JSON.stringify(state[0]()), button];
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
  const setTables = useSetTablesCallback(
    () => ({t1: {r1: {c1: 2}}}),
    store,
    then,
  );
  const setTable = useSetTableCallback(
    't1',
    () => ({r1: {c1: 2}}),
    store,
    then,
  );
  const addRow = useAddRowCallback('t1', () => ({c1: 3}), store, then);
  const setPartialRow = useSetPartialRowCallback(
    't1',
    'r1',
    () => ({c2: 2}),
    store,
    then,
  );
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
  const setPartialValues = useSetPartialValuesCallback(
    () => ({v2: 2}),
    store,
    then,
  );
  const setValue = useSetValueCallback('v1', () => 2, store, then);
  const setParamValues = useSetParamValuesCallback(
    'q1',
    () => ({p1: 'value'}),
    queries,
    then,
  );
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
  const delTables = useDelTablesCallback(store, then);
  const delTable = useDelTableCallback('t1', store, then);
  const delRow = useDelRowCallback('t1', 'r1', store, then);
  const delValues = useDelValuesCallback(store, then);
  const delValue = useDelValueCallback('v1', store, then);
  return (() => {
    const button = document.createElement('button');
    const handlers: {[mode: string]: EventListener} = {
      setTables,
      setTable,
      setRow,
      addRow,
      setPartialRow,
      setCell,
      delCell,
      setValues,
      setPartialValues,
      setValue,
      setParamValues,
      setParamValue,
      setCheckpoint,
      delTables,
      delTable,
      delRow,
      delValues,
      delValue,
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
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testStoreListenerFunctions('ui-solid', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testStoreListenerOverloadFunctions('ui-solid', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testCheckpointCallbackFunctions('ui-solid', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testCheckpointInformationFunctions('ui-solid', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testWriteCallbackFunctions('ui-solid', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testStateFunctions('ui-solid', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
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

  test('covers create and state primitives', async () => {
    const store = createStore().setTables({t1: {r1: {c1: 1}}});
    const mergeableStore = createMergeableStore();
    let createdStore: Accessor<Store>;
    let createdMergeableStore: Accessor<MergeableStore>;
    let metrics: Accessor<Metrics | undefined>;
    let indexes: Accessor<Indexes | undefined>;
    let relationships: Accessor<Relationships | undefined>;
    let queries: Accessor<Queries | undefined>;
    let checkpoints: Accessor<Checkpoints | undefined>;
    let tables: Accessor<ReturnType<Store['getTables']>>;
    let table: Accessor<Table>;
    let row: Accessor<ReturnType<Store['getRow']>>;
    let cell: Accessor<ReturnType<Store['getCell']>>;
    let values: Accessor<ReturnType<Store['getValues']>>;
    let value: Accessor<ReturnType<Store['getValue']>>;
    let paramValues: Accessor<ReturnType<Queries['getParamValues']>>;
    let paramValue: Accessor<ReturnType<Queries['getParamValue']>>;
    let directStore: Accessor<Store | undefined>;
    let noMetrics: Accessor<Metrics | undefined>;
    let sortedRowIds: Accessor<string[]>;
    let resultSortedRowIds: Accessor<string[]>;
    let setTables: (tables: ReturnType<Store['getTables']>) => void;
    let setTable: (table: Table) => void;
    let setRow: (row: ReturnType<Store['getRow']>) => void;
    let setCell: (cell: string) => void;
    let setValues: (values: ReturnType<Store['getValues']>) => void;
    let setValue: (value: string) => void;
    let setParamValues: (values: ReturnType<Queries['getParamValues']>) => void;
    let setParamValue: (
      value: NonNullable<ReturnType<Queries['getParamValue']>>,
    ) => void;

    const dispose = renderPrimitive(() => {
      const query = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where((getCell) =>
            (param('p1') as string[]).includes(getCell('c1') as string),
          );
        },
        {p1: ['a']},
      );

      createdStore = useCreateStore(() => store);
      createdMergeableStore = useCreateMergeableStore(() => mergeableStore);
      noMetrics = useCreateMetrics(undefined, (store) => createMetrics(store));
      metrics = useCreateMetrics(store, (store) => createMetrics(store));
      indexes = useCreateIndexes(store, (store) => createIndexes(store));
      relationships = useCreateRelationships(store, (store) =>
        createRelationships(store),
      );
      queries = useCreateQueries(store, (store) => createQueries(store));
      checkpoints = useCreateCheckpoints(store, (store) =>
        createCheckpoints(store),
      );
      [tables, setTables] = useTablesState(store);
      [table, setTable] = useTableState('t1', store);
      [row, setRow] = useRowState('t1', 'r1', store);
      [cell, setCell] = useCellState('t1', 'r1', 'c1', store);
      [values, setValues] = useValuesState(store);
      [value, setValue] = useValueState('v1', store);
      [paramValues, setParamValues] = useParamValuesState('q1', query);
      [paramValue, setParamValue] = useParamValueState('q1', 'p1', query);
      directStore = useStore(store as unknown as string);
      sortedRowIds = useSortedRowIds({tableId: 't1', cellId: 'c1'}, store);
      resultSortedRowIds = useResultSortedRowIds(
        'q1',
        'c1',
        false,
        undefined,
        undefined,
        query,
      );
    });

    expect(createdStore!()).toBe(store);
    expect(createdMergeableStore!()).toBe(mergeableStore);
    expect(noMetrics!()).toBeUndefined();
    expect(metrics!()?.getMetricIds()).toEqual([]);
    expect(indexes!()?.getIndexIds()).toEqual([]);
    expect(relationships!()?.getRelationshipIds()).toEqual([]);
    expect(queries!()?.getQueryIds()).toEqual(['q1']);
    expect(checkpoints!()?.getCheckpointIds()).toEqual([[], '0', []]);

    setTables!({t1: {r1: {c1: 'a'}}});
    setTable!({r1: {c1: 'b'}});
    setRow!({c1: 'c'});
    setCell!('d');
    setValues!({v1: 'e'});
    setValue!('f');
    setParamValues!({p1: ['d']});
    setParamValue!(['c']);
    await pause();

    expect(tables!()).toEqual({t1: {r1: {c1: 'd'}}});
    expect(table!()).toEqual({r1: {c1: 'd'}});
    expect(row!()).toEqual({c1: 'd'});
    expect(cell!()).toBe('d');
    expect(values!()).toEqual({v1: 'f'});
    expect(value!()).toBe('f');
    expect(paramValues!()).toEqual({p1: ['c']});
    expect(paramValue!()).toEqual(['c']);
    expect(directStore!()).toBe(store);
    expect(sortedRowIds!()).toEqual(['r1']);
    expect(resultSortedRowIds!()).toEqual([]);

    dispose();
  });

  test('covers write callback variants', () => {
    const store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    let setTables: () => void;
    let setTable: () => void;
    let addRow: (suffix: string) => void;
    let setRowByParameter: (rowId: string) => void;
    let setPartialRow: () => void;
    let setPartialValues: () => void;
    let setValue: () => void;
    let setParamValues: () => void;
    let delTables: () => void;
    let delTableByFunction: () => void;
    let delTable: () => void;
    let delRow: () => void;
    let delValues: () => void;
    let delValue: () => void;

    const dispose = renderPrimitive(() => {
      setTables = useSetTablesCallback(() => ({t1: {r1: {c1: 2}}}), store);
      setTable = useSetTableCallback(
        () => 't1',
        () => ({r1: {c1: 3}}),
        store,
      );
      addRow = useAddRowCallback(
        (suffix: string) => 't' + suffix,
        () => ({
          c1: 4,
        }),
        store,
      );
      setRowByParameter = useSetRowCallback(
        't1',
        (rowId: string) => rowId,
        () => ({c1: 8}),
        store,
      );
      setPartialRow = useSetPartialRowCallback(
        't1',
        'r1',
        () => ({c2: 5}),
        store,
      );
      setPartialValues = useSetPartialValuesCallback(() => ({v2: 6}), store);
      setValue = useSetValueCallback('v1', () => 7, store);
      setParamValues = useSetParamValuesCallback(
        'q1',
        () => ({p1: 'v'}),
        queries,
      );
      delTables = useDelTablesCallback(store);
      delTableByFunction = useDelTableCallback(() => 't2', store);
      delTable = useDelTableCallback('t1', store);
      delRow = useDelRowCallback('t1', 'r1', store);
      delValues = useDelValuesCallback(store);
      delValue = useDelValueCallback('v1', store);
    });

    setTables!();
    expect(store.getCell('t1', 'r1', 'c1')).toBe(2);
    setTable!();
    expect(store.getCell('t1', 'r1', 'c1')).toBe(3);
    addRow!('2');
    expect(store.getRow('t2', '0')).toEqual({c1: 4});
    setRowByParameter!('r2');
    expect(store.getRow('t1', 'r2')).toEqual({c1: 8});
    setPartialRow!();
    expect(store.getRow('t1', 'r1')).toEqual({c1: 3, c2: 5});
    setPartialValues!();
    expect(store.getValues()).toEqual({v1: 1, v2: 6});
    setValue!();
    expect(store.getValue('v1')).toBe(7);
    setParamValues!();
    expect(queries.getParamValues('q1')).toEqual({p1: 'v'});
    delRow!();
    expect(store.hasRow('t1', 'r1')).toBe(false);
    delValue!();
    expect(store.hasValue('v1')).toBe(false);
    delValues!();
    expect(store.hasValues()).toBe(false);
    delTableByFunction!();
    expect(store.hasTable('t2')).toBe(false);
    store.setTable('t1', {r1: {c1: 1}});
    delTable!();
    expect(store.hasTable('t1')).toBe(false);
    store.setTable('t1', {r1: {c1: 1}});
    delTables!();
    expect(store.hasTables()).toBe(false);

    dispose();
  });

  test('covers checkpoint information and callbacks', async () => {
    const store = createStore().setCell('t1', 'r1', 'c1', 1);
    const checkpoints = createCheckpoints(store);
    store.setCell('t1', 'r1', 'c1', 2);
    store.setCell('t1', 'r1', 'c1', 3);
    checkpoints.goBackward();
    let setCheckpoint: () => void;
    let goTo: (checkpointId: string) => void;
    let undoInfo: ReturnType<typeof useUndoInformation>;
    let redoInfo: ReturnType<typeof useUndoInformation>;
    let emptyUndoInfo: ReturnType<typeof useUndoInformation>;
    let emptyRedoInfo: ReturnType<typeof useRedoInformation>;
    let undefinedUndoInfo: ReturnType<typeof useUndoInformation>;

    const dispose = renderPrimitive(() => {
      setCheckpoint = useSetCheckpointCallback(undefined, checkpoints);
      goTo = useGoToCallback(
        (checkpointId: string) => checkpointId,
        checkpoints,
      );
      undoInfo = useUndoInformation(checkpoints);
      redoInfo = useRedoInformation(checkpoints);
      const emptyCheckpoints = createCheckpoints(createStore());
      emptyUndoInfo = useUndoInformation(emptyCheckpoints);
      emptyRedoInfo = useRedoInformation(emptyCheckpoints);
      undefinedUndoInfo = useUndoInformation();
    });

    expect(undoInfo![3]).toEqual(expect.any(String));
    expect(redoInfo![0]).toBe(true);
    expect(redoInfo![3]).toEqual(expect.any(String));
    expect(emptyUndoInfo![3]).toBe('');
    expect(emptyRedoInfo![3]).toBe('');
    expect(undefinedUndoInfo![3]).toBe('');

    redoInfo![1]();
    await pause();
    setCheckpoint!();
    goTo!('0');

    expect(store.getCell('t1', 'r1', 'c1')).toBe(1);

    dispose();
  });

  test('covers status and undefined create primitives', async () => {
    const persister = createTestPersister();
    const synchronizer = createTestSynchronizer();
    let lateUndefinedPersisterResolve: () => void;
    let lateUndefinedSynchronizerResolve: () => void;
    let persisterStatus: Accessor<number>;
    let synchronizerStatus: Accessor<number>;
    let emptyPersister: Accessor<unknown>;
    let undefinedPersister: Accessor<unknown>;
    let createdPersister: Accessor<unknown>;
    let emptySynchronizer: Accessor<TestSynchronizer | undefined>;
    let undefinedSynchronizer: Accessor<TestSynchronizer | undefined>;
    const persisterThen = vi.fn();
    const persisterDestroy = vi.fn();
    const synchronizerDestroy = vi.fn();

    const dispose = renderPrimitive(() => {
      persisterStatus = usePersisterStatus(persister);
      synchronizerStatus = useSynchronizerStatus(synchronizer);
      emptyPersister = useCreatePersister(undefined, async () => persister);
      undefinedPersister = useCreatePersister(
        createStore(),
        async () => undefined,
        persisterThen,
        persisterDestroy,
      );
      createdPersister = useCreatePersister(
        createStore(),
        async () => persister,
        persisterThen,
        persisterDestroy,
      );
      useCreatePersister(
        createStore(),
        async () =>
          new Promise<undefined>((resolve) => {
            lateUndefinedPersisterResolve = () => resolve(undefined);
          }),
      );
      emptySynchronizer = useCreateSynchronizer(
        undefined,
        async () => synchronizer,
      );
      undefinedSynchronizer = useCreateSynchronizer(
        createMergeableStore(),
        async () => undefined,
        synchronizerDestroy,
      );
      useCreateSynchronizer(
        createMergeableStore(),
        async () =>
          new Promise<undefined>((resolve) => {
            lateUndefinedSynchronizerResolve = () => resolve(undefined);
          }),
      );
    });

    await pause();
    expect(persisterStatus!()).toBe(0);
    expect(synchronizerStatus!()).toBe(0);
    expect(emptyPersister!()).toBeUndefined();
    expect(undefinedPersister!()).toBeUndefined();
    expect(createdPersister!()).toBe(persister);
    expect(emptySynchronizer!()).toBeUndefined();
    expect(undefinedSynchronizer!()).toBeUndefined();
    expect(persisterThen).toHaveBeenCalledTimes(1);

    dispose();
    lateUndefinedPersisterResolve!();
    lateUndefinedSynchronizerResolve!();
    await pause();
    expect(persisterDestroy).toHaveBeenCalledTimes(1);
    expect(synchronizerDestroy).not.toHaveBeenCalled();
  });

  test('covers sorted row ids listener overloads', async () => {
    const store = createStore().setTables({t1: {r1: {c1: 1}, r2: {c1: 2}}});
    const listener = vi.fn();
    const objectListener = vi.fn();

    const dispose = renderPrimitive(() => {
      useSortedRowIdsListener(
        't1',
        'c1',
        undefined as unknown as boolean,
        undefined as unknown as number,
        undefined as unknown as number,
        listener,
        false,
        store,
      );
      useSortedRowIdsListener(
        {tableId: 't1', cellId: 'c1'},
        objectListener,
        false,
        store,
      );
    });

    store.setCell('t1', 'r1', 'c1', 3);
    await pause();

    expect(listener).toHaveBeenCalled();
    expect(objectListener).toHaveBeenCalled();

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
