import {
  ADD,
  CELL,
  CELL_IDS,
  EMPTY_STRING,
  GET,
  HAS,
  LISTENER,
  RESULT,
  ROW,
  ROW_COUNT,
  ROW_IDS,
  SORTED_ROW_IDS,
  TABLE,
  TABLES,
  TABLE_IDS,
  VALUE,
  VALUES,
  VALUE_IDS,
  _HAS,
} from '../common/strings';
import {
  Callback,
  Id,
  IdOrNull,
  Ids,
  ParameterizedCallback,
} from '../types/common.d';
import {
  Cell,
  CellIdsListener,
  CellListener,
  HasCellListener,
  HasRowListener,
  HasTableCellListener,
  HasTableListener,
  HasTablesListener,
  HasValueListener,
  HasValuesListener,
  MapCell,
  MapValue,
  Row,
  RowCountListener,
  RowIdsListener,
  RowListener,
  SortedRowIdsListener,
  Store,
  Table,
  TableCellIdsListener,
  TableIdsListener,
  TableListener,
  Tables,
  TablesListener,
  TransactionListener,
  Value,
  ValueIdsListener,
  ValueListener,
  Values,
  ValuesListener,
} from '../types/store.d';
import {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../types/checkpoints';
import {
  CheckpointsOrCheckpointsId,
  GetId,
  IndexesOrIndexesId,
  MetricsOrMetricsId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
  UndoOrRedoInformation,
  useAddRowCallback as useAddRowCallbackDecl,
  useCell as useCellDecl,
  useCellIds as useCellIdsDecl,
  useCellIdsListener as useCellIdsListenerDecl,
  useCellListener as useCellListenerDecl,
  useCheckpoint as useCheckpointDecl,
  useCheckpointIds as useCheckpointIdsDecl,
  useCheckpointIdsListener as useCheckpointIdsListenerDecl,
  useCheckpointListener as useCheckpointListenerDecl,
  useCheckpointsIds as useCheckpointsIdsDecl,
  useCreateCheckpoints as useCreateCheckpointsDecl,
  useCreateIndexes as useCreateIndexesDecl,
  useCreateMetrics as useCreateMetricsDecl,
  useCreatePersister as useCreatePersisterDecl,
  useCreateQueries as useCreateQueriesDecl,
  useCreateRelationships as useCreateRelationshipsDecl,
  useCreateStore as useCreateStoreDecl,
  useDelCellCallback as useDelCellCallbackDecl,
  useDelRowCallback as useDelRowCallbackDecl,
  useDelTableCallback as useDelTableCallbackDecl,
  useDelTablesCallback as useDelTablesCallbackDecl,
  useDelValueCallback as useDelValueCallbackDecl,
  useDelValuesCallback as useDelValuesCallbackDecl,
  useDidFinishTransactionListener as useDidFinishTransactionListenerDecl,
  useGoBackwardCallback as useGoBackwardCallbackDecl,
  useGoForwardCallback as useGoForwardCallbackDecl,
  useGoToCallback as useGoToCallbackDecl,
  useHasCell as useHasCellDecl,
  useHasCellListener as useHasCellListenerDecl,
  useHasRow as useHasRowDecl,
  useHasRowListener as useHasRowListenerDecl,
  useHasTableCell as useHasTableCellDecl,
  useHasTableCellListener as useHasTableCellListenerDecl,
  useHasTable as useHasTableDecl,
  useHasTableListener as useHasTableListenerDecl,
  useHasTables as useHasTablesDecl,
  useHasTablesListener as useHasTablesListenerDecl,
  useHasValue as useHasValueDecl,
  useHasValueListener as useHasValueListenerDecl,
  useHasValues as useHasValuesDecl,
  useHasValuesListener as useHasValuesListenerDecl,
  useIndexIds as useIndexIdsDecl,
  useIndexesIds as useIndexesIdsDecl,
  useLinkedRowIds as useLinkedRowIdsDecl,
  useLinkedRowIdsListener as useLinkedRowIdsListenerDecl,
  useLocalRowIds as useLocalRowIdsDecl,
  useLocalRowIdsListener as useLocalRowIdsListenerDecl,
  useMetric as useMetricDecl,
  useMetricIds as useMetricIdsDecl,
  useMetricListener as useMetricListenerDecl,
  useMetricsIds as useMetricsIdsDecl,
  useQueriesIds as useQueriesIdsDecl,
  useQueryIds as useQueryIdsDecl,
  useRedoInformation as useRedoInformationDecl,
  useRelationshipIds as useRelationshipIdsDecl,
  useRelationshipsIds as useRelationshipsIdsDecl,
  useRemoteRowId as useRemoteRowIdDecl,
  useRemoteRowIdListener as useRemoteRowIdListenerDecl,
  useResultCell as useResultCellDecl,
  useResultCellIds as useResultCellIdsDecl,
  useResultCellIdsListener as useResultCellIdsListenerDecl,
  useResultCellListener as useResultCellListenerDecl,
  useResultRowCount as useResultRowCountDecl,
  useResultRowCountListener as useResultRowCountListenerDecl,
  useResultRow as useResultRowDecl,
  useResultRowIds as useResultRowIdsDecl,
  useResultRowIdsListener as useResultRowIdsListenerDecl,
  useResultRowListener as useResultRowListenerDecl,
  useResultSortedRowIds as useResultSortedRowIdsDecl,
  useResultSortedRowIdsListener as useResultSortedRowIdsListenerDecl,
  useResultTableCellIds as useResultTableCellIdsDecl,
  useResultTableCellIdsListener as useResultTableCellIdsListenerDecl,
  useResultTable as useResultTableDecl,
  useResultTableListener as useResultTableListenerDecl,
  useRowCount as useRowCountDecl,
  useRowCountListener as useRowCountListenerDecl,
  useRow as useRowDecl,
  useRowIds as useRowIdsDecl,
  useRowIdsListener as useRowIdsListenerDecl,
  useRowListener as useRowListenerDecl,
  useSetCellCallback as useSetCellCallbackDecl,
  useSetCheckpointCallback as useSetCheckpointCallbackDecl,
  useSetPartialRowCallback as useSetPartialRowCallbackDecl,
  useSetPartialValuesCallback as useSetPartialValuesCallbackDecl,
  useSetRowCallback as useSetRowCallbackDecl,
  useSetTableCallback as useSetTableCallbackDecl,
  useSetTablesCallback as useSetTablesCallbackDecl,
  useSetValueCallback as useSetValueCallbackDecl,
  useSetValuesCallback as useSetValuesCallbackDecl,
  useSliceIds as useSliceIdsDecl,
  useSliceIdsListener as useSliceIdsListenerDecl,
  useSliceRowIds as useSliceRowIdsDecl,
  useSliceRowIdsListener as useSliceRowIdsListenerDecl,
  useSortedRowIds as useSortedRowIdsDecl,
  useSortedRowIdsListener as useSortedRowIdsListenerDecl,
  useStartTransactionListener as useStartTransactionListenerDecl,
  useStoreIds as useStoreIdsDecl,
  useTableCellIds as useTableCellIdsDecl,
  useTableCellIdsListener as useTableCellIdsListenerDecl,
  useTable as useTableDecl,
  useTableIds as useTableIdsDecl,
  useTableIdsListener as useTableIdsListenerDecl,
  useTableListener as useTableListenerDecl,
  useTables as useTablesDecl,
  useTablesListener as useTablesListenerDecl,
  useUndoInformation as useUndoInformationDecl,
  useValue as useValueDecl,
  useValueIds as useValueIdsDecl,
  useValueIdsListener as useValueIdsListenerDecl,
  useValueListener as useValueListenerDecl,
  useValues as useValuesDecl,
  useValuesListener as useValuesListenerDecl,
  useWillFinishTransactionListener as useWillFinishTransactionListenerDecl,
} from '../types/ui-react.d';
import {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../types/indexes.d';
import {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../types/relationships.d';
import {MetricListener, Metrics} from '../types/metrics.d';
import {
  Queries,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRowCountListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultSortedRowIdsListener,
  ResultTableCellIdsListener,
  ResultTableListener,
} from '../types/queries.d';
import {arrayIsEmpty, arrayIsEqual, arrayMap} from '../common/array';
import {
  getUndefined,
  ifNotUndefined,
  isFunction,
  isUndefined,
} from '../common/other';
import {
  useCheckpointsOrCheckpointsById,
  useIndexesOrIndexesById,
  useMetricsOrMetricsById,
  useQueriesOrQueriesById,
  useRelationshipsOrRelationshipsById,
  useStoreOrStoreById,
  useThingIds,
} from './context';
import {ListenerArgument} from '../common/listeners';
import {Persister} from '../types/persisters.d';
import React from 'react';
import {TRANSACTION} from '../tools/common/strings';
import {objIsEqual} from '../common/obj';

export {
  useCheckpoints,
  useCheckpointsOrCheckpointsById,
  useIndexes,
  useIndexesOrIndexesById,
  useMetrics,
  useMetricsOrMetricsById,
  useProvideStore,
  useQueries,
  useQueriesOrQueriesById,
  useRelationships,
  useRelationshipsOrRelationshipsById,
  useStore,
  useStoreOrStoreById,
} from './context';

const {
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} = React;

const EMPTY_ARRAY: Readonly<[]> = [];

// 0: object, 1: array, 2: cell/value, 3: boolean, 4: number, 5: checkpoints
const DEFAULTS = [
  {},
  [],
  [EMPTY_ARRAY, undefined, EMPTY_ARRAY],
  undefined,
  false,
  0,
];
const IS_EQUAL = (thing1: any, thing2: any) => thing1 === thing2;
const IS_EQUALS: ((thing1: any, thing2: any) => boolean)[] = [
  objIsEqual,
  arrayIsEqual,
  (
    [backwardIds1, currentId1, forwardIds1],
    [backwardIds2, currentId2, forwardIds2],
  ) =>
    currentId1 === currentId2 &&
    arrayIsEqual(backwardIds1, backwardIds2) &&
    arrayIsEqual(forwardIds1, forwardIds2),
];

const useCreate = (
  store: Store,
  create: (store: Store) => any,
  createDeps: React.DependencyList = EMPTY_ARRAY,
) => {
  const [, rerender] = useState<[]>();
  const [thing, setThing] = useState();
  useEffect(
    () => {
      const newThing = create(store);
      setThing(newThing);
      rerender([]);
      return newThing.destroy;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps],
  );
  return thing;
};

const addAndDelListener = (thing: any, listenable: string, ...args: any[]) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener(listenerId);
};

const useListenable = (
  listenable: string,
  thing: any,
  type: 0 | 1 | 2 | 3 | 4 | 5,
  args: Readonly<ListenerArgument[]> = EMPTY_ARRAY,
): any => {
  const lastResult = useRef(DEFAULTS[type]);
  const getResult = useCallback(
    () => {
      const nextResult =
        thing?.[(type == 4 ? _HAS : GET) + listenable]?.(...args) ??
        DEFAULTS[type];
      return !(IS_EQUALS[type] ?? IS_EQUAL)(nextResult, lastResult.current)
        ? (lastResult.current = nextResult)
        : lastResult.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, type, listenable, ...args],
  );
  const subscribe = useCallback(
    (listener: () => void) =>
      addAndDelListener(
        thing,
        (type == 4 ? HAS : EMPTY_STRING) + listenable,
        ...args,
        listener,
      ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, type, listenable, ...args],
  );
  return useSyncExternalStore(subscribe, getResult);
};

const useListener = (
  listenable: string,
  thing: any,
  listener: (...args: any[]) => void,
  listenerDeps: React.DependencyList = EMPTY_ARRAY,
  preArgs: Readonly<ListenerArgument[]> = EMPTY_ARRAY,
  ...postArgs: ListenerArgument[]
): void =>
  useLayoutEffect(
    () =>
      addAndDelListener(thing, listenable, ...preArgs, listener, ...postArgs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thing, listenable, ...preArgs, ...listenerDeps, ...postArgs],
  );

const useSetCallback = <Parameter, Thing>(
  storeOrStoreId: StoreOrStoreId | undefined,
  settable: string,
  get: (parameter: Parameter, store: Store) => Thing,
  getDeps: React.DependencyList = EMPTY_ARRAY,
  then: (store: Store, thing: Thing) => void = getUndefined,
  thenDeps: React.DependencyList = EMPTY_ARRAY,
  ...args: (Id | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (parameter) =>
      ifNotUndefined(store, (store: any) =>
        ifNotUndefined(get(parameter as any, store), (thing: Thing) =>
          then(
            store['set' + settable](
              ...arrayMap(args, (arg) =>
                isFunction(arg) ? arg(parameter as any, store) : arg,
              ),
              thing,
            ),
            thing,
          ),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, settable, ...getDeps, ...thenDeps, ...args],
  );
};

const useDel = (
  storeOrStoreId: StoreOrStoreId | undefined,
  deletable: string,
  then: (store: Store) => void = getUndefined,
  thenDeps: React.DependencyList = EMPTY_ARRAY,
  ...args: (Id | boolean | undefined)[]
) => {
  const store: any = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    () => then(store?.['del' + deletable](...args)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, deletable, ...thenDeps, ...args],
  );
};

const useCheckpointAction = (
  checkpointsOrCheckpointsId: CheckpointsOrCheckpointsId | undefined,
  action: string,
  arg?: string,
) => {
  const checkpoints: any = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return useCallback(
    () => checkpoints?.[action](arg),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoints, action, arg],
  );
};

export const useCreateStore: typeof useCreateStoreDecl = (
  create: () => Store,
  createDeps: React.DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Store => useMemo(create, createDeps);

export const useStoreIds: typeof useStoreIdsDecl = () => useThingIds(1);

export const useHasTables: typeof useHasTablesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): boolean => useListenable(TABLES, useStoreOrStoreById(storeOrStoreId), 4, []);

export const useTables: typeof useTablesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Tables => useListenable(TABLES, useStoreOrStoreById(storeOrStoreId), 0);

export const useTableIds: typeof useTableIdsDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Ids => useListenable(TABLE_IDS, useStoreOrStoreById(storeOrStoreId), 1);

export const useHasTable: typeof useHasTableDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 4, [tableId]);

