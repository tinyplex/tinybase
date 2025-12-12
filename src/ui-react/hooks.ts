import type {DependencyList} from 'react';
import type {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../@types/checkpoints/index.d.ts';
import type {
  Callback,
  Id,
  IdOrNull,
  Ids,
  ParameterizedCallback,
} from '../@types/common/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../@types/indexes/index.d.ts';
import type {MergeableStore} from '../@types/mergeable-store/index.d.ts';
import type {MetricListener, Metrics} from '../@types/metrics/index.d.ts';
import type {
  AnyPersister,
  PersistedStore,
  Persister,
  Persists,
  Status,
  StatusListener,
} from '../@types/persisters/index.d.ts';
import type {
  ParamValue,
  ParamValueListener,
  ParamValues,
  ParamValuesListener,
  Queries,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRowCountListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultSortedRowIdsListener,
  ResultTableCellIdsListener,
  ResultTableListener,
} from '../@types/queries/index.d.ts';
import type {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../@types/relationships/index.d.ts';
import type {
  Cell,
  CellIdsListener,
  CellListener,
  CellOrUndefined,
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
  SortedRowIdsArgs,
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
  ValueOrUndefined,
  Values,
  ValuesListener,
} from '../@types/store/index.d.ts';
import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
import type {
  CheckpointsOrCheckpointsId,
  GetId,
  IndexesOrIndexesId,
  MetricsOrMetricsId,
  PersisterOrPersisterId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
  SynchronizerOrSynchronizerId,
  UndoOrRedoInformation,
  useAddRowCallback as useAddRowCallbackDecl,
  useCell as useCellDecl,
  useCellIds as useCellIdsDecl,
  useCellIdsListener as useCellIdsListenerDecl,
  useCellListener as useCellListenerDecl,
  useCellState as useCellStateDecl,
  useCheckpoint as useCheckpointDecl,
  useCheckpointIds as useCheckpointIdsDecl,
  useCheckpointIdsListener as useCheckpointIdsListenerDecl,
  useCheckpointListener as useCheckpointListenerDecl,
  useCheckpoints as useCheckpointsDecl,
  useCheckpointsIds as useCheckpointsIdsDecl,
  useCheckpointsOrCheckpointsById as useCheckpointsOrCheckpointsByIdDecl,
  useCreateCheckpoints as useCreateCheckpointsDecl,
  useCreateIndexes as useCreateIndexesDecl,
  useCreateMergeableStore as useCreateMergeableStoreDecl,
  useCreateMetrics as useCreateMetricsDecl,
  useCreatePersister as useCreatePersisterDecl,
  useCreateQueries as useCreateQueriesDecl,
  useCreateRelationships as useCreateRelationshipsDecl,
  useCreateStore as useCreateStoreDecl,
  useCreateSynchronizer as useCreateSynchronizerDecl,
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
  useIndexes as useIndexesDecl,
  useIndexesIds as useIndexesIdsDecl,
  useIndexesOrIndexesById as useIndexesOrIndexesByIdDecl,
  useLinkedRowIds as useLinkedRowIdsDecl,
  useLinkedRowIdsListener as useLinkedRowIdsListenerDecl,
  useLocalRowIds as useLocalRowIdsDecl,
  useLocalRowIdsListener as useLocalRowIdsListenerDecl,
  useMetric as useMetricDecl,
  useMetricIds as useMetricIdsDecl,
  useMetricListener as useMetricListenerDecl,
  useMetrics as useMetricsDecl,
  useMetricsIds as useMetricsIdsDecl,
  useMetricsOrMetricsById as useMetricsOrMetricsByIdDecl,
  useParamValue as useParamValueDecl,
  useParamValueListener as useParamValueListenerDecl,
  useParamValues as useParamValuesDecl,
  useParamValuesListener as useParamValuesListenerDecl,
  usePersister as usePersisterDecl,
  usePersisterIds as usePersisterIdsDecl,
  usePersisterOrPersisterById as usePersisterOrPersisterByIdDecl,
  usePersisterStatus as usePersisterStatusDecl,
  usePersisterStatusListener as usePersisterStatusListenerDecl,
  useProvideCheckpoints as useProvideCheckpointsDecl,
  useProvideIndexes as useProvideIndexesDecl,
  useProvideMetrics as useProvideMetricsDecl,
  useProvidePersister as useProvidePersisterDecl,
  useProvideQueries as useProvideQueriesDecl,
  useProvideRelationships as useProvideRelationshipsDecl,
  useProvideStore as useProvideStoreDecl,
  useProvideSynchronizer as useProvideSynchronizerDecl,
  useQueries as useQueriesDecl,
  useQueriesIds as useQueriesIdsDecl,
  useQueriesOrQueriesById as useQueriesOrQueriesByIdDecl,
  useQueryIds as useQueryIdsDecl,
  useRedoInformation as useRedoInformationDecl,
  useRelationshipIds as useRelationshipIdsDecl,
  useRelationships as useRelationshipsDecl,
  useRelationshipsIds as useRelationshipsIdsDecl,
  useRelationshipsOrRelationshipsById as useRelationshipsOrRelationshipsByIdDecl,
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
  useRowState as useRowStateDecl,
  useSetCellCallback as useSetCellCallbackDecl,
  useSetCheckpointCallback as useSetCheckpointCallbackDecl,
  useSetParamValueCallback as useSetParamValueCallbackDecl,
  useSetParamValuesCallback as useSetParamValuesCallbackDecl,
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
  useStore as useStoreDecl,
  useStoreIds as useStoreIdsDecl,
  useStoreOrStoreById as useStoreOrStoreByIdDecl,
  useStores as useStoresDecl,
  useSynchronizer as useSynchronizerDecl,
  useSynchronizerIds as useSynchronizerIdsDecl,
  useSynchronizerOrSynchronizerById as useSynchronizerOrSynchronizerByIdDecl,
  useSynchronizerStatus as useSynchronizerStatusDecl,
  useSynchronizerStatusListener as useSynchronizerStatusListenerDecl,
  useTableCellIds as useTableCellIdsDecl,
  useTableCellIdsListener as useTableCellIdsListenerDecl,
  useTable as useTableDecl,
  useTableIds as useTableIdsDecl,
  useTableIdsListener as useTableIdsListenerDecl,
  useTableListener as useTableListenerDecl,
  useTableState as useTableStateDecl,
  useTables as useTablesDecl,
  useTablesListener as useTablesListenerDecl,
  useTablesState as useTablesStateDecl,
  useUndoInformation as useUndoInformationDecl,
  useValue as useValueDecl,
  useValueIds as useValueIdsDecl,
  useValueIdsListener as useValueIdsListenerDecl,
  useValueListener as useValueListenerDecl,
  useValueState as useValueStateDecl,
  useValues as useValuesDecl,
  useValuesListener as useValuesListenerDecl,
  useValuesState as useValuesStateDecl,
  useWillFinishTransactionListener as useWillFinishTransactionListenerDecl,
} from '../@types/ui-react/index.d.ts';
import {
  arrayFilter,
  arrayIsEmpty,
  arrayIsEqual,
  arrayMap,
  arrayOrValueEqual,
} from '../common/array.ts';
import {ListenerArgument} from '../common/listeners.ts';
import {IdObj, isObject, objIsEqual} from '../common/obj.ts';
import {
  getUndefined,
  ifNotUndefined,
  isFunction,
  isUndefined,
} from '../common/other.ts';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from '../common/react.ts';
import {
  ADD,
  CELL,
  CELL_IDS,
  CHECKPOINT,
  DEL,
  EMPTY_STRING,
  FINISH,
  GET,
  HAS,
  IDS,
  INDEX,
  LINKED,
  LISTENER,
  LOCAL,
  METRIC,
  PARTIAL,
  QUERY,
  RELATIONSHIP,
  REMOTE_ROW_ID,
  RESULT,
  ROW,
  ROW_COUNT,
  ROW_IDS,
  SET,
  SLICE,
  SORTED_ROW_IDS,
  STATUS,
  TABLE,
  TABLES,
  TABLE_IDS,
  TRANSACTION,
  VALUE,
  VALUES,
  VALUE_IDS,
  _HAS,
} from '../common/strings.ts';
import {
  useProvideThing,
  useThing,
  useThingIds,
  useThingOrThingById,
  useThings,
} from './context.ts';
import {
  OFFSET_CHECKPOINTS,
  OFFSET_INDEXES,
  OFFSET_METRICS,
  OFFSET_PERSISTER,
  OFFSET_QUERIES,
  OFFSET_RELATIONSHIPS,
  OFFSET_STORE,
  OFFSET_SYNCHRONIZER,
} from './Provider.tsx';

const EMPTY_ARRAY: Readonly<[]> = [];

enum ReturnType {
  Object,
  Array,
  Checkpoints,
  ParamValues,
  ParamValue,
  CellOrValue,
  Boolean,
  Number,
}
const DEFAULTS = [
  {},
  [],
  [EMPTY_ARRAY, undefined, EMPTY_ARRAY],
  {},
  undefined,
  undefined,
  false,
  0,
];
const IS_EQUALS: ((thing1: any, thing2: any) => boolean)[] = [
  objIsEqual,
  arrayIsEqual,
  (
    [backwardIds1, currentId1, forwardIds1]: CheckpointIds,
    [backwardIds2, currentId2, forwardIds2]: CheckpointIds,
  ) =>
    currentId1 === currentId2 &&
    arrayIsEqual(backwardIds1, backwardIds2) &&
    arrayIsEqual(forwardIds1, forwardIds2),
  (paramValues1: ParamValues, paramValues2: ParamValues): boolean =>
    objIsEqual(paramValues1, paramValues2, arrayOrValueEqual),
  arrayOrValueEqual,
];
const isEqual = (thing1: any, thing2: any) => thing1 === thing2;

const useCreate = (
  store: Store | undefined,
  create: (store: Store) => any,
  createDeps: DependencyList = EMPTY_ARRAY,
) => {
  const [, rerender] = useState<[]>();
  const [thing, setThing] = useState();
  useEffect(
    () => {
      const newThing = store ? create(store) : undefined;
      setThing(newThing);
      rerender([]);
      return newThing?.destroy;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps],
  );
  return thing;
};

const addAndDelListener = (thing: any, listenable: string, ...args: any[]) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener?.(listenerId);
};

const useListenable = (
  listenable: string,
  thing: any,
  returnType: ReturnType,
  args: Readonly<ListenerArgument[]> = EMPTY_ARRAY,
): any => {
  const lastResult = useRef(DEFAULTS[returnType]);
  const getResult = useCallback(
    () => {
      const nextResult =
        thing?.[(returnType == ReturnType.Boolean ? _HAS : GET) + listenable]?.(
          ...args,
        ) ?? DEFAULTS[returnType];
      return !(IS_EQUALS[returnType] ?? isEqual)(nextResult, lastResult.current)
        ? (lastResult.current = nextResult)
        : lastResult.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args],
  );
  const subscribe = useCallback(
    (listener: () => void) =>
      addAndDelListener(
        thing,
        (returnType == ReturnType.Boolean ? HAS : EMPTY_STRING) + listenable,
        ...args,
        listener,
      ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args],
  );
  return useSyncExternalStore(subscribe, getResult, getResult);
};

const useListener = (
  listenable: string,
  thing: any,
  listener: (...args: any[]) => void,
  listenerDeps: DependencyList = EMPTY_ARRAY,
  preArgs: Readonly<ListenerArgument[]> = EMPTY_ARRAY,
  ...postArgs: ListenerArgument[]
): void =>
  useLayoutEffect(
    () =>
      addAndDelListener(thing, listenable, ...preArgs, listener, ...postArgs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thing, listenable, ...preArgs, ...listenerDeps, ...postArgs],
  );

const useSetCallback = <Parameter, Thing, StoreOrQueries>(
  storeOrQueries: StoreOrQueries | undefined,
  settable: string,
  get: (parameter: Parameter, obj: StoreOrQueries) => Thing,
  getDeps: DependencyList = EMPTY_ARRAY,
  then: (obj: StoreOrQueries, thing: Thing) => void = getUndefined,
  thenDeps: DependencyList = EMPTY_ARRAY,
  methodPrefix?: string,
  ...args: (Id | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> =>
  useCallback(
    (parameter?: Parameter) =>
      ifNotUndefined(storeOrQueries, (obj: any) =>
        ifNotUndefined(get(parameter as any, obj), (thing: Thing) =>
          then(
            obj[methodPrefix + settable](
              ...argsOrGetArgs(args, obj, parameter),
              thing,
            ),
            thing,
          ),
        ),
      ),
    /* eslint-disable react-hooks/exhaustive-deps */
    [
      storeOrQueries,
      settable,
      ...getDeps,
      ...thenDeps,
      methodPrefix,
      ...nonFunctionDeps(args),
    ],
    /* eslint-enable react-hooks/exhaustive-deps */
  );

const useStoreSetCallback = <Parameter, Thing>(
  storeOrStoreId: StoreOrStoreId | undefined,
  settable: string,
  get: (parameter: Parameter, store: Store) => Thing,
  getDeps?: DependencyList,
  then?: (store: Store, thing: Thing) => void,
  thenDeps?: DependencyList,
  ...args: (Id | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    useStoreOrStoreById(storeOrStoreId),
    settable,
    get,
    getDeps,
    then,
    thenDeps,
    SET,
    ...args,
  );

const useQueriesSetCallback = <Parameter, Thing>(
  queriesOrQueriesId: QueriesOrQueriesId | undefined,
  settable: string,
  get: (parameter: Parameter, queries: Queries) => Thing,
  getDeps?: DependencyList,
  then?: (queries: Queries, thing: Thing) => void,
  thenDeps?: DependencyList,
  ...args: (Id | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    useQueriesOrQueriesById(queriesOrQueriesId),
    settable,
    get,
    getDeps,
    then,
    thenDeps,
    EMPTY_STRING,
    ...args,
  );

const argsOrGetArgs = <Parameter>(
  args: (Id | GetId<Parameter> | boolean | undefined)[],
  store: Store,
  parameter?: Parameter,
) =>
  arrayMap(args, (arg) =>
    isFunction(arg) ? arg(parameter as any, store) : arg,
  );

const nonFunctionDeps = <Parameter>(
  args: (Id | GetId<Parameter> | boolean | undefined)[],
) => arrayFilter(args, (arg) => !isFunction(arg));

const useDel = <Parameter>(
  storeOrStoreId: StoreOrStoreId | undefined,
  deletable: string,
  then: (store: Store) => void = getUndefined,
  thenDeps: DependencyList = EMPTY_ARRAY,
  ...args: (Id | GetId<Parameter> | boolean | undefined)[]
): ParameterizedCallback<Parameter> => {
  const store: any = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (parameter?: Parameter) =>
      then(store?.[DEL + deletable](...argsOrGetArgs(args, store, parameter))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, deletable, ...thenDeps, ...nonFunctionDeps(args)],
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
    [checkpoints, action, arg],
  );
};

const useSortedRowIdsImpl = (
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number | undefined,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    SORTED_ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId, cellId, descending, offset, limit],
  );

export const useSortedRowIdsListenerImpl = (
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: SortedRowIdsListener,
  listenerDeps?: DependencyList,
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

// ---

export const useCreateStore: typeof useCreateStoreDecl = (
  create: () => Store,
  createDeps: DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): Store => useMemo(create, createDeps);

export const useStoreIds: typeof useStoreIdsDecl = () =>
  useThingIds(OFFSET_STORE);

export const useStore: typeof useStoreDecl = (id?: Id): Store | undefined =>
  useThing(id, OFFSET_STORE);

export const useStores: typeof useStoresDecl = (): IdObj<Store> =>
  useThings(OFFSET_STORE);

export const useStoreOrStoreById: typeof useStoreOrStoreByIdDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined => useThingOrThingById(storeOrStoreId, OFFSET_STORE);

export const useProvideStore: typeof useProvideStoreDecl = (
  storeId: Id,
  store: Store,
): void => useProvideThing(storeId, store, OFFSET_STORE);

export const useCreateMergeableStore: typeof useCreateMergeableStoreDecl = (
  create: () => MergeableStore,
  createDeps: DependencyList = EMPTY_ARRAY,
  // eslint-disable-next-line react-hooks/exhaustive-deps
): MergeableStore => useMemo(create, createDeps);

export const useHasTables: typeof useHasTablesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    TABLES,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [],
  );

export const useTables: typeof useTablesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Tables =>
  useListenable(TABLES, useStoreOrStoreById(storeOrStoreId), ReturnType.Object);

export const useTablesState: typeof useTablesStateDecl = (
  storeOrStoreId?: StoreOrStoreId,
): [Tables, (tables: Tables) => void] => [
  useTables(storeOrStoreId),
  useSetTablesCallback((tables) => tables, [], storeOrStoreId),
];

export const useTableIds: typeof useTableIdsDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    TABLE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
  );

export const useHasTable: typeof useHasTableDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    TABLE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [tableId],
  );

export const useTable: typeof useTableDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Table =>
  useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), ReturnType.Object, [
    tableId,
  ]);

