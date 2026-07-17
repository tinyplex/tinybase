/* eslint-disable react-hooks/globals, react-hooks/immutability */
/* eslint-disable react-hooks/rules-of-hooks */
import '@testing-library/jest-dom/vitest';
import {fireEvent, render} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {type ComponentType, MouseEvent, MouseEventHandler, act} from 'react';
import type {
  Cell,
  Checkpoints,
  Id,
  Indexes,
  MapCell,
  MapValue,
  MergeableStore,
  Metrics,
  Queries,
  Relationships,
  Row,
  Store,
  Table,
  Tables,
  Value,
  Values,
} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import type {AnyPersister, Persister, Persists} from 'tinybase/persisters';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {
  Provider,
  useAddRowCallback,
  useCell,
  useCellIds,
  useCellIdsListener,
  useCellListener,
  useCellState,
  useCheckpointIds,
  useCheckpointIdsListener,
  useCheckpointListener,
  useCheckpoints,
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
  useHasIndex,
  useHasRow,
  useHasRowListener,
  useHasSlice,
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
  useIndexes,
  useIndexesIds,
  useLinkedRowIds,
  useLinkedRowIdsListener,
  useLocalRowIds,
  useLocalRowIdsListener,
  useMetric,
  useMetricIds,
  useMetricListener,
  useMetrics,
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
  useProvideCheckpoints,
  useProvideIndexes,
  useProvideMetrics,
  useProvidePersister,
  useProvideQueries,
  useProvideRelationships,
  useProvideStore,
  useProvideSynchronizer,
  useQueries,
  useQueriesIds,
  useQueryIds,
  useRedoInformation,
  useRelationshipIds,
  useRelationships,
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
  useStoreIds,
  useStores,
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
} from 'tinybase/ui-react';
import tmp from 'tmp';
import {type Mock, beforeEach, describe, expect, test, vi} from 'vitest';
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

let store: Store;
let didRender: Mock;

type TestPersister = Persister<Persists.StoreOnly> & {destroy: Mock};
type TestSynchronizer = Synchronizer & {destroy: Mock};

const createTestPersister = (): TestPersister =>
  ({destroy: vi.fn()}) as unknown as TestPersister;

const createTestSynchronizer = (): TestSynchronizer =>
  ({destroy: vi.fn()}) as unknown as TestSynchronizer;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
  didRender = vi.fn((rendered) => rendered);
});

type Props = {[key: string]: unknown};
type TestComponent = ComponentType<Props>;

const primitiveHarness = {
  act: async (callback: () => unknown) => {
    await act(async () => {
      callback();
    });
  },
  render: (component: unknown, props: Props = {}) => {
    let currentProps = props;
    const Component = component as TestComponent;
    const rendered = render(<Component {...currentProps} />);
    return {
      container: rendered.container,
      rerender: async (nextProps: Props) => {
        currentProps = {...currentProps, ...nextProps};
        await act(async () => {
          rendered.rerender(<Component {...currentProps} />);
        });
      },
      unmount: rendered.unmount,
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
  readonly persister?: AnyPersister;
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
  const hasIndex = useHasIndex(indexId, indexes);
  const sliceIds = useSliceIds(indexId, indexes);
  const hasSlice = useHasSlice(indexId, sliceId, indexes);
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
  return JSON.stringify(
    {
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
      hasIndex,
      sliceIds,
      hasSlice,
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
    }[mode],
  );
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
  readonly persister?: AnyPersister;
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
      useHasTablesListener(listener, [listener], false, store);
      break;
    case 'tables':
      useTablesListener(listener, [listener], false, store);
      break;
    case 'tableIds':
      useTableIdsListener(listener, [listener], false, store);
      break;
    case 'hasTable':
      useHasTableListener(tableId, listener, [listener], false, store);
      break;
    case 'table':
      useTableListener(tableId, listener, [listener], false, store);
      break;
    case 'tableCellIds':
      useTableCellIdsListener(tableId, listener, [listener], false, store);
      break;
    case 'hasTableCell':
      useHasTableCellListener(
        tableId,
        cellId,
        listener,
        [listener],
        false,
        store,
      );
      break;
    case 'rowCount':
      useRowCountListener(tableId, listener, [listener], false, store);
      break;
    case 'rowIds':
      useRowIdsListener(tableId, listener, [listener], false, store);
      break;
    case 'sortedRowIds':
      useSortedRowIdsListener(
        tableId,
        cellId,
        false,
        0,
        undefined,
        listener,
        [listener],
        false,
        store,
      );
      break;
    case 'sortedRowIdsObject':
      useSortedRowIdsListener(
        {tableId: 't1', cellId: 'c1'},
        listener,
        [listener],
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
        [listener],
        false,
        store,
      );
      break;
    case 'hasRow':
      useHasRowListener(tableId, rowId, listener, [listener], false, store);
      break;
    case 'row':
      useRowListener(tableId, rowId, listener, [listener], false, store);
      break;
    case 'cellIds':
      useCellIdsListener(tableId, rowId, listener, [listener], false, store);
      break;
    case 'hasCell':
      useHasCellListener(
        tableId,
        rowId,
        cellId,
        listener,
        [listener],
        false,
        store,
      );
      break;
    case 'cell':
      useCellListener(
        tableId,
        rowId,
        cellId,
        listener,
        [listener],
        false,
        store,
      );
      break;
    case 'hasValues':
      useHasValuesListener(listener, [listener], false, store);
      break;
    case 'values':
      useValuesListener(listener, [listener], false, store);
      break;
    case 'valueIds':
      useValueIdsListener(listener, [listener], false, store);
      break;
    case 'hasValue':
      useHasValueListener(valueId, listener, [listener], false, store);
      break;
    case 'value':
      useValueListener(valueId, listener, [listener], false, store);
      break;
    case 'startTransaction':
      useStartTransactionListener(listener, [listener], store);
      break;
    case 'willFinishTransaction':
      useWillFinishTransactionListener(listener, [listener], store);
      break;
    case 'didFinishTransaction':
      useDidFinishTransactionListener(listener, [listener], store);
      break;
    case 'metric':
      useMetricListener(metricId, listener, [listener], metrics);
      break;
    case 'sliceIds':
      useSliceIdsListener(indexId, listener, [listener], indexes);
      break;
    case 'sliceRowIds':
      useSliceRowIdsListener(indexId, sliceId, listener, [listener], indexes);
      break;
    case 'remoteRowId':
      useRemoteRowIdListener(
        relationshipId,
        localRowId,
        listener,
        [listener],
        relationships,
      );
      break;
    case 'localRowIds':
      useLocalRowIdsListener(
        relationshipId,
        remoteRowId,
        listener,
        [listener],
        relationships,
      );
      break;
    case 'linkedRowIds':
      useLinkedRowIdsListener(
        relationshipId,
        firstRowId,
        listener,
        [listener],
        relationships,
      );
      break;
    case 'resultTable':
      useResultTableListener(queryId, listener, [listener], queries);
      break;
    case 'resultTableCellIds':
      useResultTableCellIdsListener(queryId, listener, [listener], queries);
      break;
    case 'resultRowCount':
      useResultRowCountListener(queryId, listener, [listener], queries);
      break;
    case 'resultRowIds':
      useResultRowIdsListener(queryId, listener, [listener], queries);
      break;
    case 'resultSortedRowIds':
      useResultSortedRowIdsListener(
        queryId,
        cellId,
        false,
        0,
        undefined,
        listener,
        [listener],
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
        [listener],
        queries,
      );
      break;
    case 'resultRow':
      useResultRowListener(queryId, rowId, listener, [listener], queries);
      break;
    case 'resultCellIds':
      useResultCellIdsListener(queryId, rowId, listener, [listener], queries);
      break;
    case 'resultCell':
      useResultCellListener(
        queryId,
        rowId,
        cellId,
        listener,
        [listener],
        queries,
      );
      break;
    case 'paramValues':
      useParamValuesListener(queryId, listener, [listener], queries);
      break;
    case 'paramValue':
      useParamValueListener(queryId, paramId, listener, [listener], queries);
      break;
    case 'checkpointIds':
      useCheckpointIdsListener(listener, [listener], checkpoints);
      break;
    case 'checkpoint':
      useCheckpointListener(checkpointId, listener, [listener], checkpoints);
      break;
    case 'persisterStatus':
      usePersisterStatusListener(listener, [listener], persister);
      break;
    case 'synchronizerStatus':
      useSynchronizerStatusListener(listener, [listener], synchronizer);
      break;
  }
  return <button />;
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
  return (
    <button onClick={mode == 'goBackward' ? goBackward : goForward}>Go</button>
  );
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
  const [available, action, checkpointId, label] =
    mode == 'undoInformation' ? undoInformation : redoInformation;
  return (
    <>
      {JSON.stringify([available, checkpointId ?? null, label])}
      <button onClick={action} />
    </>
  );
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
  }[mode] as [unknown, () => void];
  const _handleClick = state[1];
  return (
    <>
      {JSON.stringify(state[0])}
      <button onClick={_handleClick}>Set</button>
    </>
  );
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
  const setRow = useSetRowCallback(
    't1',
    'r1',
    () => ({c1: 2}),
    [],
    store,
    then,
  );
  const setTables = useSetTablesCallback(
    () => ({t1: {r1: {c1: 2}}}),
    [],
    store,
    then,
  );
  const setTable = useSetTableCallback(
    't1',
    () => ({r1: {c1: 2}}),
    [],
    store,
    then,
  );
  const addRow = useAddRowCallback('t1', () => ({c1: 3}), [], store, then);
  const setPartialRow = useSetPartialRowCallback(
    't1',
    'r1',
    () => ({c2: 2}),
    [],
    store,
    then,
  );
  const setCell = useSetCellCallback(
    't1',
    'r1',
    'c1',
    () => 'changed',
    [],
    store,
    then,
  );
  const delCell = useDelCellCallback('t1', 'r1', 'c1', true, store, then);
  const setValues = useSetValuesCallback(() => ({v1: 4}), [], store, then);
  const setPartialValues = useSetPartialValuesCallback(
    () => ({v2: 2}),
    [],
    store,
    then,
  );
  const setValue = useSetValueCallback('v1', () => 2, [], store, then);
  const setParamValues = useSetParamValuesCallback(
    'q1',
    () => ({p1: 'value'}),
    [],
    queries,
    then,
  );
  const setParamValue = useSetParamValueCallback(
    'q1',
    'p1',
    () => 'value',
    [],
    queries,
    then,
  );
  const setCheckpoint = useSetCheckpointCallback(
    () => 'label',
    [],
    checkpoints,
    then,
  );
  const delTables = useDelTablesCallback(store, then);
  const delTable = useDelTableCallback('t1', store, then);
  const delRow = useDelRowCallback('t1', 'r1', store, then);
  const delValues = useDelValuesCallback(store, then);
  const delValue = useDelValueCallback('v1', store, then);
  const _handleClick = {
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
  }[mode];

  return <button onClick={_handleClick} />;
};