export const useTable: typeof useTableDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Table =>
  useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 0, [tableId]);

export const useTableCellIds: typeof useTableCellIdsDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(TABLE + CELL_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
    tableId,
  ]);

export const useHasTableCell: typeof useHasTableCellDecl = (
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(TABLE + CELL, useStoreOrStoreById(storeOrStoreId), 4, [
    tableId,
    cellId,
  ]);

export const useRowCount: typeof useRowCountDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): number =>
  useListenable(ROW_COUNT, useStoreOrStoreById(storeOrStoreId), 5, [tableId]);

export const useRowIds: typeof useRowIdsDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(ROW_IDS, useStoreOrStoreById(storeOrStoreId), 1, [tableId]);

export const useSortedRowIds: typeof useSortedRowIdsDecl = (
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset = 0,
  limit?: number,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(SORTED_ROW_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
    tableId,
    cellId,
    descending,
    offset,
    limit,
  ]);

export const useHasRow: typeof useHasRowDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 4, [tableId, rowId]);

export const useRow: typeof useRowDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Row =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 0, [tableId, rowId]);

export const useCellIds: typeof useCellIdsDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(CELL_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
    tableId,
    rowId,
  ]);

export const useHasCell: typeof useHasCellDecl = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(CELL, useStoreOrStoreById(storeOrStoreId), 4, [
    tableId,
    rowId,
    cellId,
  ]);