export const useTableState: typeof useTableStateDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Table, (table: Table) => void] => [
  useTable(tableId, storeOrStoreId),
  useSetTableCallback(tableId, (table) => table, [], storeOrStoreId),
];

export const useTableCellIds: typeof useTableCellIdsDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    TABLE + CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId],
  );

export const useHasTableCell: typeof useHasTableCellDecl = (
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    TABLE + CELL,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [tableId, cellId],
  );

export const useRowCount: typeof useRowCountDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): number =>
  useListenable(
    ROW_COUNT,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Number,
    [tableId],
  );

export const useRowIds: typeof useRowIdsDecl = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId],
  );

export const useSortedRowIds: typeof useSortedRowIdsDecl = (
  tableIdOrArgs: Id | SortedRowIdsArgs,
  cellIdOrStoreOrStoreId?: Id | StoreOrStoreId,
  descending?: boolean,
  offset?: number,
  limit?: number | undefined,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  (useSortedRowIdsImpl as any)(
    ...(isObject(tableIdOrArgs)
      ? [
          tableIdOrArgs.tableId,
          tableIdOrArgs.cellId,
          tableIdOrArgs.descending ?? false,
          tableIdOrArgs.offset ?? 0,
          tableIdOrArgs.limit,
          cellIdOrStoreOrStoreId,
        ]
      : [
          tableIdOrArgs,
          cellIdOrStoreOrStoreId,
          descending,
          offset,
          limit,
          storeOrStoreId,
        ]),
  );

export const useHasRow: typeof useHasRowDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), ReturnType.Boolean, [
    tableId,
    rowId,
  ]);