testContextPrimitives('ui-react', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});

testStoreReadFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testStoreListenerFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testStoreListenerOverloadFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testCheckpointCallbackFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testCheckpointInformationFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testWriteCallbackFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});
testStateFunctions('ui-react', primitiveHarness, {
  Callback,
  CheckpointInfo,
  Listener,
  Reader,
  State,
  Writer,
});

describe('React-specific', () => {
  describe('Create Hooks', () => {
    test('useCreateStore', () => {
      const initStore = vi.fn((count: any) =>
        createStore().setTables({t1: {r1: {c1: count}}}),
      );
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore(count));
        return didRender(JSON.stringify([count, store.getTables()]));
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {t1: {r1: {c1: 1}}}]),
      );

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {t1: {r1: {c1: 1}}}]),
      );

      expect(didRender).toHaveBeenCalledTimes(2);
      expect(initStore).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useCreateMergeableStore', () => {
      const initStore = vi.fn((count: any) =>
        createMergeableStore('s1').setTables({t1: {r1: {c1: count}}}),
      );
      const Test = ({count}: {count: number}) => {
        const store = useCreateMergeableStore(() => initStore(count));
        return didRender(JSON.stringify([count, store.getTables()]));
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {t1: {r1: {c1: 1}}}]),
      );

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {t1: {r1: {c1: 1}}}]),
      );
      expect(didRender).toHaveBeenCalledTimes(2);
      expect(initStore).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useCreateMetrics', () => {
      const initStore = vi.fn(() =>
        createStore().setTables({
          t1: {r1: {c1: 1}},
          t2: {r1: {c2: 2}, r2: {c2: 2}},
        }),
      );
      const initMetrics = vi.fn((store: Store, count) =>
        createMetrics(store).setMetricDefinition('m1', `t${count}`),
      );
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore());
        const metrics = useCreateMetrics(
          store,
          (store) => initMetrics(store, count),
          [count],
        );
        return didRender(JSON.stringify([count, metrics?.getMetric('m1')]));
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(JSON.stringify([1, 1]));

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(JSON.stringify([2, 2]));
      expect(didRender).toHaveBeenCalledTimes(4);
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(initMetrics).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCreateMetrics (no deps, and destroy)', () => {
      const initStore = vi.fn(() =>
        createStore().setTables({t1: {r1: {c1: 1}}, t2: {r1: {c2: 2}}}),
      );
      const initMetrics = vi.fn((store: Store) =>
        createMetrics(store).setMetricDefinition('m1', `t1`),
      );
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore());
        const metrics = useCreateMetrics(store, (store) => initMetrics(store));
        return didRender(JSON.stringify([count, metrics?.getMetric('m1')]));
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(JSON.stringify([1, 1]));

      rerender(<Test count={2} />);

      unmount();
      expect(container.textContent).toEqual('');
      expect(didRender).toHaveBeenCalledTimes(3);
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(initMetrics).toHaveBeenCalledTimes(1);
    });

    test('useCreateMetrics (undefined store)', () => {
      const initMetrics = vi.fn((store: Store) =>
        createMetrics(store).setMetricDefinition('m1', `t1`),
      );
      const Test = () => {
        const metrics = useCreateMetrics(undefined, (store) =>
          initMetrics(store),
        );
        return didRender(JSON.stringify(metrics?.getMetric('m1')));
      };

      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('useCreateIndexes', async () => {
      const initStore = vi.fn(() =>
        createStore().setTables({t1: {r1: {c1: 1}, r2: {c2: 1}}}),
      );
      const initIndexes = vi.fn((store: Store, count) => {
        return createIndexes(store).setIndexDefinition('i1', 't1', `c${count}`);
      });
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore());
        const indexes = useCreateIndexes(
          store,
          (store) => initIndexes(store, count),
          [count],
        );
        return didRender(
          JSON.stringify([count, indexes?.getSliceRowIds('i1', '1')]),
        );
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(JSON.stringify([1, ['r1']]));

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(JSON.stringify([2, ['r2']]));
      expect(didRender).toHaveBeenCalledTimes(4);
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(initIndexes).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCreateRelationships', () => {
      const initStore = vi.fn(() =>
        createStore().setTables({
          t1: {r1: {c1: `R1`}},
          t2: {r1: {c1: 'R2'}},
          T1: {R1: {C1: 1}, R2: {C1: 2}},
        }),
      );
      const initRelationships = vi.fn((store: Store, count) =>
        createRelationships(store).setRelationshipDefinition(
          'r1',
          `t${count}`,
          'T1',
          'c1',
        ),
      );
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore());
        const relationships = useCreateRelationships(
          store,
          (store) => initRelationships(store, count),
          [count],
        );
        return didRender(
          <>
            {JSON.stringify([count, relationships?.getRemoteRowId('r1', 'r1')])}
          </>,
        );
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(JSON.stringify([1, 'R1']));

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(JSON.stringify([2, 'R2']));
      expect(didRender).toHaveBeenCalledTimes(4);
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(initRelationships).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCreateQueries', () => {
      const initStore = vi.fn(() =>
        createStore().setTables({t1: {r1: {c1: 1}, r2: {c2: 2}}}),
      );
      const initQueries = vi.fn((store: Store, count) =>
        createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
          select(`c${count}`),
        ),
      );
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore());
        const queries = useCreateQueries(
          store,
          (store) => initQueries(store, count),
          [count],
        );
        return didRender(
          JSON.stringify([count, queries?.getResultTable('q1')]),
        );
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(JSON.stringify([1, {r1: {c1: 1}}]));

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(JSON.stringify([2, {r2: {c2: 2}}]));
      expect(didRender).toHaveBeenCalledTimes(4);
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(initQueries).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCreateCheckpoints', () => {
      const initStore = vi.fn(() =>
        createStore().setTables({t1: {r1: {c1: 1}}}),
      );
      const initCheckpoints = vi.fn((store: Store, count: number) => {
        const checkpoints = createCheckpoints(store);
        checkpoints.getStore().setCell('t1', 'r1', 'c1', count + 1);
        checkpoints.addCheckpoint(`checkpoint${count}`);
        return checkpoints;
      });
      const Test = ({count}: {count: number}) => {
        const store = useCreateStore(() => initStore());
        const checkpoints = useCreateCheckpoints(
          store,
          (store) => initCheckpoints(store, count),
          [count],
        );
        return didRender(
          <>
            {JSON.stringify([
              count,
              checkpoints?.getCheckpointIds(),
              checkpoints?.getCheckpoint('1'),
              checkpoints?.getCheckpoint('2'),
            ])}
          </>,
        );
      };

      const {container, rerender, unmount} = render(<Test count={1} />);
      expect(container.textContent).toEqual(
        JSON.stringify([1, [['0'], '1', []], 'checkpoint1', null]),
      );

      rerender(<Test count={2} />);
      expect(container.textContent).toEqual(
        JSON.stringify([
          2,
          [['0', '1'], '2', []],
          'checkpoint1',
          'checkpoint2',
        ]),
      );
      expect(didRender).toHaveBeenCalledTimes(4);
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(initCheckpoints).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCreatePersister, no then', async () => {
      let _persister: AnyPersister | undefined;
      tmp.setGracefulCleanup();
      const fileName = tmp.fileSync().name;
      const initStore = vi.fn(createStore);
      const createPersister = vi.fn((store: Store) => {
        _persister = createFilePersister(store, fileName);
        return _persister;
      });
      const Test = ({id}: {readonly id: number}) => {
        const store = useCreateStore(initStore);
        const persister = useCreatePersister(store, createPersister, [id]);
        const cell = useCell('t1', 'r1', 'c1', store);
        return didRender(JSON.stringify([id, persister?.getStats(), cell]));
      };

      const {container, rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {loads: 0, saves: 0}, null]),
      );
      await act(() => _persister?.load([{t1: {r1: {c1: 1}}}, {}]));
      expect(container.textContent).toEqual(
        JSON.stringify([1, {loads: 1, saves: 0}, 1]),
      );

      rerender(<Test id={2} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {loads: 0, saves: 0}, 1]),
      );
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(createPersister).toHaveBeenCalledTimes(2);
      expect(didRender).toHaveBeenCalledTimes(5);
      await _persister?.stopAutoLoad();
      await _persister?.stopAutoSave();

      unmount();
    });

    test('useCreatePersister, then, no destroy', async () => {
      let _persister: AnyPersister | undefined;
      tmp.setGracefulCleanup();
      const fileName = tmp.fileSync().name;
      const initStore = vi.fn(createStore);
      const createPersister = vi.fn((store: Store, id: number) => {
        if (id != 0) {
          _persister = createFilePersister(store, fileName);
          return _persister;
        }
      });
      const initPersister = vi.fn(async (persister: Persister, id: number) => {
        await persister.load([{t1: {r1: {c1: id}}}, {}]);
      });
      const Test = ({id}: {id: number}) => {
        const store = useCreateStore(initStore);
        const persister = useCreatePersister(
          store,
          (store) => createPersister(store, id),
          [id],
          (persister) => initPersister(persister, id),
          [id],
        );
        return didRender(JSON.stringify([id, persister?.getStats()]));
      };

      const {container, rerender, unmount} = render(<Test id={0} />);
      expect(container.textContent).toEqual(JSON.stringify([0, null]));

      rerender(<Test id={1} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {loads: 1, saves: 0}]),
      );

      rerender(<Test id={2} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {loads: 1, saves: 0}]),
      );
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(createPersister).toHaveBeenCalledTimes(3);
      expect(initPersister).toHaveBeenCalledTimes(2);
      expect(didRender).toHaveBeenCalledTimes(5);
      await _persister?.stopAutoLoad();
      await _persister?.stopAutoSave();

      unmount();
    });

    test('useCreatePersister, then, destroy', async () => {
      const persisters: AnyPersister[] = [];
      tmp.setGracefulCleanup();
      const initStore = vi.fn(createStore);
      const createPersister = vi.fn((store: Store, id: number) => {
        const fileName = tmp.fileSync().name;
        const persister = createFilePersister(store, fileName);
        persisters[id] = persister;
        return persister;
      });
      const initPersister = vi.fn(
        async (persister: AnyPersister, id: number) => {
          await persister.load([{t1: {r1: {c1: id}}}, {}]);
        },
      );
      const destroyPersister = vi.fn((persister: AnyPersister) => {
        expect(persisters).toContain(persister);
      });
      const Test = ({id}: {id: number}) => {
        const store = useCreateStore(initStore);
        const persister = useCreatePersister(
          store,
          (store) => createPersister(store, id),
          [id],
          (persister) => initPersister(persister, id),
          [id],
          destroyPersister,
        );
        return didRender(JSON.stringify([id, persister?.getStats()]));
      };

      const {container, rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {loads: 1, saves: 0}]),
      );

      rerender(<Test id={2} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {loads: 1, saves: 0}]),
      );
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(createPersister).toHaveBeenCalledTimes(2);
      expect(initPersister).toHaveBeenCalledTimes(2);
      expect(destroyPersister).toHaveBeenCalledTimes(1);
      expect(destroyPersister).toHaveBeenCalledWith(persisters[1]);
      expect(didRender).toHaveBeenCalledTimes(4);
      await Promise.all(
        persisters.map(async (persister) => {
          await persister.stopAutoLoad();
          await persister.stopAutoSave();
        }),
      );

      unmount();
    });

    test('useCreatePersister, undefined store', async () => {
      const Test = () => {
        const persister = useCreatePersister(undefined, (store: Store) =>
          createFilePersister(store, ''),
        );
        return didRender(JSON.stringify(persister?.getStats()));
      };

      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('useCreatePersister ignores stale resolutions', async () => {
      const persister1 = createTestPersister();
      const persister2 = createTestPersister();
      const resolvers: ((persister: TestPersister) => void)[] = [];
      const create = vi.fn(
        () =>
          new Promise<TestPersister>((resolve) => {
            resolvers.push(resolve);
          }),
      );
      const destroy1 = vi.fn();
      const destroy2 = vi.fn();
      let currentPersister: TestPersister | undefined;
      const Test = ({
        destroyId,
        id,
      }: {
        readonly destroyId: number;
        readonly id: number;
      }) => {
        currentPersister = useCreatePersister(
          store,
          create,
          [id],
          undefined,
          [],
          destroyId == 1 ? destroy1 : destroy2,
          [destroyId],
        );
        return null;
      };

      const {rerender, unmount} = render(<Test destroyId={1} id={1} />);
      await act(pause);
      rerender(<Test destroyId={1} id={2} />);
      await act(pause);

      await act(async () => resolvers[1](persister2));
      expect(currentPersister).toBe(persister2);
      await act(async () => resolvers[0](persister1));
      expect(currentPersister).toBe(persister2);
      expect(persister1.destroy).toHaveBeenCalledTimes(1);
      expect(persister2.destroy).not.toHaveBeenCalled();

      rerender(<Test destroyId={2} id={2} />);
      await act(pause);
      expect(create).toHaveBeenCalledTimes(2);
      expect(currentPersister).toBe(persister2);
      expect(persister2.destroy).not.toHaveBeenCalled();

      unmount();
      expect(persister2.destroy).toHaveBeenCalledTimes(1);
      await act(pause);
      expect(destroy1).toHaveBeenCalledWith(persister1);
      expect(destroy2).toHaveBeenCalledWith(persister2);
    });

    test('useCreatePersister clears while replacement is pending', async () => {
      const persister1 = createTestPersister();
      const persister2 = createTestPersister();
      const resolvers: ((persister: TestPersister) => void)[] = [];
      const create = vi.fn(
        () =>
          new Promise<TestPersister>((resolve) => {
            resolvers.push(resolve);
          }),
      );
      let currentPersister: TestPersister | undefined;
      const Test = ({id}: {readonly id: number}) => {
        currentPersister = useCreatePersister(store, create, [id]);
        return null;
      };

      const {rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      await act(async () => resolvers[0](persister1));
      expect(currentPersister).toBe(persister1);

      rerender(<Test id={2} />);
      await act(pause);
      expect(currentPersister).toBeUndefined();
      expect(persister1.destroy).toHaveBeenCalledTimes(1);

      await act(async () => resolvers[1](persister2));
      expect(currentPersister).toBe(persister2);

      unmount();
    });

    test('useCreatePersister waits for replacement cleanup', async () => {
      const persister1 = createTestPersister();
      const persister2 = createTestPersister();
      let releaseDestroy = () => {};
      const destroyGate = new Promise<void>(
        (resolve) => (releaseDestroy = resolve),
      );
      persister1.destroy.mockReturnValue(destroyGate);
      const create = vi.fn(() => persister2).mockReturnValueOnce(persister1);
      let currentPersister: TestPersister | undefined;
      const Test = ({id}: {readonly id: number}) => {
        currentPersister = useCreatePersister(store, create, [id]);
        return null;
      };

      const {rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(currentPersister).toBe(persister1);

      rerender(<Test id={2} />);
      await act(pause);
      expect(currentPersister).toBeUndefined();
      expect(create).toHaveBeenCalledTimes(1);

      releaseDestroy();
      await act(pause);
      expect(currentPersister).toBe(persister2);
      expect(create).toHaveBeenCalledTimes(2);

      unmount();
    });

    // eslint-disable-next-line max-len
    test('useCreatePersister recovers from failed replacement cleanup', async () => {
      const persister1 = createTestPersister();
      const persister2 = createTestPersister();
      const error = new Error('destroy');
      persister1.destroy.mockRejectedValue(error);
      const create = vi.fn(() => persister2).mockReturnValueOnce(persister1);
      let currentPersister: TestPersister | undefined;
      const Test = ({id}: {readonly id: number}) => {
        currentPersister = useCreatePersister(store, create, [id]);
        return null;
      };

      const {rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(currentPersister).toBe(persister1);

      rerender(<Test id={2} />);
      await act(pause);
      expect(create).toHaveBeenCalledTimes(2);
      expect(currentPersister).toBe(persister2);

      unmount();
    });

    test('useCreatePersister recovers from failed creation', async () => {
      const persister = createTestPersister();
      const create = vi
        .fn()
        .mockRejectedValueOnce(new Error('create'))
        .mockResolvedValueOnce(persister);
      let currentPersister: TestPersister | undefined;
      const Test = ({id}: {readonly id: number}) => {
        currentPersister = useCreatePersister(store, create, [id]);
        return null;
      };

      const {rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(currentPersister).toBeUndefined();

      rerender(<Test id={2} />);
      await act(pause);
      expect(currentPersister).toBe(persister);

      unmount();
    });

    test('useCreatePersister destroys post-unmount resolution', async () => {
      const persister = createTestPersister();
      let resolveCreate: (persister: TestPersister) => void;
      let resolveDestroy: () => void;
      persister.destroy.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveDestroy = resolve;
          }),
      );
      const create = vi.fn(
        () =>
          new Promise<TestPersister>((resolve) => {
            resolveCreate = resolve;
          }),
      );
      const destroy = vi.fn();
      const Test = () => {
        useCreatePersister(store, create, [], undefined, [], destroy);
        return null;
      };

      const {unmount} = render(<Test />);
      await act(pause);
      unmount();
      await act(async () => resolveCreate!(persister));

      expect(persister.destroy).toHaveBeenCalledTimes(1);
      expect(destroy).not.toHaveBeenCalled();
      resolveDestroy!();
      await act(pause);
      expect(destroy).toHaveBeenCalledWith(persister);
    });

    test('useCreateSynchronizer, no destroy', async () => {
      let _synchronizer: Synchronizer | undefined;
      const initStore = vi.fn(() => createMergeableStore('s1'));
      const createSynchronizer = vi.fn(async (store: MergeableStore) => {
        _synchronizer = createLocalSynchronizer(store);
        await _synchronizer.load([{t1: {r1: {c1: 1}}}, {}]);
        return _synchronizer;
      });
      const Test = ({id}: {readonly id: number}) => {
        const store = useCreateMergeableStore(initStore);
        const synchronizer = useCreateSynchronizer(store, createSynchronizer, [
          id,
        ]);
        const cell = useCell('t1', 'r1', 'c1', store);
        return didRender(JSON.stringify([id, synchronizer?.getStats(), cell]));
      };

      const {container, rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {loads: 1, saves: 0}, 1]),
      );

      rerender(<Test id={2} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {loads: 1, saves: 0}, 1]),
      );
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(createSynchronizer).toHaveBeenCalledTimes(2);
      expect(didRender).toHaveBeenCalledTimes(5);
      await _synchronizer?.stopAutoLoad();
      await _synchronizer?.stopAutoSave();

      unmount();
    });

    test('useCreateSynchronizer, destroy', async () => {
      const synchronizers: Synchronizer[] = [];
      const initStore = vi.fn(() => createMergeableStore('s1'));
      const createSynchronizer = vi.fn(
        async (store: MergeableStore, id: number) => {
          const synchronizer = createLocalSynchronizer(store);
          await synchronizer.load([{t1: {r1: {c1: id}}}, {}]);
          synchronizers[id] = synchronizer;
          return synchronizer;
        },
      );
      const destroySynchronizer = vi.fn((synchronizer: Synchronizer) => {
        expect(synchronizers).toContain(synchronizer);
      });
      const Test = ({id}: {id: number}) => {
        const store = useCreateMergeableStore(initStore);
        const synchronizer = useCreateSynchronizer(
          store,
          (store) => createSynchronizer(store, id),
          [id],
          destroySynchronizer,
        );
        return didRender(JSON.stringify([id, synchronizer?.getStats()]));
      };

      const {container, rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([1, {loads: 1, saves: 0}]),
      );

      rerender(<Test id={2} />);
      await act(pause);
      expect(container.textContent).toEqual(
        JSON.stringify([2, {loads: 1, saves: 0}]),
      );
      expect(initStore).toHaveBeenCalledTimes(1);
      expect(createSynchronizer).toHaveBeenCalledTimes(2);
      expect(destroySynchronizer).toHaveBeenCalledTimes(1);
      expect(destroySynchronizer).toHaveBeenCalledWith(synchronizers[1]);
      expect(didRender).toHaveBeenCalledTimes(4);
      await Promise.all(
        synchronizers.map(async (synchronizer) => {
          await synchronizer.stopAutoLoad();
          await synchronizer.stopAutoSave();
        }),
      );

      unmount();
    });

    test('useCreateSynchronizer, undefined store', async () => {
      const Test = () => {
        const synchronizer = useCreateSynchronizer(
          undefined,
          async (store: MergeableStore) => createLocalSynchronizer(store),
        );
        return didRender(JSON.stringify(synchronizer?.getStats()));
      };

      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('useCreateSynchronizer ignores stale resolutions', async () => {
      const synchronizer1 = createTestSynchronizer();
      const synchronizer2 = createTestSynchronizer();
      const resolvers: ((synchronizer: TestSynchronizer) => void)[] = [];
      const create = vi.fn(
        () =>
          new Promise<TestSynchronizer>((resolve) => {
            resolvers.push(resolve);
          }),
      );
      let currentSynchronizer: TestSynchronizer | undefined;
      const Test = ({id}: {readonly id: number}) => {
        currentSynchronizer = useCreateSynchronizer(
          store as MergeableStore,
          create,
          [id],
        );
        return null;
      };

      const {rerender, unmount} = render(<Test id={1} />);
      await act(pause);
      rerender(<Test id={2} />);
      await act(pause);

      await act(async () => resolvers[1](synchronizer2));
      expect(currentSynchronizer).toBe(synchronizer2);
      await act(async () => resolvers[0](synchronizer1));
      expect(currentSynchronizer).toBe(synchronizer2);
      expect(synchronizer1.destroy).toHaveBeenCalledTimes(1);
      expect(synchronizer2.destroy).not.toHaveBeenCalled();

      unmount();
      expect(synchronizer2.destroy).toHaveBeenCalledTimes(1);
    });

    test('useCreateSynchronizer destroys post-unmount resolution', async () => {
      const synchronizer = createTestSynchronizer();
      let resolveCreate: (synchronizer: TestSynchronizer) => void;
      let resolveDestroy: () => void;
      synchronizer.destroy.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveDestroy = resolve;
          }),
      );
      const create = vi.fn(
        () =>
          new Promise<TestSynchronizer>((resolve) => {
            resolveCreate = resolve;
          }),
      );
      const destroy = vi.fn();
      const Test = () => {
        useCreateSynchronizer(createMergeableStore(), create, [], destroy);
        return null;
      };

      const {unmount} = render(<Test />);
      await act(pause);
      unmount();
      await act(async () => resolveCreate!(synchronizer));

      expect(synchronizer.destroy).toHaveBeenCalledTimes(1);
      expect(destroy).not.toHaveBeenCalled();
      resolveDestroy!();
      await act(pause);
      expect(destroy).toHaveBeenCalledWith(synchronizer);
    });
  });

  describe('Context Hooks', () => {
    test('useStore', () => {
      const Test = () => didRender(JSON.stringify(useStore()?.getTables()));

      const {container, unmount} = render(
        <Provider store={store}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 1}}}),
      );
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useProvideStore', () => {
      const Test = () => didRender(JSON.stringify(useStore('s')?.getTables()));
      const ProvideStore1 = () => {
        useProvideStore('s', store);
        return null;
      };
      const ProvideStore2 = () => {
        useProvideStore(
          's',
          useCreateStore(() => createStore().setCell('t2', 'r2', 'c2', 2)),
        );
        return null;
      };
      const {container, rerender, unmount} = render(
        <Provider>
          <Test />
        </Provider>,
      );

      expect(container.textContent).toEqual('');
      expect(didRender).toHaveBeenCalledTimes(1);

      rerender(
        <Provider>
          <Test />
          <ProvideStore1 />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 1}}}),
      );
      expect(didRender).toHaveBeenCalledTimes(3);

      rerender(
        <Provider>
          <Test />
          <ProvideStore1 />
          <ProvideStore1 />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 1}}}),
      );
      expect(didRender).toHaveBeenCalledTimes(4);

      rerender(
        <Provider>
          <Test />
          <ProvideStore2 />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        JSON.stringify({t2: {r2: {c2: 2}}}),
      );
      expect(didRender).toHaveBeenCalledTimes(6);

      rerender(
        <Provider>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('');
      expect(didRender).toHaveBeenCalledTimes(8);

      unmount();
    });

    test('useIndexes', () => {
      const Test = () =>
        didRender(JSON.stringify(useIndexes()?.getSliceRowIds('i1', '1')));
      const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
      const {container, unmount} = render(
        <Provider indexes={indexes}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1']));
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useRelationships', () => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      const Test = () =>
        didRender(
          JSON.stringify(useRelationships()?.getRemoteRowId('r1', 'r1')),
        );
      const relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const {container, unmount} = render(
        <Provider relationships={relationships}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify('R1'));
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useQueries', () => {
      const Test = () =>
        didRender(JSON.stringify(useQueries()?.getResultTable('q1')));
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const {container, unmount} = render(
        <Provider queries={queries}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useCheckpoints', () => {
      const Test = () =>
        didRender(JSON.stringify(useCheckpoints()?.getCheckpointIds()));
      const checkpoints = createCheckpoints(store);
      store.setTables({t1: {r1: {c1: 2}}});
      checkpoints.addCheckpoint();
      const {container, unmount} = render(
        <Provider checkpoints={checkpoints}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify([['0'], '1', []]));
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useStores', () => {
      const Test = () =>
        didRender(
          <>
            {JSON.stringify([
              Object.keys(useStores()),
              useStores()?.['store1']?.getTables(),
            ])}
          </>,
        );
      const store1 = createStore().setTables({t1: {r1: {c1: 2}}});
      const store2 = createStore();
      const {container, rerender, unmount} = render(
        <Provider>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('[[],null]');
      rerender(
        <Provider storesById={{store1, store2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        '[["store1","store2"],{"t1":{"r1":{"c1":2}}}]',
      );
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useStoreIds', () => {
      const Test = () => didRender(JSON.stringify(useStoreIds()));
      const store1 = createStore();
      const store2 = createStore();
      const {container, unmount} = render(
        <Provider storesById={{store1, store2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('["store1","store2"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useMetricsIds', () => {
      const Test = () => didRender(JSON.stringify(useMetricsIds()));
      const metrics1 = createMetrics(createStore());
      const metrics2 = createMetrics(createStore());
      const {container, unmount} = render(
        <Provider metricsById={{metrics1, metrics2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('["metrics1","metrics2"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useIndexesIds', () => {
      const Test = () => didRender(JSON.stringify(useIndexesIds()));
      const indexes1 = createIndexes(createStore());
      const indexes2 = createIndexes(createStore());
      const {container, unmount} = render(
        <Provider indexesById={{indexes1, indexes2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('["indexes1","indexes2"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useRelationshipsIds', () => {
      const Test = () => didRender(JSON.stringify(useRelationshipsIds()));
      const relationships1 = createRelationships(createStore());
      const relationships2 = createRelationships(createStore());
      const {container, unmount} = render(
        <Provider relationshipsById={{relationships1, relationships2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        '["relationships1","relationships2"]',
      );
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useQueriesIds', () => {
      const Test = () => didRender(JSON.stringify(useQueriesIds()));
      const queries1 = createQueries(createStore());
      const queries2 = createQueries(createStore());
      const {container, unmount} = render(
        <Provider queriesById={{queries1, queries2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('["queries1","queries2"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useCheckpointsIds', () => {
      const Test = () => didRender(JSON.stringify(useCheckpointsIds()));
      const checkpoints1 = createCheckpoints(createStore());
      const checkpoints2 = createCheckpoints(createStore());
      const {container, unmount} = render(
        <Provider checkpointsById={{checkpoints1, checkpoints2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('["checkpoints1","checkpoints2"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('usePersisterIds', () => {
      const Test = () => didRender(JSON.stringify(usePersisterIds()));
      const persister1 = createFilePersister(
        createStore(),
        tmp.fileSync().name,
      );
      const persister2 = createFilePersister(
        createStore(),
        tmp.fileSync().name,
      );
      const {container, unmount} = render(
        <Provider persistersById={{persister1, persister2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('["persister1","persister2"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useSynchronizerIds', () => {
      const Test = () => didRender(JSON.stringify(useSynchronizerIds()));
      const synchronizer1 = createLocalSynchronizer(createMergeableStore());
      const synchronizer2 = createLocalSynchronizer(createMergeableStore());
      const {container, unmount} = render(
        <Provider synchronizersById={{synchronizer1, synchronizer2}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        '["synchronizer1","synchronizer2"]',
      );
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });

    test('useProvideMetrics', () => {
      const Test = () =>
        didRender(JSON.stringify(useMetrics('m')?.getMetric('m1')));
      const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
      const ProvideMetrics = () => {
        useProvideMetrics('m', metrics);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvideMetrics />
        </Provider>,
      );
      expect(container.textContent).toEqual('1');
      expect(didRender).toHaveBeenCalledTimes(2);
      unmount();
    });

    test('useProvideIndexes', () => {
      const Test = () =>
        didRender(JSON.stringify(useIndexes('i')?.getSliceRowIds('i1', '1')));
      const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
      const ProvideIndexes = () => {
        useProvideIndexes('i', indexes);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvideIndexes />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1']));
      expect(didRender).toHaveBeenCalledTimes(2);
      unmount();
    });

    test('useProvideRelationships', () => {
      store.setTables({
        t1: {r1: {c1: 'R1'}},
        T1: {R1: {C1: 1}},
      });
      const Test = () =>
        didRender(
          JSON.stringify(useRelationships('rel')?.getRemoteRowId('r1', 'r1')),
        );
      const relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const ProvideRelationships = () => {
        useProvideRelationships('rel', relationships);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvideRelationships />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify('R1'));
      expect(didRender).toHaveBeenCalledTimes(2);
      unmount();
    });

    test('useProvideQueries', () => {
      const Test = () =>
        didRender(JSON.stringify(useQueries('q')?.getResultTable('q1')));
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const ProvideQueries = () => {
        useProvideQueries('q', queries);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvideQueries />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));
      expect(didRender).toHaveBeenCalledTimes(2);
      unmount();
    });

    test('useProvideCheckpoints', () => {
      const Test = () =>
        didRender(JSON.stringify(useCheckpoints('cp')?.getCheckpointIds()));
      const checkpoints = createCheckpoints(store);
      store.setTables({t1: {r1: {c1: 2}}});
      checkpoints.addCheckpoint();
      const ProvideCheckpoints = () => {
        useProvideCheckpoints('cp', checkpoints);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvideCheckpoints />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify([['0'], '1', []]));
      expect(didRender).toHaveBeenCalledTimes(2);
      unmount();
    });

    test('useProvidePersister', async () => {
      tmp.setGracefulCleanup();
      const tmpFile = tmp.fileSync();
      const persister = createFilePersister(store, tmpFile.name);
      const Test = () =>
        didRender(JSON.stringify(usePersisterStatus(persister)));
      const ProvidePersister = () => {
        useProvidePersister('p', persister);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvidePersister />
        </Provider>,
      );
      expect(container.textContent).toEqual('0');
      expect(didRender).toHaveBeenCalledTimes(2);
      await persister.stopAutoLoad();
      await persister.stopAutoSave();
      unmount();
    });

    test('useProvideSynchronizer', async () => {
      const mergeableStore = createMergeableStore('s1');
      const synchronizer = createLocalSynchronizer(mergeableStore);
      const Test = () =>
        didRender(JSON.stringify(useSynchronizerStatus(synchronizer)));
      const ProvideSynchronizer = () => {
        useProvideSynchronizer('syn', synchronizer);
        return null;
      };
      const {container, unmount} = render(
        <Provider>
          <Test />
          <ProvideSynchronizer />
        </Provider>,
      );
      expect(container.textContent).toEqual('0');
      expect(didRender).toHaveBeenCalledTimes(2);
      await synchronizer.destroy();
      unmount();
    });

    test('No context', () => {
      const Test = () =>
        didRender(
          <>
            {JSON.stringify(useStoreIds())}
            {JSON.stringify(useMetricsIds())}
            {JSON.stringify(useIndexesIds())}
            {JSON.stringify(useRelationshipsIds())}
            {JSON.stringify(useQueriesIds())}
          </>,
        );

      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('[][][][][]');
      expect(didRender).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe('Read Hooks', () => {
    test('return same reference if no change', () => {
      let previous: Tables;
      let changed = 0;
      const Test = () => {
        const current = useTables(store);
        if (current != previous) {
          previous = current;
          changed++;
        }
        return didRender(<>Test</>);
      };

      const {rerender, unmount} = render(<Test />);
      expect(changed).toEqual(1);
      expect(didRender).toHaveBeenCalledTimes(1);
      rerender(<Test />);
      expect(changed).toEqual(1);
      expect(didRender).toHaveBeenCalledTimes(2);
      act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(changed).toEqual(2);
      expect(didRender).toHaveBeenCalledTimes(3);
      rerender(<Test />);
      expect(changed).toEqual(2);
      expect(didRender).toHaveBeenCalledTimes(4);

      unmount();
    });

    test('useTablesState', () => {
      const Test = () => {
        const [tables, setTables] = useTablesState(store);
        return (
          <span>
            {JSON.stringify(tables)}
            <button onClick={() => setTables({...tables, t2: {r1: {c1: 2}}})} />
          </span>
        );
      };

      store.setTables({t1: {r1: {c1: 1}}});
      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual(
        '<span>{"t1":{"r1":{"c1":1}}}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        // eslint-disable-next-line max-len
        '<span>{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2}}}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        // eslint-disable-next-line max-len
        '<span>{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2}}}<button></button></span>',
      );

      unmount();
    });

    test('useTable re-render for array or object', () => {
      store
        .setTablesSchema({t1: {c1: {type: 'array'}, c2: {type: 'object'}}})
        .setRow('t1', 'r1', {c1: [1, 2, 3], c2: {k: 'v'}});
      const Test = () => didRender(JSON.stringify(useTable('t1', store)));
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual(
        JSON.stringify({r1: {c1: [1, 2, 3], c2: {k: 'v'}}}),
      );

      act(() => store.setRow('t1', 'r1', {c1: [1, 2, 3], c2: {k: 'v'}}));
      expect(container.textContent).toEqual(
        JSON.stringify({r1: {c1: [1, 2, 3], c2: {k: 'v'}}}),
      );
      expect(didRender).toHaveBeenCalledTimes(1);

      act(() => store.setCell('t1', 'r1', 'c1', [9]));
      expect(container.textContent).toEqual(
        JSON.stringify({r1: {c1: [9], c2: {k: 'v'}}}),
      );
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useTableState', () => {
      const Test = () => {
        const [table, setTable] = useTableState('t1', store);
        return (
          <span>
            {JSON.stringify(table)}
            <button onClick={() => setTable({...table, r2: {c1: 2}})} />
          </span>
        );
      };

      store.setTable('t1', {r1: {c1: 1}});
      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual(
        '<span>{"r1":{"c1":1}}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>{"r1":{"c1":1},"r2":{"c1":2}}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>{"r1":{"c1":1},"r2":{"c1":2}}<button></button></span>',
      );

      unmount();
    });

    test('useSortedRowIds, object arg', () => {
      const Test = ({
        tableId,
        cellId,
        descending,
        offset,
        limit,
      }: {
        tableId: Id;
        cellId: Id;
        descending: boolean;
        offset: number;
        limit: number | undefined;
      }) =>
        didRender(
          <>
            {JSON.stringify(
              useSortedRowIds(
                {tableId, cellId, descending, offset, limit},
                store,
              ),
            )}
          </>,
        );
      expect(store.getListenerStats().sortedRowIds).toEqual(0);
      const {container, rerender, unmount} = render(
        <Test
          tableId="t0"
          cellId="c0"
          descending={false}
          offset={0}
          limit={undefined}
        />,
      );

      expect(store.getListenerStats().sortedRowIds).toEqual(1);
      expect(container.textContent).toEqual(JSON.stringify([]));

      rerender(
        <Test
          tableId="t1"
          cellId="c1"
          descending={false}
          offset={0}
          limit={undefined}
        />,
      );

      expect(store.getListenerStats().sortedRowIds).toEqual(1);
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      rerender(
        <Test
          tableId="t2"
          cellId="c1"
          descending={true}
          offset={0}
          limit={2}
        />,
      );

      expect(store.getListenerStats().sortedRowIds).toEqual(1);
      expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

      act(() => store.setRow('t2', 'r5', {c1: 5}));
      expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

      act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));
      rerender(<button />);

      expect(store.getListenerStats().sortedRowIds).toEqual(0);
      expect(didRender).toHaveBeenCalledTimes(6);

      unmount();
    });

    test('useSortedRowIds, object arg, default descending and offset', () => {
      const Test = () =>
        didRender(
          <>
            {JSON.stringify(
              useSortedRowIds({tableId: 't1', cellId: 'c1'}, store),
            )}
          </>,
        );
      store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}}});
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));
      expect(didRender).toHaveBeenCalledTimes(1);
      unmount();
    });

    test('useSortedRowIds, object arg, custom sorter', () => {
      const numericSorter = (sortKey1: any, sortKey2: any) =>
        Number(sortKey1) - Number(sortKey2);
      ['1', '10', '0', '2'].forEach((rowId) =>
        store.setRow('t2', rowId, {c1: true}),
      );
      const Test = () =>
        didRender(
          <>
            {JSON.stringify(
              useSortedRowIds({tableId: 't2', sorter: numericSorter}, store),
            )}
            {JSON.stringify(
              useSortedRowIds(
                't2',
                undefined,
                undefined,
                undefined,
                undefined,
                numericSorter,
                store,
              ),
            )}
          </>,
        );
      const {container, unmount} = render(<Test />);

      expect(container.textContent).toEqual(
        JSON.stringify(['0', '1', '2', '10']) +
          JSON.stringify(['0', '1', '2', '10']),
      );
      act(() => store.setRow('t2', '3', {c1: true}));
      expect(container.textContent).toEqual(
        JSON.stringify(['0', '1', '2', '3', '10']) +
          JSON.stringify(['0', '1', '2', '3', '10']),
      );

      unmount();
    });

    test('useRow re-render for array or object', () => {
      store
        .setTablesSchema({t1: {c1: {type: 'array'}, c2: {type: 'object'}}})
        .setRow('t1', 'r1', {c1: [1, 2, 3], c2: {k: 'v'}});
      const Test = () => didRender(JSON.stringify(useRow('t1', 'r1', store)));
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual(
        JSON.stringify({c1: [1, 2, 3], c2: {k: 'v'}}),
      );

      act(() => store.setRow('t1', 'r1', {c1: [1, 2, 3], c2: {k: 'v'}}));
      expect(container.textContent).toEqual(
        JSON.stringify({c1: [1, 2, 3], c2: {k: 'v'}}),
      );
      expect(didRender).toHaveBeenCalledTimes(1);

      act(() => store.setCell('t1', 'r1', 'c1', [9]));
      expect(container.textContent).toEqual(
        JSON.stringify({c1: [9], c2: {k: 'v'}}),
      );
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCell with object', () => {
      store
        .setTablesSchema({t1: {c1: {type: 'object'}}})
        .setCell('t1', 'r1', 'c1', {k: 'v'});
      const Test = () =>
        didRender(JSON.stringify(useCell('t1', 'r1', 'c1', store)));
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('{"k":"v"}');

      act(() => store.setCell('t1', 'r1', 'c1', {k: 'v'}));
      expect(container.textContent).toEqual('{"k":"v"}');
      expect(didRender).toHaveBeenCalledTimes(1);

      act(() => store.setCell('t1', 'r1', 'c1', {k: 'w'}));
      expect(container.textContent).toEqual('{"k":"w"}');
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCell with array', () => {
      store
        .setTablesSchema({t1: {c1: {type: 'array'}}})
        .setCell('t1', 'r1', 'c1', ['a', 'b']);
      const Test = () =>
        didRender(JSON.stringify(useCell('t1', 'r1', 'c1', store)));
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('["a","b"]');

      act(() => store.setCell('t1', 'r1', 'c1', ['a', 'b']));
      expect(container.textContent).toEqual('["a","b"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      act(() => store.setCell('t1', 'r1', 'c1', ['a', 'c']));
      expect(container.textContent).toEqual('["a","c"]');
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useCellState', () => {
      const Test = () => {
        const [cell, setCell] = useCellState('t1', 'r1', 'c1', store);
        return (
          <span>
            {cell as string | number | boolean}
            <button onClick={() => setCell(((cell as number) ?? 0) + 1)} />
          </span>
        );
      };

      store.setCell('t1', 'r1', 'c1', 0);
      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual('<span>0<button></button></span>');

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<span>1<button></button></span>');

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<span>2<button></button></span>');

      unmount();
    });

    test('useRowState', () => {
      const Test = () => {
        const [row, setRow] = useRowState('t1', 'r1', store);
        return (
          <span>
            {JSON.stringify(row)}
            <button
              onClick={() =>
                setRow({...row, c1: ((row.c1 as number) ?? 0) + 1})
              }
            />
          </span>
        );
      };

      store.setRow('t1', 'r1', {c1: 0, c2: 'a'});
      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual(
        '<span>{"c1":0,"c2":"a"}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>{"c1":1,"c2":"a"}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>{"c1":2,"c2":"a"}<button></button></span>',
      );

      unmount();
    });

    test('useValuesState', () => {
      const Test = () => {
        const [values, setValues] = useValuesState(store);
        return (
          <span>
            {JSON.stringify(values)}
            <button onClick={() => setValues({...values, v2: 2})} />
          </span>
        );
      };

      store.setValues({v1: 1});
      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual(
        '<span>{"v1":1}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>{"v1":1,"v2":2}<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>{"v1":1,"v2":2}<button></button></span>',
      );

      unmount();
    });

    test('useValue with object', () => {
      store.setValuesSchema({v1: {type: 'object'}}).setValue('v1', {k: 'v'});
      const Test = () => didRender(JSON.stringify(useValue('v1', store)));
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('{"k":"v"}');

      act(() => store.setValue('v1', {k: 'v'}));
      expect(container.textContent).toEqual('{"k":"v"}');
      expect(didRender).toHaveBeenCalledTimes(1);

      act(() => store.setValue('v1', {k: 'w'}));
      expect(container.textContent).toEqual('{"k":"w"}');
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useValue with array', () => {
      store.setValuesSchema({v1: {type: 'array'}}).setValue('v1', ['a', 'b']);
      const Test = () => didRender(JSON.stringify(useValue('v1', store)));
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('["a","b"]');

      act(() => store.setValue('v1', ['a', 'b']));
      expect(container.textContent).toEqual('["a","b"]');
      expect(didRender).toHaveBeenCalledTimes(1);

      act(() => store.setValue('v1', ['a', 'c']));
      expect(container.textContent).toEqual('["a","c"]');
      expect(didRender).toHaveBeenCalledTimes(2);

      unmount();
    });

    test('useValueState', () => {
      const Test = () => {
        const [value, setValue] = useValueState('v1', store);
        return (
          <span>
            {JSON.stringify(value)}
            <button onClick={() => setValue(!value)} />
          </span>
        );
      };

      store.setValues({v1: false});
      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual(
        '<span>false<button></button></span>',
      );

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<span>true<button></button></span>');

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual(
        '<span>false<button></button></span>',
      );

      unmount();
    });

    test('useParamValues', () => {
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1, p2: 'test'},
      );
      const Test = ({queryId}: {queryId: Id}) =>
        didRender(JSON.stringify(useParamValues(queryId, queries)));
      const {container, rerender, unmount} = render(<Test queryId="q0" />);

      expect(container.textContent).toEqual('{}');

      rerender(<Test queryId="q1" />);

      expect(container.textContent).toEqual('{"p1":1,"p2":"test"}');

      act(() => queries.setParamValue('q1', 'p1', 2));
      expect(container.textContent).toEqual('{"p1":2,"p2":"test"}');

      act(() => queries.setParamValues('q1', {p1: 3, p2: 'updated'}));
      expect(container.textContent).toEqual('{"p1":3,"p2":"updated"}');

      act(() => queries.delQueryDefinition('q1'));
      expect(container.textContent).toEqual('{}');
      rerender(<button />);

      expect(didRender).toHaveBeenCalledTimes(5);

      unmount();
    });

    test('useParamValue', () => {
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1, p2: 'test'},
      );
      const Test = ({queryId, paramId}: {queryId: Id; paramId: Id}) =>
        didRender(useParamValue(queryId, paramId, queries));
      const {container, rerender, unmount} = render(
        <Test queryId="q0" paramId="p0" />,
      );

      expect(container.textContent).toEqual('');

      rerender(<Test queryId="q1" paramId="p1" />);

      expect(container.textContent).toEqual('1');

      act(() => queries.setParamValue('q1', 'p1', 2));
      expect(container.textContent).toEqual('2');

      rerender(<Test queryId="q1" paramId="p2" />);

      expect(container.textContent).toEqual('test');

      act(() => queries.setParamValue('q1', 'p2', 'updated'));
      expect(container.textContent).toEqual('updated');

      act(() => queries.delQueryDefinition('q1'));
      expect(container.textContent).toEqual('');
      rerender(<button />);

      expect(didRender).toHaveBeenCalledTimes(6);

      unmount();
    });

    test('useParamValue with array changes', () => {
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where((getTableCell) => {
            const p = param('p1');
            return Array.isArray(p)
              ? (p as string[]).includes(getTableCell('c1') as string)
              : getTableCell('c1') === p;
          });
        },
        {p1: 'a'},
      );
      const Test = ({queryId, paramId}: {queryId: Id; paramId: Id}) =>
        didRender(JSON.stringify(useParamValue(queryId, paramId, queries)));
      const {container, unmount} = render(<Test queryId="q1" paramId="p1" />);

      expect(container.textContent).toEqual('"a"');

      act(() => queries.setParamValue('q1', 'p1', ['a', 'c']));
      expect(container.textContent).toEqual('["a","c"]');

      act(() => queries.setParamValue('q1', 'p1', ['b', 'd']));
      expect(container.textContent).toEqual('["b","d"]');

      act(() => queries.setParamValue('q1', 'p1', 'e'));
      expect(container.textContent).toEqual('"e"');

      expect(didRender).toHaveBeenCalledTimes(4);

      unmount();
    });

    test('useSetParamValueCallback', () => {
      const queries = createQueries(store);
      queries.setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1},
      );

      const then = vi.fn((_queries: any, _paramValue: any) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

      const Test = ({
        multiplier,
        then,
      }: {
        readonly multiplier: number;
        readonly then: (queries: any, paramValue: any) => void;
      }) => {
        const handler = useSetParamValueCallback<MouseEvent<HTMLButtonElement>>(
          'q1',
          'p1',
          (e) => e.screenX * multiplier,
          [multiplier],
          queries,
          then,
        );
        handlers[multiplier] = handler;
        return <button onClick={handler} />;
      };

      const {getByRole, rerender, unmount} = render(
        <Test multiplier={2} then={then} />,
      );

      act(() => store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 3}}}));
      expect(queries.getResultTable('q1')).toEqual({r1: {c1: 1}});

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(queries.getResultTable('q1')).toEqual({r2: {c1: 2}});
      expect(then).toHaveBeenCalledWith(queries, 2);

      rerender(<Test multiplier={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(queries.getResultTable('q1')).toEqual({r3: {c1: 3}});
      expect(then).toHaveBeenCalledWith(queries, 3);

      unmount();
    });

    test('useSetParamValueCallback, parameterized Ids', () => {
      const queries = createQueries(store);
      queries
        .setQueryDefinition(
          'q1',
          't1',
          ({select, where, param}) => {
            select('c1');
            where('c1', param('p1') as Cell);
          },
          {p1: 1},
        )
        .setQueryDefinition(
          'q2',
          't1',
          ({select, where, param}) => {
            select('c1');
            where('c1', param('p2') as Cell);
          },
          {p2: 1},
        );

      const then = vi.fn((_queries: any, _paramValue: any) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

      const Test = ({
        multiplier,
        then,
      }: {
        readonly multiplier: number;
        readonly then: (queries: any, paramValue: any) => void;
      }) => {
        const handler = useSetParamValueCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 'q' + e.screenY,
          (e) => 'p' + e.screenY,
          (e) => e.screenX * multiplier,
          [multiplier],
          queries,
          then,
        );
        handlers[multiplier] = handler;
        return <button onClick={handler} />;
      };

      const {getByRole, rerender, unmount} = render(
        <Test multiplier={2} then={then} />,
      );

      act(() => store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 3}}}));

      fireEvent.click(getByRole('button'), {screenX: 1, screenY: 1});
      expect(queries.getResultTable('q1')).toEqual({r2: {c1: 2}});
      expect(then).toHaveBeenCalledWith(queries, 2);

      fireEvent.click(getByRole('button'), {screenX: 1, screenY: 2});
      expect(queries.getResultTable('q2')).toEqual({r2: {c1: 2}});
      expect(then).toHaveBeenCalledWith(queries, 2);

      rerender(<Test multiplier={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useParamValueState', () => {
      const queries = createQueries(store);
      queries.setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1},
      );

      const Test = () => {
        const [paramValue, setParamValue] = useParamValueState(
          'q1',
          'p1',
          queries,
        );
        return (
          <button onClick={() => setParamValue(2)}>
            {JSON.stringify(paramValue)}
          </button>
        );
      };

      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual('<button>1</button>');

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<button>2</button>');

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<button>2</button>');

      unmount();
    });

    test('useSetParamValuesCallback', () => {
      const queries = createQueries(store);
      queries.setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where(
            (getCell) => (getCell('c1') as number) >= (param('min') as number),
          );
          where(
            (getCell) => (getCell('c1') as number) <= (param('max') as number),
          );
        },
        {min: 3, max: 5},
      );

      const then = vi.fn((_queries: any, _paramValues: any) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

      const Test = ({
        multiplier,
        then,
      }: {
        readonly multiplier: number;
        readonly then: (queries: any, paramValues: any) => void;
      }) => {
        const handler = useSetParamValuesCallback<
          MouseEvent<HTMLButtonElement>
        >(
          'q1',
          (e) => ({
            min: e.screenX * multiplier,
            max: e.screenY * multiplier,
          }),
          [multiplier],
          queries,
          then,
        );
        handlers[multiplier] = handler;
        return <button onClick={handler} />;
      };

      const {getByRole, rerender, unmount} = render(
        <Test multiplier={2} then={then} />,
      );

      act(() =>
        store.setTables({
          t1: {
            r1: {c1: 1},
            r2: {c1: 2},
            r3: {c1: 3},
            r4: {c1: 4},
            r5: {c1: 5},
            r6: {c1: 6},
            r7: {c1: 7},
            r8: {c1: 8},
            r9: {c1: 9},
          },
        }),
      );
      expect(queries.getResultTable('q1')).toEqual({
        r3: {c1: 3},
        r4: {c1: 4},
        r5: {c1: 5},
      });

      fireEvent.click(getByRole('button'), {screenX: 1, screenY: 2});
      expect(queries.getResultTable('q1')).toEqual({
        r2: {c1: 2},
        r3: {c1: 3},
        r4: {c1: 4},
      });
      expect(then).toHaveBeenCalledWith(queries, {min: 2, max: 4});

      rerender(<Test multiplier={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      fireEvent.click(getByRole('button'), {screenX: 0, screenY: 1});
      expect(queries.getResultTable('q1')).toEqual({
        r1: {c1: 1},
        r2: {c1: 2},
        r3: {c1: 3},
      });
      expect(then).toHaveBeenCalledWith(queries, {min: 0, max: 3});
      unmount();
    });

    test('useSetParamValuesCallback, parameterized queryId', () => {
      const queries = createQueries(store);
      queries
        .setQueryDefinition(
          'q1',
          't1',
          ({select, where, param}) => {
            select('c1');
            where((getCell) => getCell('c1') === param('value'));
          },
          {value: 1},
        )
        .setQueryDefinition(
          'q2',
          't1',
          ({select, where, param}) => {
            select('c1');
            where((getCell) => getCell('c1') === param('value'));
          },
          {value: 1},
        );

      const then = vi.fn((_queries: any, _paramValues: any) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

      const Test = ({
        multiplier,
        then,
      }: {
        readonly multiplier: number;
        readonly then: (queries: any, paramValues: any) => void;
      }) => {
        const handler = useSetParamValuesCallback<
          MouseEvent<HTMLButtonElement>
        >(
          (e) => 'q' + e.screenY,
          (e) => ({value: e.screenX * multiplier}),
          [multiplier],
          queries,
          then,
        );
        handlers[multiplier] = handler;
        return <button onClick={handler} />;
      };

      const {getByRole, rerender, unmount} = render(
        <Test multiplier={2} then={then} />,
      );

      act(() => store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 3}}}));

      fireEvent.click(getByRole('button'), {screenX: 1, screenY: 1});
      expect(queries.getResultTable('q1')).toEqual({r2: {c1: 2}});
      expect(then).toHaveBeenCalledWith(queries, {value: 2});

      fireEvent.click(getByRole('button'), {screenX: 1, screenY: 2});
      expect(queries.getResultTable('q2')).toEqual({r2: {c1: 2}});
      expect(then).toHaveBeenCalledWith(queries, {value: 2});

      rerender(<Test multiplier={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useParamValuesState', () => {
      const queries = createQueries(store);
      queries.setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where(
            (getCell) => (getCell('c1') as number) >= (param('min') as number),
          );
          where(
            (getCell) => (getCell('c1') as number) <= (param('max') as number),
          );
        },
        {min: 3, max: 5},
      );

      const Test = () => {
        const [paramValues, setParamValues] = useParamValuesState(
          'q1',
          queries,
        );
        return (
          <button onClick={() => setParamValues({min: 2, max: 4})}>
            {JSON.stringify(paramValues)}
          </button>
        );
      };

      store.setTable('t1', {
        r1: {c1: 1},
        r2: {c1: 2},
        r3: {c1: 3},
        r4: {c1: 4},
        r5: {c1: 5},
        r6: {c1: 6},
      });

      const {container, unmount} = render(<Test />);

      expect(container.innerHTML).toEqual('<button>{"min":3,"max":5}</button>');
      expect(queries.getResultTable('q1')).toEqual({
        r3: {c1: 3},
        r4: {c1: 4},
        r5: {c1: 5},
      });

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<button>{"min":2,"max":4}</button>');
      expect(queries.getResultTable('q1')).toEqual({
        r2: {c1: 2},
        r3: {c1: 3},
        r4: {c1: 4},
      });

      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(container.innerHTML).toEqual('<button>{"min":2,"max":4}</button>');

      unmount();
    });

    test('useUndoInformation', async () => {
      const checkpoints = createCheckpoints(store);
      const Test = () => {
        const [canUndo, handleUndo, undoCheckpointId, undoLabel] =
          useUndoInformation(checkpoints);
        return didRender(
          <button onClick={handleUndo}>
            {JSON.stringify([canUndo, undoCheckpointId, undoLabel])}
          </button>,
        );
      };

      const {getByRole, unmount} = render(<Test />);
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([false, '0', '']),
      );

      act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([true, null, '']),
      );

      await act(() => userEvent.click(getByRole('button')));
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([false, '0', '']),
      );

      act(() => {
        store.setTables({t1: {r1: {c1: 3}}});
        checkpoints.addCheckpoint('one');
      });
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([true, '2', 'one']),
      );

      await act(() => userEvent.click(getByRole('button')));
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([false, '0', '']),
      );
      expect(didRender).toHaveBeenCalledTimes(5);

      unmount();
    });

    test('useRedoInformation', async () => {
      const checkpoints = createCheckpoints(store);
      const Test = () => {
        const [canRedo, handleRedo, redoCheckpointId, redoLabel] =
          useRedoInformation(checkpoints);
        return didRender(
          <button onClick={handleRedo}>
            {JSON.stringify([canRedo, redoCheckpointId, redoLabel])}
          </button>,
        );
      };

      const {getByRole, unmount} = render(<Test />);
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([false, null, '']),
      );

      await act(() => userEvent.click(getByRole('button')));
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([false, null, '']),
      );

      act(() => {
        store.setTables({t1: {r1: {c1: 2}}});
        checkpoints.addCheckpoint('one');
        checkpoints.goBackward();
      });
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([true, '1', 'one']),
      );

      await act(() => userEvent.click(getByRole('button')));
      expect(getByRole('button').textContent).toEqual(
        JSON.stringify([false, null, '']),
      );
      expect(didRender).toHaveBeenCalledTimes(3);

      unmount();
    });
  });

  describe('Write Hooks', () => {
    test('useSetTablesCallback', () => {
      const then = vi.fn((_store?: Store, _tables?: Tables) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store?: Store, tables?: Tables) => void;
      }) => {
        const handler = useSetTablesCallback<MouseEvent<HTMLButtonElement>>(
          (e) => ({t1: {r1: {c1: e.screenX * value}}}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, {t1: {r1: {c1: 4}}});

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetTablesCallback without get deps', () => {
      const Test = () => {
        const handler = useSetTablesCallback<MouseEvent<HTMLButtonElement>>(
          (e) => ({t1: {r1: {c1: e.screenX}}}),
          undefined,
          store,
        );
        return <button onClick={handler} />;
      };
      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'), {screenX: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});

      unmount();
    });

    test('useSetTableCallback (including handler memo)', () => {
      const then = vi.fn((_store?: Store, _table?: Table) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      let previousHandler: any;
      let handlerChanged = 0;
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store?: Store, table?: Table) => void;
      }) => {
        const handler = useSetTableCallback<MouseEvent<HTMLButtonElement>>(
          't1',
          (e) => ({r1: {c1: e.screenX * value}}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        if (handler != previousHandler) {
          handlerChanged++;
          previousHandler = handler;
        }
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );
      expect(handlerChanged).toEqual(1);

      rerender(<Test value={2} then={then} />);
      expect(handlerChanged).toEqual(1);

      fireEvent.click(getByRole('button'), {screenX: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

      rerender(<Test value={3} then={then} />);

      expect(handlerChanged).toEqual(2);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetTableCallback, parameterized Id (incl handler memo)', () => {
      const then = vi.fn((_store?: Store, _table?: Table) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      let previousHandler: any;
      let handlerChanged = 0;
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store?: Store, table?: Table) => void;
      }) => {
        const handler = useSetTableCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 't' + e.screenY,
          (e) => ({r1: {c1: e.screenX * value}}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        if (handler != previousHandler) {
          handlerChanged++;
          previousHandler = handler;
        }
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );
      expect(handlerChanged).toEqual(1);

      rerender(<Test value={2} then={then} />);
      expect(handlerChanged).toEqual(1);

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r1: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

      rerender(<Test value={3} then={then} />);

      expect(handlerChanged).toEqual(2);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetRowCallback, parameterized Ids', () => {
      const then = vi.fn((_store: Store, _row: Row) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store: Store, row: Row) => void;
      }) => {
        const handler = useSetRowCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 't' + e.screenY,
          (e) => 'r' + e.screenY,
          (e) => ({c1: e.screenX * value}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, {c1: 4});

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r2: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, {c1: 4});

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useAddRowCallback defaults deps and then', () => {
      const Test = () => {
        const _handleClick = useAddRowCallback(
          't1',
          () => ({c1: 2}),
          undefined,
          store,
        );
        return <button onClick={_handleClick} />;
      };

      const {container, unmount} = render(<Test />);
      act(() => fireEvent.click(container.querySelector('button') as Element));
      expect(store.getRow('t1', '0')).toEqual({c1: 2});

      unmount();
    });

    test('useAddRowCallback, parameterized Id', () => {
      const then = vi.fn(
        (_rowId: Id | undefined, _store: Store, _row: Row) => null,
      );
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (rowId: Id | undefined, store: Store, row: Row) => void;
      }) => {
        const handler = useAddRowCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 't' + e.screenY,
          (e) => ({c1: e.screenX * value}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}, '0': {c1: 4}}});
      expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1}, '0': {c1: 4}},
        t2: {'0': {c1: 4}},
      });
      expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetPartialRowCallback', () => {
      const then = vi.fn((_store: Store, _row: Row) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store: Store, row: Row) => void;
      }) => {
        const handler = useSetPartialRowCallback<MouseEvent<HTMLButtonElement>>(
          't1',
          'r1',
          (e) => ({c2: e.screenX * value, c3: e.screenX * value}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 4, c3: 4}}});
      expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetPartialRowCallback, parameterized Ids', () => {
      const then = vi.fn((_store: Store, _row: Row) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store: Store, row: Row) => void;
      }) => {
        const handler = useSetPartialRowCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 't' + e.screenY,
          (e) => 'r' + e.screenY,
          (e) => ({c2: e.screenX * value, c3: e.screenX * value}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 4, c3: 4}}});
      expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1, c2: 4, c3: 4}},
        t2: {r2: {c2: 4, c3: 4}},
      });
      expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetCellCallback, parameterized Ids', () => {
      const then = vi.fn((_store: Store, _cell: Cell | MapCell) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store: Store, cell: Cell | MapCell) => void;
      }) => {
        const handler = useSetCellCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 't' + e.screenY,
          (e) => 'r' + e.screenY,
          (e) => 'c' + e.screenY,
          (e) => e.screenX * value,
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
      expect(then).toHaveBeenCalledWith(store, 4);

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r2: {c2: 4}}});
      expect(then).toHaveBeenCalledWith(store, 4);

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetPartialValuesCallback', () => {
      const then = vi.fn((_store: Store, _values: Values) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store: Store, values: Values) => void;
      }) => {
        const handler = useSetPartialValuesCallback<
          MouseEvent<HTMLButtonElement>
        >(
          (e) => ({v2: e.screenX * value, v3: e.screenX * value}),
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2});
      expect(store.getValues()).toEqual({v1: 1, v2: 4, v3: 4});
      expect(then).toHaveBeenCalledWith(store, {v2: 4, v3: 4});

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetValueCallback', () => {
      const then = vi.fn((_store?: Store, _value?: Value | MapValue) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store?: Store, value?: Value | MapValue) => void;
      }) => {
        const handler = useSetValueCallback<MouseEvent<HTMLButtonElement>>(
          'v1',
          (e) => e.screenX * value,
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2});
      expect(store.getValues()).toEqual({v1: 4});
      expect(then).toHaveBeenCalledWith(store, 4);

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useSetValueCallback, parameterized Id', () => {
      const then = vi.fn((_store?: Store, _value?: Value | MapValue) => null);
      const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
      const Test = ({
        value,
        then,
      }: {
        readonly value: number;
        readonly then: (store?: Store, value?: Value | MapValue) => void;
      }) => {
        const handler = useSetValueCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 'v' + e.screenY,
          (e) => e.screenX * value,
          [value],
          store,
          then,
        );
        handlers[value] = handler;
        return <button onClick={handler} />;
      };
      const {getByRole, rerender, unmount} = render(
        <Test value={2} then={then} />,
      );

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
      expect(store.getValues()).toEqual({v1: 4});
      expect(then).toHaveBeenCalledWith(store, 4);

      fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
      expect(store.getValues()).toEqual({v1: 4, v2: 4});
      expect(then).toHaveBeenCalledWith(store, 4);

      rerender(<Test value={3} then={then} />);
      expect(handlers[2]).not.toEqual(handlers[3]);

      unmount();
    });

    test('useDelTablesCallback', async () => {
      const Test = () => <button onClick={useDelTablesCallback(store)} />;

      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'));
      expect(store.getTables()).toEqual({});

      unmount();
    });

    test('useDelTableCallback', async () => {
      const Test = () => <button onClick={useDelTableCallback('t1', store)} />;

      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'));
      expect(store.getTables()).toEqual({});

      unmount();
    });

    test('useDelTableCallback, parameterized Id with memo', () => {
      let previousHandler: any;
      let handlerChanged = 0;
      const Test = () => {
        const handler = useDelTableCallback<MouseEvent<HTMLButtonElement>>(
          (e) => 't' + e.screenX,
          store,
        );
        if (handler != previousHandler) {
          handlerChanged++;
          previousHandler = handler;
        }
        return <button onClick={handler} />;
      };

      const {getByRole, unmount} = render(<Test />);

      expect(handlerChanged).toEqual(1);

      fireEvent.click(getByRole('button'), {screenX: 0});
      expect(handlerChanged).toEqual(1);

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(store.getTables()).toEqual({});
      expect(handlerChanged).toEqual(1);

      unmount();
    });

    test('useDelRowCallback', async () => {
      const Test = () => (
        <button onClick={useDelRowCallback('t1', 'r1', store)} />
      );

      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'));
      expect(store.getTables()).toEqual({});

      unmount();
    });

    test('useDelRowCallback, parameterized Ids', () => {
      const Test = () => (
        <button
          onClick={useDelRowCallback(
            (e) => 't' + e.screenX,
            (e) => 'r' + e.screenX,
            store,
          )}
        />
      );

      store.setCell('t1', 'r2', 'c2', 2);
      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'), {screenX: 0});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}, r2: {c2: 2}}});

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(store.getTables()).toEqual({t1: {r2: {c2: 2}}});

      unmount();
    });

    test('useDelCellCallback, parameterized Ids', async () => {
      const Test = () => (
        <button
          onClick={useDelCellCallback(
            (e) => 't' + e.screenX,
            (e) => 'r' + e.screenX,
            (e) => 'c' + e.screenX,
            false,
            store,
          )}
        />
      );
      store.setCell('t1', 'r1', 'c2', 2);

      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'), {screenX: 0});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(store.getTables()).toEqual({t1: {r1: {c2: 2}}});

      unmount();
    });

    test('useDelValuesCallback', async () => {
      const Test = () => <button onClick={useDelValuesCallback(store)} />;

      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'));
      expect(store.getValues()).toEqual({});

      unmount();
    });

    test('useDelValueCallback', async () => {
      const Test = () => <button onClick={useDelValueCallback('v1', store)} />;

      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'));
      expect(store.getValues()).toEqual({});

      unmount();
    });

    test('useDelValueCallback, parameterized Id', () => {
      const Test = () => (
        <button onClick={useDelValueCallback((e) => 'v' + e.screenX, store)} />
      );
      store.setValue('v2', 2);
      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'), {screenX: 0});
      expect(store.getValues()).toEqual({v1: 1, v2: 2});

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(store.getValues()).toEqual({v2: 2});

      unmount();
    });

    describe('Checkpoints', () => {
      let checkpoints: Checkpoints;

      beforeEach(() => {
        checkpoints = createCheckpoints(store);
        store.setCell('t1', 'r1', 'c1', 2);
        checkpoints.addCheckpoint();
        store.setCell('t1', 'r1', 'c1', 3);
        checkpoints.addCheckpoint();
      });

      test('useSetCheckpointCallback without label', () => {
        const then = vi.fn(
          (_checkpointId: Id, _checkpoints: Checkpoints, _label?: string) =>
            null,
        );
        const Test = ({
          then,
        }: {
          readonly then?: (
            checkpointId: Id,
            checkpoints: Checkpoints,
            label?: string,
          ) => void;
        }) => (
          <button
            onClick={useSetCheckpointCallback(
              undefined,
              undefined,
              checkpoints,
              then,
            )}
          />
        );

        const {getByRole, unmount} = render(<Test then={then} />);
        store.setCell('t1', 'r1', 'c1', 4);

        fireEvent.click(getByRole('button'), {type: 'a'});
        expect(checkpoints.getCheckpointIds()).toEqual([
          ['0', '1', '2'],
          '3',
          [],
        ]);
        expect(checkpoints.getCheckpoint('3')).toEqual('');
        expect(then).toHaveBeenCalledWith('3', checkpoints, undefined);

        unmount();
      });

      test('useSetCheckpointCallback with label', () => {
        const then = vi.fn(
          (_checkpointId: Id, _checkpoints: Checkpoints, _label?: string) =>
            null,
        );
        const handlers: {
          [suffix: string]: MouseEventHandler<HTMLButtonElement>;
        } = {};
        const Test = ({
          suffix,
          then,
        }: {
          readonly suffix: string;
          readonly then?: (
            checkpointId: Id,
            checkpoints: Checkpoints,
            label?: string,
          ) => void;
        }) => {
          const handler = useSetCheckpointCallback<
            MouseEvent<HTMLButtonElement>
          >((e) => e.type + suffix, [suffix], checkpoints, then);
          handlers[suffix] = handler;
          return <button onClick={handler} />;
        };

        const {getByRole, rerender, unmount} = render(
          <Test suffix="." then={then} />,
        );
        store.setCell('t1', 'r1', 'c1', 4);

        fireEvent.click(getByRole('button'));
        expect(checkpoints.getCheckpointIds()).toEqual([
          ['0', '1', '2'],
          '3',
          [],
        ]);
        expect(checkpoints.getCheckpoint('3')).toEqual('click.');
        expect(then).toHaveBeenCalledWith('3', checkpoints, 'click.');

        rerender(<Test suffix="!" />);

        expect(handlers['.']).not.toEqual(handlers['!']);

        unmount();
      });

      test('useGoToCallback', () => {
        const then = vi.fn(
          (_checkpoints: Checkpoints, _checkpointId: Id) => null,
        );
        const Test = ({
          then,
        }: {
          readonly then: (checkpoints: Checkpoints, checkpointId: Id) => void;
        }) => (
          <button
            onClick={useGoToCallback(
              (e) => e.screenX + '',
              undefined,
              checkpoints,
              then,
            )}
          />
        );
        const {getByRole, unmount} = render(<Test then={then} />);
        expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

        fireEvent.click(getByRole('button'), {screenX: 1});
        expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
        expect(then).toHaveBeenCalledWith(checkpoints, '1');

        unmount();
      });

      test('useGoToCallback (no then)', () => {
        const Test = () => (
          <button
            onClick={useGoToCallback(
              (e) => e.screenX + '',
              undefined,
              checkpoints,
            )}
          />
        );
        const {getByRole, unmount} = render(<Test />);
        expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

        fireEvent.click(getByRole('button'), {screenX: 1});
        expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

        unmount();
      });
    });
  });

  describe('Listener Hooks', () => {
    test('useSortedRowIdsListener, object arg', () => {
      expect.assertions(6);
      const Test = ({value}: {readonly value: number}) => {
        useSortedRowIdsListener(
          {tableId: 't1', cellId: 'c1'},
          (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
          [value],
          false,
          store,
        );
        return <button />;
      };
      expect(store.getListenerStats().sortedRowIds).toEqual(0);
      const {rerender, unmount} = render(<Test value={2} />);

      expect(store.getListenerStats().sortedRowIds).toEqual(1);
      store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
      rerender(<Test value={3} />);

      expect(store.getListenerStats().sortedRowIds).toEqual(1);
      store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
      rerender(<button />);

      expect(store.getListenerStats().sortedRowIds).toEqual(0);

      unmount();
    });

    test('useSortedRowIdsListener, object arg, custom sorter', () => {
      expect.assertions(3);
      const numericSorter = (sortKey1: any, sortKey2: any) =>
        Number(sortKey1) - Number(sortKey2);
      ['1', '10', '2'].forEach((rowId) =>
        store.setRow('t2', rowId, {c1: true}),
      );
      const listener = vi.fn();
      const Test = () => {
        useSortedRowIdsListener(
          {tableId: 't2', sorter: numericSorter},
          listener,
          [listener],
          false,
          store,
        );
        return <button />;
      };
      const {unmount} = render(<Test />);

      store.setRow('t2', '3', {c1: true});
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][6]).toEqual(['1', '2', '3', '10']);
      unmount();
      expect(store.getListenerStats().sortedRowIds).toEqual(0);
    });

    test('useMetricListener (no deps)', () => {
      expect.assertions(4);
      const metrics = createMetrics(store).setMetricDefinition(
        'm1',
        't1',
        'max',
        'c1',
      );
      const Test = () => {
        useMetricListener(
          'm1',
          (metrics) => expect(metrics?.getMetric('m1')).toEqual(1),
          undefined,
          metrics,
        );
        return <button />;
      };
      expect(metrics.getListenerStats().metric).toEqual(0);

      const {rerender, unmount} = render(<Test />);
      expect(metrics.getListenerStats().metric).toEqual(1);
      store.setCell('t1', 'r1', 'c1', 1);
      expect(metrics?.getMetric('m1')).toEqual(1);
      rerender(<button />);

      expect(metrics.getListenerStats().metric).toEqual(0);

      unmount();
    });
  });
});