export const useCell: typeof useCellDecl = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Cell | undefined =>
  useListenable(CELL, useStoreOrStoreById(storeOrStoreId), 3, [
    tableId,
    rowId,
    cellId,
  ]);

export const useHasValues: typeof useHasValuesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): boolean => useListenable(VALUES, useStoreOrStoreById(storeOrStoreId), 4, []);

export const useValues: typeof useValuesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Values => useListenable(VALUES, useStoreOrStoreById(storeOrStoreId), 0);

export const useValueIds: typeof useValueIdsDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Ids => useListenable(VALUE_IDS, useStoreOrStoreById(storeOrStoreId), 1);

export const useHasValue: typeof useHasValueDecl = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(VALUE, useStoreOrStoreById(storeOrStoreId), 4, [valueId]);

export const useValue: typeof useValueDecl = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Value =>
  useListenable(VALUE, useStoreOrStoreById(storeOrStoreId), 3, [valueId]);

export const useSetTablesCallback: typeof useSetTablesCallbackDecl = <
  Parameter,
>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  getTablesDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, tables: Tables) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    TABLES,
    getTables,
    getTablesDeps,
    then,
    thenDeps,
  );

export const useSetTableCallback: typeof useSetTableCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  getTable: (parameter: Parameter, store: Store) => Table,
  getTableDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, table: Table) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    TABLE,
    getTable,
    getTableDeps,
    then,
    thenDeps,
    tableId,
  );