export const useRow: typeof useRowDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Row =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), ReturnType.Object, [
    tableId,
    rowId,
  ]);

export const useRowState: typeof useRowStateDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Row, (row: Row) => void] => [
  useRow(tableId, rowId, storeOrStoreId),
  useSetRowCallback(tableId, rowId, (row) => row, [], storeOrStoreId),
];

export const useCellIds: typeof useCellIdsDecl = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId, rowId],
  );

export const useHasCell: typeof useHasCellDecl = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(CELL, useStoreOrStoreById(storeOrStoreId), ReturnType.Boolean, [
    tableId,
    rowId,
    cellId,
  ]);

export const useCell: typeof useCellDecl = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): CellOrUndefined =>
  useListenable(
    CELL,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.CellOrValue,
    [tableId, rowId, cellId],
  );

export const useCellState: typeof useCellStateDecl = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [CellOrUndefined, (cell: Cell) => void] => [
  useCell(tableId, rowId, cellId, storeOrStoreId),
  useSetCellCallback(
    tableId,
    rowId,
    cellId,
    (cell) => cell,
    [],
    storeOrStoreId,
  ),
];

export const useHasValues: typeof useHasValuesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    VALUES,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [],
  );

export const useValues: typeof useValuesDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Values =>
  useListenable(VALUES, useStoreOrStoreById(storeOrStoreId), ReturnType.Object);