export const useSetRowCallback: typeof useSetRowCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  getRowDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, row: Row) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    ROW,
    getRow,
    getRowDeps,
    then,
    thenDeps,
    tableId,
    rowId,
  );

export const useAddRowCallback: typeof useAddRowCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  getRowDeps: React.DependencyList = EMPTY_ARRAY,
  storeOrStoreId?: StoreOrStoreId,
  then: (rowId: Id | undefined, store: Store, row: Row) => void = getUndefined,
  thenDeps: React.DependencyList = EMPTY_ARRAY,
  reuseRowIds = true,
): ParameterizedCallback<Parameter> => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (parameter) =>
      ifNotUndefined(store, (store) =>
        ifNotUndefined(getRow(parameter as any, store), (row: Row) =>
          then(
            store.addRow(
              isFunction(tableId) ? tableId(parameter as any, store) : tableId,
              row,
              reuseRowIds,
            ),
            store,
            row,
          ),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, tableId, ...getRowDeps, ...thenDeps, reuseRowIds],
  );
};

export const useSetPartialRowCallback: typeof useSetPartialRowCallbackDecl = <
  Parameter,
>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getPartialRow: (parameter: Parameter, store: Store) => Row,
  getPartialRowDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialRow: Row) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    'PartialRow',
    getPartialRow,
    getPartialRowDeps,
    then,
    thenDeps,
    tableId,
    rowId,
  );

export const useSetCellCallback: typeof useSetCellCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  getCell: (parameter: Parameter, store: Store) => Cell | MapCell,
  getCellDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, cell: Cell | MapCell) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    CELL,
    getCell,
    getCellDeps,
    then,
    thenDeps,
    tableId,
    rowId,
    cellId,
  );

export const useSetValuesCallback: typeof useSetValuesCallbackDecl = <
  Parameter,
>(
  getValues: (parameter: Parameter, store: Store) => Values,
  getValuesDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, values: Values) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    VALUES,
    getValues,
    getValuesDeps,
    then,
    thenDeps,
  );

export const useSetPartialValuesCallback: typeof useSetPartialValuesCallbackDecl =
  <Parameter>(
    getPartialValues: (parameter: Parameter, store: Store) => Values,
    getPartialValuesDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId,
    then?: (store: Store, partialValues: Values) => void,
    thenDeps?: React.DependencyList,
  ): ParameterizedCallback<Parameter> =>
    useSetCallback(
      storeOrStoreId,
      'PartialValues',
      getPartialValues,
      getPartialValuesDeps,
      then,
      thenDeps,
    );

export const useSetValueCallback: typeof useSetValueCallbackDecl = <Parameter>(
  valueId: Id | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  getValueDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, value: Value | MapValue) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    storeOrStoreId,
    VALUE,
    getValue,
    getValueDeps,
    then,
    thenDeps,
    valueId,
  );

export const useDelTablesCallback: typeof useDelTablesCallbackDecl = (
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback => useDel(storeOrStoreId, TABLES, then, thenDeps);

export const useDelTableCallback: typeof useDelTableCallbackDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback => useDel(storeOrStoreId, TABLE, then, thenDeps, tableId);

export const useDelRowCallback: typeof useDelRowCallbackDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback => useDel(storeOrStoreId, ROW, then, thenDeps, tableId, rowId);

export const useDelCellCallback: typeof useDelCellCallbackDecl = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  forceDel?: boolean,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback =>
  useDel(
    storeOrStoreId,
    CELL,
    then,
    thenDeps,
    tableId,
    rowId,
    cellId,
    forceDel,
  );

export const useDelValuesCallback: typeof useDelValuesCallbackDecl = (
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback => useDel(storeOrStoreId, VALUES, then, thenDeps);

export const useDelValueCallback: typeof useDelValueCallbackDecl = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback => useDel(storeOrStoreId, VALUE, then, thenDeps, valueId);

export const useHasTablesListener: typeof useHasTablesListenerDecl = (
  listener: HasTablesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + TABLES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [],
    mutator,
  );

export const useTablesListener: typeof useTablesListenerDecl = (
  listener: TablesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    TABLES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    EMPTY_ARRAY,
    mutator,
  );

export const useTableIdsListener: typeof useTableIdsListenerDecl = (
  listener: TableIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    TABLE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    EMPTY_ARRAY,
    mutator,
  );

export const useHasTableListener: typeof useHasTableListenerDecl = (
  tableId: IdOrNull,
  listener: HasTableListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + TABLE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId],
    mutator,
  );

export const useTableListener: typeof useTableListenerDecl = (
  tableId: IdOrNull,
  listener: TableListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    TABLE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId],
    mutator,
  );

export const useTableCellIdsListener: typeof useTableCellIdsListenerDecl = (
  tableId: IdOrNull,
  listener: TableCellIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    TABLE + CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId],
    mutator,
  );

export const useHasTableCellListener: typeof useHasTableCellListenerDecl = (
  tableId: IdOrNull,
  cellId: IdOrNull,
  listener: HasTableCellListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + TABLE + CELL,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, cellId],
    mutator,
  );

export const useRowCountListener: typeof useRowCountListenerDecl = (
  tableId: IdOrNull,
  listener: RowCountListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    ROW_COUNT,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId],
    mutator,
  );

export const useRowIdsListener: typeof useRowIdsListenerDecl = (
  tableId: IdOrNull,
  listener: RowIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId],
    mutator,
  );

export const useSortedRowIdsListener: typeof useSortedRowIdsListenerDecl = (
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: SortedRowIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    SORTED_ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, cellId, descending, offset, limit],
    mutator,
  );

export const useHasRowListener: typeof useHasRowListenerDecl = (
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: HasRowListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + ROW,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, rowId],
    mutator,
  );

export const useRowListener: typeof useRowListenerDecl = (
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: RowListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    ROW,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, rowId],
    mutator,
  );

export const useCellIdsListener: typeof useCellIdsListenerDecl = (
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: CellIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, rowId],
    mutator,
  );

export const useHasCellListener: typeof useHasCellListenerDecl = (
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: HasCellListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + CELL,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, rowId, cellId],
    mutator,
  );

export const useCellListener: typeof useCellListenerDecl = (
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: CellListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    CELL,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [tableId, rowId, cellId],
    mutator,
  );

export const useHasValuesListener: typeof useHasValuesListenerDecl = (
  listener: HasValuesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + VALUES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [],
    mutator,
  );