export const useValuesState: typeof useValuesStateDecl = (
  storeOrStoreId?: StoreOrStoreId,
): [Values, (values: Values) => void] => [
  useValues(storeOrStoreId),
  useSetValuesCallback((values) => values, [], storeOrStoreId),
];

export const useValueIds: typeof useValueIdsDecl = (
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    VALUE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
  );

export const useHasValue: typeof useHasValueDecl = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [valueId],
  );

export const useValue: typeof useValueDecl = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): ValueOrUndefined =>
  useListenable(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.CellOrValue,
    [valueId],
  );

export const useValueState: typeof useValueStateDecl = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [ValueOrUndefined, (value: Value) => void] => [
  useValue(valueId, storeOrStoreId),
  useSetValueCallback(valueId, (value) => value, [], storeOrStoreId),
];

export const useSetTablesCallback: typeof useSetTablesCallbackDecl = <
  Parameter,
>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  getTablesDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, tables: Tables) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
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
  getTableDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, table: Table) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
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
  getRowDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, row: Row) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
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
  getRowDeps: DependencyList = EMPTY_ARRAY,
  storeOrStoreId?: StoreOrStoreId,
  then: (rowId: Id | undefined, store: Store, row: Row) => void = getUndefined,
  thenDeps: DependencyList = EMPTY_ARRAY,
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
  getPartialRowDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialRow: Row) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
    storeOrStoreId,
    PARTIAL + ROW,
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
  getCellDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, cell: Cell | MapCell) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
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
  getValuesDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, values: Values) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
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
    getPartialValuesDeps?: DependencyList,
    storeOrStoreId?: StoreOrStoreId,
    then?: (store: Store, partialValues: Values) => void,
    thenDeps?: DependencyList,
  ): ParameterizedCallback<Parameter> =>
    useStoreSetCallback(
      storeOrStoreId,
      PARTIAL + VALUES,
      getPartialValues,
      getPartialValuesDeps,
      then,
      thenDeps,
    );