export const useValuesListener: typeof useValuesListenerDecl = (
  listener: ValuesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    VALUES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    EMPTY_ARRAY,
    mutator,
  );

export const useValueIdsListener: typeof useValueIdsListenerDecl = (
  listener: ValueIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    VALUE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    EMPTY_ARRAY,
    mutator,
  );

export const useHasValueListener: typeof useHasValueListenerDecl = (
  valueId: IdOrNull,
  listener: HasValueListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    HAS + VALUE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [valueId],
    mutator,
  );

export const useValueListener: typeof useValueListenerDecl = (
  valueId: IdOrNull,
  listener: ValueListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  useListener(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    listenerDeps,
    [valueId],
    mutator,
  );

export const useStartTransactionListener: typeof useStartTransactionListenerDecl =
  (
    listener: TransactionListener,
    listenerDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId,
  ): void =>
    useListener(
      'Start' + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );

export const useWillFinishTransactionListener: typeof useWillFinishTransactionListenerDecl =
  (
    listener: TransactionListener,
    listenerDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId,
  ): void =>
    useListener(
      'WillFinish' + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );

export const useDidFinishTransactionListener: typeof useDidFinishTransactionListenerDecl =
  (
    listener: TransactionListener,
    listenerDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId,
  ): void =>
    useListener(
      'DidFinish' + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );

export const useCreateMetrics: typeof useCreateMetricsDecl = (
  store: Store,
  create: (store: Store) => Metrics,
  createDeps?: React.DependencyList,
): Metrics | undefined => useCreate(store, create, createDeps);

export const useMetricsIds: typeof useMetricsIdsDecl = () => useThingIds(3);

export const useMetricIds: typeof useMetricIdsDecl = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Ids =>
  useListenable('MetricIds', useMetricsOrMetricsById(metricsOrMetricsId), 1);

export const useMetric: typeof useMetricDecl = (
  metricId: Id,
  metricsOrMetricsId?: MetricsOrMetricsId,
): number | undefined =>
  useListenable('Metric', useMetricsOrMetricsById(metricsOrMetricsId), 3, [
    metricId,
  ]);

export const useMetricListener: typeof useMetricListenerDecl = (
  metricId: IdOrNull,
  listener: MetricListener,
  listenerDeps?: React.DependencyList,
  metricsOrMetricsId?: MetricsOrMetricsId,
): void =>
  useListener(
    'Metric',
    useMetricsOrMetricsById(metricsOrMetricsId),
    listener,
    listenerDeps,
    [metricId],
  );

export const useCreateIndexes: typeof useCreateIndexesDecl = (
  store: Store,
  create: (store: Store) => Indexes,
  createDeps?: React.DependencyList,
): Indexes | undefined => useCreate(store, create, createDeps);

export const useIndexesIds: typeof useIndexesIdsDecl = () => useThingIds(5);

export const useSliceIds: typeof useSliceIdsDecl = (
  indexId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable('SliceIds', useIndexesOrIndexesById(indexesOrIndexesId), 1, [
    indexId,
  ]);

export const useIndexIds: typeof useIndexIdsDecl = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable('IndexIds', useIndexesOrIndexesById(indexesOrIndexesId), 1);

export const useSliceRowIds: typeof useSliceRowIdsDecl = (
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable(
    'Slice' + ROW_IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    1,
    [indexId, sliceId],
  );

export const useSliceIdsListener: typeof useSliceIdsListenerDecl = (
  indexId: IdOrNull,
  listener: SliceIdsListener,
  listenerDeps?: React.DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void =>
  useListener(
    'SliceIds',
    useIndexesOrIndexesById(indexesOrIndexesId),
    listener,
    listenerDeps,
    [indexId],
  );

export const useSliceRowIdsListener: typeof useSliceRowIdsListenerDecl = (
  indexId: IdOrNull,
  sliceId: IdOrNull,
  listener: SliceRowIdsListener,
  listenerDeps?: React.DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void =>
  useListener(
    'Slice' + ROW_IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    listener,
    listenerDeps,
    [indexId, sliceId],
  );

export const useCreateRelationships: typeof useCreateRelationshipsDecl = (
  store: Store,
  create: (store: Store) => Relationships,
  createDeps?: React.DependencyList,
): Relationships | undefined => useCreate(store, create, createDeps);

export const useRelationshipsIds: typeof useRelationshipsIdsDecl = () =>
  useThingIds(7);

export const useRelationshipIds: typeof useRelationshipIdsDecl = (
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    'RelationshipIds',
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    1,
  );

export const useRemoteRowId: typeof useRemoteRowIdDecl = (
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Id | undefined =>
  useListenable(
    'RemoteRowId',
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    3,
    [relationshipId, localRowId],
  );

export const useLocalRowIds: typeof useLocalRowIdsDecl = (
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    'Local' + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    1,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIds: typeof useLinkedRowIdsDecl = (
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    'Linked' + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    1,
    [relationshipId, firstRowId],
  );

export const useRemoteRowIdListener: typeof useRemoteRowIdListenerDecl = (
  relationshipId: IdOrNull,
  localRowId: IdOrNull,
  listener: RemoteRowIdListener,
  listenerDeps?: React.DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void =>
  useListener(
    'RemoteRowId',
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    listenerDeps,
    [relationshipId, localRowId],
  );

export const useLocalRowIdsListener: typeof useLocalRowIdsListenerDecl = (
  relationshipId: IdOrNull,
  remoteRowId: IdOrNull,
  listener: LocalRowIdsListener,
  listenerDeps?: React.DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void =>
  useListener(
    'Local' + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    listenerDeps,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIdsListener: typeof useLinkedRowIdsListenerDecl = (
  relationshipId: Id,
  firstRowId: Id,
  listener: LinkedRowIdsListener,
  listenerDeps?: React.DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void =>
  useListener(
    'Linked' + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    listenerDeps,
    [relationshipId, firstRowId],
  );

export const useCreateQueries: typeof useCreateQueriesDecl = (
  store: Store,
  create: (store: Store) => Queries,
  createDeps?: React.DependencyList,
): Queries | undefined => useCreate(store, create, createDeps);

export const useQueriesIds: typeof useQueriesIdsDecl = () => useThingIds(9);

export const useQueryIds: typeof useQueryIdsDecl = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable('QueryIds', useQueriesOrQueriesById(queriesOrQueriesId), 1);

export const useResultTable: typeof useResultTableDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Table =>
  useListenable(
    RESULT + TABLE,
    useQueriesOrQueriesById(queriesOrQueriesId),
    0,
    [queryId],
  );

export const useResultTableCellIds: typeof useResultTableCellIdsDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + TABLE + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    1,
    [queryId],
  );

export const useResultRowCount: typeof useResultRowCountDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): number =>
  useListenable(
    RESULT + ROW_COUNT,
    useQueriesOrQueriesById(queriesOrQueriesId),
    5,
    [queryId],
  );

export const useResultRowIds: typeof useResultRowIdsDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    1,
    [queryId],
  );

export const useResultSortedRowIds: typeof useResultSortedRowIdsDecl = (
  queryId: Id,
  cellId?: Id,
  descending?: boolean,
  offset = 0,
  limit?: number,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + SORTED_ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    1,
    [queryId, cellId, descending, offset, limit],
  );

export const useResultRow: typeof useResultRowDecl = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Row =>
  useListenable(RESULT + ROW, useQueriesOrQueriesById(queriesOrQueriesId), 0, [
    queryId,
    rowId,
  ]);

export const useResultCellIds: typeof useResultCellIdsDecl = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    1,
    [queryId, rowId],
  );

export const useResultCell: typeof useResultCellDecl = (
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Cell | undefined =>
  useListenable(RESULT + CELL, useQueriesOrQueriesById(queriesOrQueriesId), 3, [
    queryId,
    rowId,
    cellId,
  ]);

export const useResultTableListener: typeof useResultTableListenerDecl = (
  queryId: IdOrNull,
  listener: ResultTableListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + TABLE,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId],
  );

export const useResultTableCellIdsListener: typeof useResultTableCellIdsListenerDecl =
  (
    queryId: IdOrNull,
    listener: ResultTableCellIdsListener,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId,
  ): void =>
    useListener(
      RESULT + TABLE + CELL_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId],
    );

export const useResultRowCountListener: typeof useResultRowCountListenerDecl = (
  queryId: IdOrNull,
  listener: ResultRowCountListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + ROW_COUNT,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId],
  );

export const useResultRowIdsListener: typeof useResultRowIdsListenerDecl = (
  queryId: IdOrNull,
  listener: ResultRowIdsListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId],
  );

export const useResultSortedRowIdsListener: typeof useResultSortedRowIdsListenerDecl =
  (
    queryId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: ResultSortedRowIdsListener,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId,
  ): void =>
    useListener(
      RESULT + SORTED_ROW_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId, cellId, descending, offset, limit],
    );

export const useResultRowListener: typeof useResultRowListenerDecl = (
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultRowListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + ROW,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId, rowId],
  );

export const useResultCellIdsListener: typeof useResultCellIdsListenerDecl = (
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultCellIdsListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId, rowId],
  );

export const useResultCellListener: typeof useResultCellListenerDecl = (
  queryId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: ResultCellListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + CELL,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId, rowId, cellId],
  );

export const useCreateCheckpoints: typeof useCreateCheckpointsDecl = (
  store: Store,
  create: (store: Store) => Checkpoints,
  createDeps?: React.DependencyList,
): Checkpoints | undefined => useCreate(store, create, createDeps);

export const useCheckpointsIds: typeof useCheckpointsIdsDecl = () =>
  useThingIds(11);

export const useCheckpointIds: typeof useCheckpointIdsDecl = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): CheckpointIds =>
  useListenable(
    'CheckpointIds',
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    2,
  );

export const useCheckpoint: typeof useCheckpointDecl = (
  checkpointId: Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): string | undefined =>
  useListenable(
    'Checkpoint',
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    3,
    [checkpointId],
  );

export const useSetCheckpointCallback: typeof useSetCheckpointCallbackDecl = <
  Parameter,
>(
  getCheckpoint: (parameter: Parameter) => string | undefined = getUndefined,
  getCheckpointDeps: React.DependencyList = EMPTY_ARRAY,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then: (
    checkpointId: Id,
    checkpoints: Checkpoints,
    label?: string,
  ) => void = getUndefined,
  thenDeps: React.DependencyList = EMPTY_ARRAY,
): ParameterizedCallback<Parameter> => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return useCallback(
    (parameter) =>
      ifNotUndefined(checkpoints, (checkpoints) => {
        const label = getCheckpoint(parameter as any);
        then(checkpoints.addCheckpoint(label), checkpoints, label);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoints, ...getCheckpointDeps, ...thenDeps],
  );
};