export const useSetValueCallback: typeof useSetValueCallbackDecl = <Parameter>(
  valueId: Id | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  getValueDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, value: Value | MapValue) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
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
  thenDeps?: DependencyList,
): Callback => useDel(storeOrStoreId, TABLES, then, thenDeps);

export const useDelTableCallback: typeof useDelTableCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, TABLE, then, thenDeps, tableId);

export const useDelRowCallback: typeof useDelRowCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, ROW, then, thenDeps, tableId, rowId);

export const useDelCellCallback: typeof useDelCellCallbackDecl = <Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  forceDel?: boolean,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
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
  thenDeps?: DependencyList,
): Callback => useDel(storeOrStoreId, VALUES, then, thenDeps);

export const useDelValueCallback: typeof useDelValueCallbackDecl = <Parameter>(
  valueId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, VALUE, then, thenDeps, valueId);

export const useHasTablesListener: typeof useHasTablesListenerDecl = (
  listener: HasTablesListener,
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  tableIdOrArgs: Id | SortedRowIdsArgs,
  cellIdOrListener: Id | undefined | SortedRowIdsListener,
  descendingOrListenerDeps: boolean | DependencyList | undefined,
  offsetOrMutator: number | boolean | undefined,
  limitOrStoreOrStoreId: number | undefined | StoreOrStoreId,
  listener?: SortedRowIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void =>
  (useSortedRowIdsListenerImpl as any)(
    ...(isObject(tableIdOrArgs)
      ? [
          tableIdOrArgs.tableId,
          tableIdOrArgs.cellId,
          tableIdOrArgs.descending ?? false,
          tableIdOrArgs.offset ?? 0,
          tableIdOrArgs.limit,
          cellIdOrListener,
          descendingOrListenerDeps,
          offsetOrMutator,
          limitOrStoreOrStoreId,
        ]
      : [
          tableIdOrArgs,
          cellIdOrListener,
          descendingOrListenerDeps,
          offsetOrMutator,
          limitOrStoreOrStoreId,
          listener,
          listenerDeps,
          mutator,
          storeOrStoreId,
        ]),
  );

export const useHasRowListener: typeof useHasRowListenerDecl = (
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: HasRowListener,
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
    listenerDeps?: DependencyList,
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
    listenerDeps?: DependencyList,
    storeOrStoreId?: StoreOrStoreId,
  ): void =>
    useListener(
      'Will' + FINISH + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );

export const useDidFinishTransactionListener: typeof useDidFinishTransactionListenerDecl =
  (
    listener: TransactionListener,
    listenerDeps?: DependencyList,
    storeOrStoreId?: StoreOrStoreId,
  ): void =>
    useListener(
      'Did' + FINISH + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );

export const useCreateMetrics: typeof useCreateMetricsDecl = (
  store: Store | undefined,
  create: (store: Store) => Metrics,
  createDeps?: DependencyList,
): Metrics | undefined => useCreate(store, create, createDeps);

export const useMetricsIds: typeof useMetricsIdsDecl = () =>
  useThingIds(OFFSET_METRICS);

export const useMetrics: typeof useMetricsDecl = (
  id?: Id,
): Metrics | undefined => useThing(id, OFFSET_METRICS);

export const useMetricsOrMetricsById: typeof useMetricsOrMetricsByIdDecl = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined =>
  useThingOrThingById(metricsOrMetricsId, OFFSET_METRICS);

export const useProvideMetrics: typeof useProvideMetricsDecl = (
  metricsId: Id,
  metrics: Metrics,
): void => useProvideThing(metricsId, metrics, OFFSET_METRICS);

export const useMetricIds: typeof useMetricIdsDecl = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Ids =>
  useListenable(
    METRIC + IDS,
    useMetricsOrMetricsById(metricsOrMetricsId),
    ReturnType.Array,
  );

export const useMetric: typeof useMetricDecl = (
  metricId: Id,
  metricsOrMetricsId?: MetricsOrMetricsId,
): number | undefined =>
  useListenable(
    METRIC,
    useMetricsOrMetricsById(metricsOrMetricsId),
    ReturnType.CellOrValue,
    [metricId],
  );

export const useMetricListener: typeof useMetricListenerDecl = (
  metricId: IdOrNull,
  listener: MetricListener,
  listenerDeps?: DependencyList,
  metricsOrMetricsId?: MetricsOrMetricsId,
): void =>
  useListener(
    METRIC,
    useMetricsOrMetricsById(metricsOrMetricsId),
    listener,
    listenerDeps,
    [metricId],
  );

export const useCreateIndexes: typeof useCreateIndexesDecl = (
  store: Store | undefined,
  create: (store: Store) => Indexes,
  createDeps?: DependencyList,
): Indexes | undefined => useCreate(store, create, createDeps);

export const useIndexesIds: typeof useIndexesIdsDecl = () =>
  useThingIds(OFFSET_INDEXES);

export const useIndexes: typeof useIndexesDecl = (
  id?: Id,
): Indexes | undefined => useThing(id, OFFSET_INDEXES);

export const useIndexesOrIndexesById: typeof useIndexesOrIndexesByIdDecl = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined =>
  useThingOrThingById(indexesOrIndexesId, OFFSET_INDEXES);

export const useProvideIndexes: typeof useProvideIndexesDecl = (
  indexesId: Id,
  indexes: Indexes,
): void => useProvideThing(indexesId, indexes, OFFSET_INDEXES);

export const useSliceIds: typeof useSliceIdsDecl = (
  indexId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable(
    SLICE + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
    [indexId],
  );

export const useIndexIds: typeof useIndexIdsDecl = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable(
    INDEX + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
  );

export const useSliceRowIds: typeof useSliceRowIdsDecl = (
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable(
    SLICE + ROW_IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
    [indexId, sliceId],
  );

export const useSliceIdsListener: typeof useSliceIdsListenerDecl = (
  indexId: IdOrNull,
  listener: SliceIdsListener,
  listenerDeps?: DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void =>
  useListener(
    SLICE + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    listener,
    listenerDeps,
    [indexId],
  );

export const useSliceRowIdsListener: typeof useSliceRowIdsListenerDecl = (
  indexId: IdOrNull,
  sliceId: IdOrNull,
  listener: SliceRowIdsListener,
  listenerDeps?: DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void =>
  useListener(
    SLICE + ROW_IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    listener,
    listenerDeps,
    [indexId, sliceId],
  );

export const useCreateRelationships: typeof useCreateRelationshipsDecl = (
  store: Store | undefined,
  create: (store: Store) => Relationships,
  createDeps?: DependencyList,
): Relationships | undefined => useCreate(store, create, createDeps);

export const useRelationshipsIds: typeof useRelationshipsIdsDecl = () =>
  useThingIds(OFFSET_RELATIONSHIPS);

export const useRelationships: typeof useRelationshipsDecl = (
  id?: Id,
): Relationships | undefined => useThing(id, OFFSET_RELATIONSHIPS);

export const useRelationshipsOrRelationshipsById: typeof useRelationshipsOrRelationshipsByIdDecl =
  (
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
  ): Relationships | undefined =>
    useThingOrThingById(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);

export const useProvideRelationships: typeof useProvideRelationshipsDecl = (
  relationshipsId: Id,
  relationships: Relationships,
): void =>
  useProvideThing(relationshipsId, relationships, OFFSET_RELATIONSHIPS);

export const useRelationshipIds: typeof useRelationshipIdsDecl = (
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    RELATIONSHIP + IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
  );

export const useRemoteRowId: typeof useRemoteRowIdDecl = (
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Id | undefined =>
  useListenable(
    REMOTE_ROW_ID,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.CellOrValue,
    [relationshipId, localRowId],
  );

export const useLocalRowIds: typeof useLocalRowIdsDecl = (
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    LOCAL + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIds: typeof useLinkedRowIdsDecl = (
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    LINKED + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
    [relationshipId, firstRowId],
  );

export const useRemoteRowIdListener: typeof useRemoteRowIdListenerDecl = (
  relationshipId: IdOrNull,
  localRowId: IdOrNull,
  listener: RemoteRowIdListener,
  listenerDeps?: DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void =>
  useListener(
    REMOTE_ROW_ID,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    listenerDeps,
    [relationshipId, localRowId],
  );

export const useLocalRowIdsListener: typeof useLocalRowIdsListenerDecl = (
  relationshipId: IdOrNull,
  remoteRowId: IdOrNull,
  listener: LocalRowIdsListener,
  listenerDeps?: DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void =>
  useListener(
    LOCAL + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    listenerDeps,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIdsListener: typeof useLinkedRowIdsListenerDecl = (
  relationshipId: Id,
  firstRowId: Id,
  listener: LinkedRowIdsListener,
  listenerDeps?: DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void =>
  useListener(
    LINKED + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    listenerDeps,
    [relationshipId, firstRowId],
  );

export const useCreateQueries: typeof useCreateQueriesDecl = (
  store: Store | undefined,
  create: (store: Store) => Queries,
  createDeps?: DependencyList,
): Queries | undefined => useCreate(store, create, createDeps);

export const useQueriesIds: typeof useQueriesIdsDecl = () =>
  useThingIds(OFFSET_QUERIES);

export const useQueries: typeof useQueriesDecl = (
  id?: Id,
): Queries | undefined => useThing(id, OFFSET_QUERIES);

export const useQueriesOrQueriesById: typeof useQueriesOrQueriesByIdDecl = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Queries | undefined =>
  useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);

export const useProvideQueries: typeof useProvideQueriesDecl = (
  queriesId: Id,
  queries: Queries,
): void => useProvideThing(queriesId, queries, OFFSET_QUERIES);

export const useQueryIds: typeof useQueryIdsDecl = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    QUERY + IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
  );

export const useResultTable: typeof useResultTableDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Table =>
  useListenable(
    RESULT + TABLE,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Object,
    [queryId],
  );

export const useResultTableCellIds: typeof useResultTableCellIdsDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + TABLE + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId],
  );

export const useResultRowCount: typeof useResultRowCountDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): number =>
  useListenable(
    RESULT + ROW_COUNT,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Number,
    [queryId],
  );

export const useResultRowIds: typeof useResultRowIdsDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
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
    ReturnType.Array,
    [queryId, cellId, descending, offset, limit],
  );

export const useResultRow: typeof useResultRowDecl = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Row =>
  useListenable(
    RESULT + ROW,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Object,
    [queryId, rowId],
  );

export const useResultCellIds: typeof useResultCellIdsDecl = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId, rowId],
  );

export const useResultCell: typeof useResultCellDecl = (
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Cell | undefined =>
  useListenable(
    RESULT + CELL,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.CellOrValue,
    [queryId, rowId, cellId],
  );

export const useResultTableListener: typeof useResultTableListenerDecl = (
  queryId: IdOrNull,
  listener: ResultTableListener,
  listenerDeps?: DependencyList,
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
    listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
    listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
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
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    RESULT + CELL,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId, rowId, cellId],
  );

export const useParamValues: typeof useParamValuesDecl = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValues | undefined =>
  useListenable(
    'ParamValues',
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.ParamValues,
    [queryId],
  );

export const useParamValue: typeof useParamValueDecl = (
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValue | undefined =>
  useListenable(
    'ParamValue',
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.ParamValue,
    [queryId, paramId],
  );

export const useParamValuesListener: typeof useParamValuesListenerDecl = (
  queryId: IdOrNull,
  listener: ParamValuesListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    'ParamValues',
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId],
  );

export const useParamValueListener: typeof useParamValueListenerDecl = (
  queryId: IdOrNull,
  paramId: IdOrNull,
  listener: ParamValueListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void =>
  useListener(
    'ParamValue',
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    listenerDeps,
    [queryId, paramId],
  );

export const useSetParamValueCallback: typeof useSetParamValueCallbackDecl = <
  Parameter,
>(
  queryId: Id | GetId<Parameter>,
  paramId: Id | GetId<Parameter>,
  getParamValue: (parameter: Parameter, queries: Queries) => ParamValue,
  getParamValueDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValue: ParamValue) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useQueriesSetCallback(
    queriesOrQueriesId,
    'setParamValue',
    getParamValue,
    getParamValueDeps,
    then,
    thenDeps,
    queryId,
    paramId,
  );

export const useSetParamValuesCallback: typeof useSetParamValuesCallbackDecl = <
  Parameter,
>(
  queryId: Id | GetId<Parameter>,
  getParamValues: (parameter: Parameter, queries: Queries) => ParamValues,
  getParamValuesDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValues: ParamValues) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useQueriesSetCallback(
    queriesOrQueriesId,
    'setParamValues',
    getParamValues,
    getParamValuesDeps,
    then,
    thenDeps,
    queryId,
  );

export const useCreateCheckpoints: typeof useCreateCheckpointsDecl = (
  store: Store | undefined,
  create: (store: Store) => Checkpoints,
  createDeps?: DependencyList,
): Checkpoints | undefined => useCreate(store, create, createDeps);

export const useCheckpointsIds: typeof useCheckpointsIdsDecl = () =>
  useThingIds(OFFSET_CHECKPOINTS);

export const useCheckpoints: typeof useCheckpointsDecl = (
  id?: Id,
): Checkpoints | undefined => useThing(id, OFFSET_CHECKPOINTS);

export const useCheckpointsOrCheckpointsById: typeof useCheckpointsOrCheckpointsByIdDecl =
  (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  ): Checkpoints | undefined =>
    useThingOrThingById(checkpointsOrCheckpointsId, OFFSET_CHECKPOINTS);

export const useProvideCheckpoints: typeof useProvideCheckpointsDecl = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => useProvideThing(checkpointsId, checkpoints, OFFSET_CHECKPOINTS);

export const useCheckpointIds: typeof useCheckpointIdsDecl = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): CheckpointIds =>
  useListenable(
    CHECKPOINT + IDS,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    ReturnType.Checkpoints,
  );

export const useCheckpoint: typeof useCheckpointDecl = (
  checkpointId: Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): string | undefined =>
  useListenable(
    CHECKPOINT,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    ReturnType.CellOrValue,
    [checkpointId],
  );

export const useSetCheckpointCallback: typeof useSetCheckpointCallbackDecl = <
  Parameter,
>(
  getCheckpoint: (parameter: Parameter) => string | undefined = getUndefined,
  getCheckpointDeps: DependencyList = EMPTY_ARRAY,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then: (
    checkpointId: Id,
    checkpoints: Checkpoints,
    label?: string,
  ) => void = getUndefined,
  thenDeps: DependencyList = EMPTY_ARRAY,
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
  getCheckpointIdDeps: DependencyList = EMPTY_ARRAY,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then: (checkpoints: Checkpoints, checkpointId: Id) => void = getUndefined,
  thenDeps: DependencyList = EMPTY_ARRAY,
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
  listenerDeps?: DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void =>
  useListener(
    CHECKPOINT + IDS,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    listener,
    listenerDeps,
  );

export const useCheckpointListener: typeof useCheckpointListenerDecl = (
  checkpointId: IdOrNull,
  listener: CheckpointListener,
  listenerDeps?: DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void =>
  useListener(
    CHECKPOINT,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    listener,
    listenerDeps,
    [checkpointId],
  );

export const useCreatePersister: typeof useCreatePersisterDecl = <
  Persist extends Persists,
  PersisterOrUndefined extends Persister<Persist> | undefined,
>(
  store: PersistedStore<Persist> | undefined,
  create: (
    store: PersistedStore<Persist>,
  ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
  createDeps: DependencyList = EMPTY_ARRAY,
  then?: (persister: Persister<Persist>) => Promise<void>,
  thenDeps: DependencyList = EMPTY_ARRAY,
  destroy?: (persister: Persister<Persist>) => void,
  destroyDeps: DependencyList = EMPTY_ARRAY,
): PersisterOrUndefined => {
  const [, rerender] = useState<[]>();
  const [persister, setPersister] = useState<any>();
  useEffect(
    () => {
      (async () => {
        const persister = store ? await create(store) : undefined;
        setPersister(persister);
        if (persister && then) {
          (async () => {
            await then(persister);
            rerender([]);
          })();
        }
      })();
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

export const usePersisterIds: typeof usePersisterIdsDecl = () =>
  useThingIds(OFFSET_PERSISTER);

export const usePersister: typeof usePersisterDecl = (
  id?: Id,
): AnyPersister | undefined => useThing(id, OFFSET_PERSISTER);

export const usePersisterOrPersisterById: typeof usePersisterOrPersisterByIdDecl =
  (persisterOrPersisterId?: PersisterOrPersisterId): AnyPersister | undefined =>
    useThingOrThingById(persisterOrPersisterId, OFFSET_PERSISTER);

export const useProvidePersister: typeof useProvidePersisterDecl = (
  persisterId: Id,
  persister: AnyPersister,
): void => useProvideThing(persisterId, persister, OFFSET_PERSISTER);

export const usePersisterStatus: typeof usePersisterStatusDecl = (
  persisterOrPersisterId?: PersisterOrPersisterId,
): Status =>
  useListenable(
    STATUS,
    usePersisterOrPersisterById(persisterOrPersisterId),
    ReturnType.Number,
    [],
  );

export const usePersisterStatusListener: typeof usePersisterStatusListenerDecl =
  (
    listener: StatusListener,
    listenerDeps?: DependencyList,
    persisterOrPersisterId?: PersisterOrPersisterId,
  ): void =>
    useListener(
      STATUS,
      usePersisterOrPersisterById(persisterOrPersisterId),
      listener,
      listenerDeps,
      [],
    );

export const useCreateSynchronizer: typeof useCreateSynchronizerDecl = <
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MergeableStore | undefined,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  createDeps: DependencyList = EMPTY_ARRAY,
  destroy?: (synchronizer: Synchronizer) => void,
  destroyDeps: DependencyList = EMPTY_ARRAY,
): SynchronizerOrUndefined => {
  const [synchronizer, setSynchronizer] = useState<any>();
  useEffect(
    () => {
      (async () => {
        const synchronizer = store ? await create(store) : undefined;
        setSynchronizer(synchronizer);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps],
  );
  useEffect(
    () => () => {
      if (synchronizer) {
        synchronizer.destroy();
        destroy?.(synchronizer);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [synchronizer, ...destroyDeps],
  );
  return synchronizer;
};

export const useSynchronizerIds: typeof useSynchronizerIdsDecl = () =>
  useThingIds(OFFSET_SYNCHRONIZER);

export const useSynchronizer: typeof useSynchronizerDecl = (
  id?: Id,
): Synchronizer | undefined => useThing(id, OFFSET_SYNCHRONIZER);

export const useSynchronizerOrSynchronizerById: typeof useSynchronizerOrSynchronizerByIdDecl =
  (
    synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
  ): Synchronizer | undefined =>
    useThingOrThingById(synchronizerOrSynchronizerId, OFFSET_SYNCHRONIZER);

export const useProvideSynchronizer: typeof useProvideSynchronizerDecl = (
  persisterId: Id,
  persister: Synchronizer,
): void => useProvideThing(persisterId, persister, OFFSET_SYNCHRONIZER);

export const useSynchronizerStatus: typeof useSynchronizerStatusDecl = (
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Status =>
  useListenable(
    STATUS,
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    ReturnType.Number,
    [],
  );

export const useSynchronizerStatusListener: typeof useSynchronizerStatusListenerDecl =
  (
    listener: StatusListener,
    listenerDeps?: DependencyList,
    synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
  ): void =>
    useListener(
      STATUS,
      useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
      listener,
      listenerDeps,
      [],
    );