export const useGoBackwardCallback: typeof useGoBackwardCallbackDecl = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback => useCheckpointAction(checkpointsOrCheckpointsId, 'goBackward');

export const useGoForwardCallback: typeof useGoForwardCallbackDecl = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback => useCheckpointAction(checkpointsOrCheckpointsId, 'goForward');

export const useGoToCallback: typeof useGoToCallbackDecl = <Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  getCheckpointIdDeps: React.DependencyList = EMPTY_ARRAY,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then: (checkpoints: Checkpoints, checkpointId: Id) => void = getUndefined,
  thenDeps: React.DependencyList = EMPTY_ARRAY,
): ParameterizedCallback<Parameter> => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return useCallback(
    (parameter) =>
      ifNotUndefined(checkpoints, (checkpoints) =>
        ifNotUndefined(getCheckpointId(parameter as any), (checkpointId: Id) =>
          then(checkpoints.goTo(checkpointId), checkpointId),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoints, ...getCheckpointIdDeps, ...thenDeps],
  );
};

export const useUndoInformation: typeof useUndoInformationDecl = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  const [backwardIds, currentId] = useCheckpointIds(checkpoints);
  return [
    !arrayIsEmpty(backwardIds),
    useGoBackwardCallback(checkpoints),
    currentId,
    ifNotUndefined(currentId, (id) => checkpoints?.getCheckpoint(id)) ??
      EMPTY_STRING,
  ];
};

export const useRedoInformation: typeof useRedoInformationDecl = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  const [, , [forwardId]] = useCheckpointIds(checkpoints);
  return [
    !isUndefined(forwardId),
    useGoForwardCallback(checkpoints),
    forwardId,
    ifNotUndefined(forwardId, (id) => checkpoints?.getCheckpoint(id)) ??
      EMPTY_STRING,
  ];
};

export const useCheckpointIdsListener: typeof useCheckpointIdsListenerDecl = (
  listener: CheckpointIdsListener,
  listenerDeps?: React.DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void =>
  useListener(
    'CheckpointIds',
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    listener,
    listenerDeps,
  );

export const useCheckpointListener: typeof useCheckpointListenerDecl = (
  checkpointId: IdOrNull,
  listener: CheckpointListener,
  listenerDeps?: React.DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void =>
  useListener(
    'Checkpoint',
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    listener,
    listenerDeps,
    [checkpointId],
  );

export const useCreatePersister: typeof useCreatePersisterDecl = <
  PersisterOrUndefined extends Persister | undefined,
>(
  store: Store,
  create: (store: Store) => PersisterOrUndefined,
  createDeps: React.DependencyList = EMPTY_ARRAY,
  then?: (persister: Persister) => Promise<void>,
  thenDeps: React.DependencyList = EMPTY_ARRAY,
  destroy?: (persister: Persister) => void,
  destroyDeps: React.DependencyList = EMPTY_ARRAY,
): PersisterOrUndefined => {
  const [, rerender] = useState<[]>();
  const [persister, setPersister] = useState<any>();

  useEffect(
    () => {
      const newPersister = create(store);
      setPersister(newPersister);
      if (newPersister) {
        if (then) {
          (async () => {
            await then(newPersister);
            rerender([]);
          })();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps, ...thenDeps],
  );
  useEffect(
    () => () => {
      if (persister) {
        persister.destroy();
        destroy?.(persister);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persister, ...destroyDeps],
  );
  return persister;
};
