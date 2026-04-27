import type {Accessor} from 'solid-js';
import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js';
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
} from '../@types/ui-solid/index.d.ts';
import {
  arrayIsEmpty,
  arrayIsEqual,
  arrayMap,
  arrayOrValueEqual,
} from '../common/array.ts';
import {ListenerArgument} from '../common/listeners.ts';
import {IdObj, isObject, objIsEqual} from '../common/obj.ts';
import {
  getArg,
  getUndefined,
  ifNotUndefined,
  isFunction,
  isUndefined,
} from '../common/other.ts';
import type {MaybeAccessor} from '../common/solid.ts';
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

const getThing = <Thing>(thing: MaybeAccessor<Thing>): Thing =>
  (isFunction(thing) ? (thing as Accessor<Thing>)() : thing) as Thing;

type MaybeRelationshipsOrRelationshipsId = MaybeAccessor<
  RelationshipsOrRelationshipsId | undefined
>;
type MaybeCheckpointsOrCheckpointsId = MaybeAccessor<
  CheckpointsOrCheckpointsId | undefined
>;
type MaybeSynchronizerOrSynchronizerId = MaybeAccessor<
  SynchronizerOrSynchronizerId | undefined
>;
type ListenerArgGetters = MaybeAccessor<ListenerArgument>[];
const EMPTY_LISTENER_ARG_GETTERS: ListenerArgGetters = [];

const useCreate = <Thing extends {destroy?: () => void}>(
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => Thing,
): Accessor<Thing | undefined> => {
  const [thing, setThing] = createSignal<Thing>();
  createEffect(() => {
    const resolvedStore = getThing(store);
    const newThing = resolvedStore ? create(resolvedStore) : undefined;
    setThing(() => newThing);
    onCleanup(() => newThing?.destroy?.());
  });
  return thing;
};

const addAndDelListener = (thing: any, listenable: string, ...args: any[]) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener?.(listenerId);
};

const useListenable = (
  listenable: string,
  thing: MaybeAccessor<any>,
  returnType: ReturnType,
  listenerArgGetters: ListenerArgGetters = EMPTY_LISTENER_ARG_GETTERS,
): Accessor<any> => {
  const [result, setResult] = createSignal<any>(DEFAULTS[returnType]);
  const getListenerArguments = () => arrayMap(listenerArgGetters, getThing);
  const getResult = () =>
    getThing(thing)?.[
      (returnType == ReturnType.Boolean ? _HAS : GET) + listenable
    ]?.(...getListenerArguments()) ?? DEFAULTS[returnType];
  const updateResult = () => {
    const nextResult = getResult();
    const prevResult = untrack(result);
    setResult(() =>
      !(IS_EQUALS[returnType] ?? isEqual)(nextResult, prevResult)
        ? nextResult
        : prevResult,
    );
  };
  createRenderEffect(() => {
    const resolvedThing = getThing(thing);
    const listenerArguments = getListenerArguments();
    updateResult();
    const cleanup = addAndDelListener(
      resolvedThing,
      (returnType == ReturnType.Boolean ? HAS : EMPTY_STRING) + listenable,
      ...listenerArguments,
      updateResult,
    );
    onCleanup(cleanup);
  });
  return result;
};

const useListener = (
  listenable: string,
  thing: MaybeAccessor<any>,
  listener: (...args: any[]) => void,
  preListenerArgGetters: ListenerArgGetters = EMPTY_LISTENER_ARG_GETTERS,
  ...postListenerArgGetters: MaybeAccessor<ListenerArgument>[]
): void =>
  createRenderEffect(() => {
    const cleanup = addAndDelListener(
      getThing(thing),
      listenable,
      ...arrayMap(preListenerArgGetters, getThing),
      listener,
      ...arrayMap(postListenerArgGetters, getThing),
    );
    onCleanup(cleanup);
  });

const useSetCallback =
  <Parameter, Thing, StoreOrQueries extends Store | Queries>(
    storeOrQueries: MaybeAccessor<StoreOrQueries | undefined>,
    settable: string,
    get: (parameter: Parameter, obj: StoreOrQueries) => Thing,
    then: (obj: StoreOrQueries, thing: Thing) => void = getUndefined,
    methodPrefix?: string,
    ...args: (MaybeAccessor<Id> | GetId<Parameter>)[]
  ): ParameterizedCallback<Parameter> =>
  (parameter?: Parameter) =>
    ifNotUndefined(getThing(storeOrQueries), (obj) =>
      ifNotUndefined(get(parameter as Parameter, obj), (thing: Thing) =>
        then(
          (
            obj as StoreOrQueries & {
              [method: string]: (...args: unknown[]) => StoreOrQueries;
            }
          )[methodPrefix + settable](
            ...argsOrGetArgs(args, obj, parameter),
            thing,
          ),
          thing,
        ),
      ),
    );

const useStoreSetCallback = <Parameter, Thing>(
  storeOrStoreId: MaybeAccessor<StoreOrStoreId | undefined>,
  settable: string,
  get: (parameter: Parameter, store: Store) => Thing,
  then?: (store: Store, thing: Thing) => void,
  ...args: (MaybeAccessor<Id> | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    useStoreOrStoreById(storeOrStoreId),
    settable,
    get,
    then,
    SET,
    ...args,
  );

const useQueriesSetCallback = <Parameter, Thing>(
  queriesOrQueriesId: MaybeAccessor<QueriesOrQueriesId | undefined>,
  settable: string,
  get: (parameter: Parameter, queries: Queries) => Thing,
  then?: (queries: Queries, thing: Thing) => void,
  ...args: (MaybeAccessor<Id> | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> =>
  useSetCallback(
    useQueriesOrQueriesById(queriesOrQueriesId),
    settable,
    get,
    then,
    EMPTY_STRING,
    ...args,
  );

const argsOrGetArgs = <Parameter>(
  args: (
    | MaybeAccessor<Id>
    | GetId<Parameter>
    | MaybeAccessor<boolean | undefined>
  )[],
  store: Store | Queries,
  parameter?: Parameter,
) =>
  arrayMap(args, (arg) =>
    isFunction(arg)
      ? arg.length == 0
        ? getThing(arg as MaybeAccessor<Id>)
        : (
            arg as (parameter: Parameter, storeOrQueries: Store | Queries) => Id
          )(parameter as Parameter, store)
      : arg,
  );

const useDel = <Parameter>(
  storeOrStoreId: MaybeAccessor<StoreOrStoreId | undefined>,
  deletable: string,
  then: (store: Store) => void = getUndefined,
  ...args: (
    | MaybeAccessor<Id>
    | GetId<Parameter>
    | MaybeAccessor<boolean | undefined>
  )[]
): ParameterizedCallback<Parameter> => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (parameter?: Parameter) => {
    const resolvedStore = getThing(store);
    ifNotUndefined(resolvedStore, (store) =>
      then(
        (store as unknown as {[method: string]: (...args: unknown[]) => Store})[
          DEL + deletable
        ](...argsOrGetArgs(args, store, parameter)),
      ),
    );
  };
};

const useCheckpointAction = (
  checkpointsOrCheckpointsId: MaybeCheckpointsOrCheckpointsId | undefined,
  action: string,
  arg?: string,
) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return () =>
    (
      getThing(checkpoints) as
        | {[method: string]: (arg?: string) => Checkpoints}
        | undefined
    )?.[action](arg);
};

const useSortedRowIdsImpl = (
  tableId: MaybeAccessor<Id>,
  cellId?: MaybeAccessor<Id | undefined>,
  descending?: MaybeAccessor<boolean | undefined>,
  offset?: MaybeAccessor<number | undefined>,
  limit?: MaybeAccessor<number | undefined>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  useListenable(
    SORTED_ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId, cellId, descending, offset, limit],
  );

export const useSortedRowIdsListenerImpl = (
  tableId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id | undefined>,
  descending: MaybeAccessor<boolean>,
  offset: MaybeAccessor<number>,
  limit: MaybeAccessor<number | undefined>,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    SORTED_ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, cellId, descending, offset, limit],
    mutator,
  );

// ---

export const useCreateStore = (create: () => Store): Accessor<Store> => {
  const store = createMemo(create);
  return store;
};

export const useStoreIds = () => useThingIds(OFFSET_STORE);

export const useStore = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Store | undefined> => useThing(id, OFFSET_STORE);

export const useStores = (): Accessor<IdObj<Store>> => useThings(OFFSET_STORE);

export const useStoreOrStoreById = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Store | undefined> =>
  useThingOrThingById(storeOrStoreId, OFFSET_STORE);

export const useProvideStore = (storeId: Id, store: Store): void =>
  useProvideThing(storeId, store, OFFSET_STORE);

export const useCreateMergeableStore = (
  create: () => MergeableStore,
): Accessor<MergeableStore> => {
  const mergeableStore = createMemo(create);
  return mergeableStore;
};

export const useHasTables = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(
    TABLES,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [],
  );

export const useTables = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Tables> =>
  useListenable(TABLES, useStoreOrStoreById(storeOrStoreId), ReturnType.Object);

export const useTablesState = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Tables>, (tables: Tables) => void] => [
  useTables(storeOrStoreId),
  useSetTablesCallback(getArg, storeOrStoreId),
];

export const useTableIds = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  useListenable(
    TABLE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
  );

export const useHasTable = (
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(
    TABLE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [tableId],
  );

export const useTable = (
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Table> =>
  useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), ReturnType.Object, [
    tableId,
  ]);
export const useTableState = (
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Table>, (table: Table) => void] => [
  useTable(tableId, storeOrStoreId),
  useSetTableCallback(tableId, getArg, storeOrStoreId),
];

export const useTableCellIds = (
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  useListenable(
    TABLE + CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId],
  );

export const useHasTableCell = (
  tableId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(
    TABLE + CELL,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [tableId, cellId],
  );

export const useRowCount = (
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<number> =>
  useListenable(
    ROW_COUNT,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Number,
    [tableId],
  );

export const useRowIds = (
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  useListenable(
    ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId],
  );

export const useSortedRowIds = (
  tableIdOrArgs: MaybeAccessor<Id> | SortedRowIdsArgs,
  cellIdOrStoreOrStoreId?: MaybeAccessor<Id | StoreOrStoreId | undefined>,
  descending?: MaybeAccessor<boolean | undefined>,
  offset?: MaybeAccessor<number | undefined>,
  limit?: MaybeAccessor<number | undefined>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  isObject(tableIdOrArgs)
    ? useSortedRowIdsImpl(
        tableIdOrArgs.tableId,
        tableIdOrArgs.cellId,
        tableIdOrArgs.descending ?? false,
        tableIdOrArgs.offset ?? 0,
        tableIdOrArgs.limit,
        cellIdOrStoreOrStoreId as MaybeAccessor<StoreOrStoreId | undefined>,
      )
    : useSortedRowIdsImpl(
        tableIdOrArgs,
        cellIdOrStoreOrStoreId as MaybeAccessor<Id | undefined>,
        descending,
        offset,
        limit,
        storeOrStoreId,
      );

export const useHasRow = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), ReturnType.Boolean, [
    tableId,
    rowId,
  ]);

export const useRow = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Row> =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), ReturnType.Object, [
    tableId,
    rowId,
  ]);

export const useRowState = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Row>, (row: Row) => void] => [
  useRow(tableId, rowId, storeOrStoreId),
  useSetRowCallback(tableId, rowId, getArg, storeOrStoreId),
];

export const useCellIds = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  useListenable(
    CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId, rowId],
  );

export const useHasCell = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(CELL, useStoreOrStoreById(storeOrStoreId), ReturnType.Boolean, [
    tableId,
    rowId,
    cellId,
  ]);

export const useCell = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<CellOrUndefined> =>
  useListenable(
    CELL,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.CellOrValue,
    [tableId, rowId, cellId],
  );

export const useCellState = (
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<CellOrUndefined>, (cell: Cell) => void] => [
  useCell(tableId, rowId, cellId, storeOrStoreId),
  useSetCellCallback(tableId, rowId, cellId, getArg, storeOrStoreId),
];

export const useHasValues = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(
    VALUES,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [],
  );

export const useValues = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Values> =>
  useListenable(VALUES, useStoreOrStoreById(storeOrStoreId), ReturnType.Object);

export const useValuesState = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Values>, (values: Values) => void] => [
  useValues(storeOrStoreId),
  useSetValuesCallback(getArg, storeOrStoreId),
];

export const useValueIds = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids> =>
  useListenable(
    VALUE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
  );

export const useHasValue = (
  valueId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean> =>
  useListenable(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [valueId],
  );

export const useValue = (
  valueId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<ValueOrUndefined> =>
  useListenable(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.CellOrValue,
    [valueId],
  );

export const useValueState = (
  valueId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<ValueOrUndefined>, (value: Value) => void] => [
  useValue(valueId, storeOrStoreId),
  useSetValueCallback(valueId, getArg, storeOrStoreId),
];

export const useSetTablesCallback = <Parameter>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, tables: Tables) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(storeOrStoreId, TABLES, getTables, then);

export const useSetTableCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  getTable: (parameter: Parameter, store: Store) => Table,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, table: Table) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(storeOrStoreId, TABLE, getTable, then, tableId);

export const useSetRowCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, row: Row) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(storeOrStoreId, ROW, getRow, then, tableId, rowId);

export const useAddRowCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then: (
    rowId: MaybeAccessor<Id> | undefined,
    store: Store,
    row: Row,
  ) => void = getUndefined,
  reuseRowIds = true,
): ParameterizedCallback<Parameter> => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (parameter) =>
    ifNotUndefined(getThing(store), (resolvedStore) =>
      ifNotUndefined(
        getRow(parameter as Parameter, resolvedStore),
        (row: Row) =>
          then(
            resolvedStore.addRow(
              isFunction(tableId)
                ? tableId(parameter as Parameter, resolvedStore)
                : tableId,
              row,
              reuseRowIds,
            ),
            resolvedStore,
            row,
          ),
      ),
    );
};

export const useSetPartialRowCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  getPartialRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, partialRow: Row) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
    storeOrStoreId,
    PARTIAL + ROW,
    getPartialRow,
    then,
    tableId,
    rowId,
  );

export const useSetCellCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  cellId: MaybeAccessor<Id> | GetId<Parameter>,
  getCell: (parameter: Parameter, store: Store) => Cell | MapCell,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, cell: Cell | MapCell) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(
    storeOrStoreId,
    CELL,
    getCell,
    then,
    tableId,
    rowId,
    cellId,
  );

export const useSetValuesCallback = <Parameter>(
  getValues: (parameter: Parameter, store: Store) => Values,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, values: Values) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(storeOrStoreId, VALUES, getValues, then);

export const useSetPartialValuesCallback = <Parameter>(
  getPartialValues: (parameter: Parameter, store: Store) => Values,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, partialValues: Values) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(storeOrStoreId, PARTIAL + VALUES, getPartialValues, then);

export const useSetValueCallback = <Parameter>(
  valueId: MaybeAccessor<Id> | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, value: Value | MapValue) => void,
): ParameterizedCallback<Parameter> =>
  useStoreSetCallback(storeOrStoreId, VALUE, getValue, then, valueId);

export const useDelTablesCallback = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): Callback => useDel(storeOrStoreId, TABLES, then);

export const useDelTableCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, TABLE, then, tableId);

export const useDelRowCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, ROW, then, tableId, rowId);

export const useDelCellCallback = <Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  cellId: MaybeAccessor<Id> | GetId<Parameter>,
  forceDel?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, CELL, then, tableId, rowId, cellId, forceDel);

export const useDelValuesCallback = (
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): Callback => useDel(storeOrStoreId, VALUES, then);

export const useDelValueCallback = <Parameter>(
  valueId: MaybeAccessor<Id> | GetId<Parameter>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, VALUE, then, valueId);

export const useHasTablesListener = (
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + TABLES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [],
    mutator,
  );

export const useTablesListener = (
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    TABLES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    EMPTY_LISTENER_ARG_GETTERS,
    mutator,
  );

export const useTableIdsListener = (
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    TABLE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    EMPTY_LISTENER_ARG_GETTERS,
    mutator,
  );

export const useHasTableListener = (
  tableId: MaybeAccessor<IdOrNull>,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + TABLE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId],
    mutator,
  );

export const useTableListener = (
  tableId: MaybeAccessor<IdOrNull>,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    TABLE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId],
    mutator,
  );

export const useTableCellIdsListener = (
  tableId: MaybeAccessor<IdOrNull>,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    TABLE + CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId],
    mutator,
  );

export const useHasTableCellListener = (
  tableId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + TABLE + CELL,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, cellId],
    mutator,
  );

export const useRowCountListener = (
  tableId: MaybeAccessor<IdOrNull>,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    ROW_COUNT,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId],
    mutator,
  );

export const useRowIdsListener = (
  tableId: MaybeAccessor<IdOrNull>,
  listener: RowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId],
    mutator,
  );

export const useSortedRowIdsListener = (
  tableIdOrArgs: Id | SortedRowIdsArgs,
  cellIdOrListener: Id | undefined | SortedRowIdsListener,
  descendingOrMutator: boolean | undefined,
  offsetOrStoreOrStoreId: number | undefined | StoreOrStoreId,
  limit?: number | undefined,
  listener?: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  isObject(tableIdOrArgs)
    ? useSortedRowIdsListenerImpl(
        tableIdOrArgs.tableId,
        tableIdOrArgs.cellId,
        tableIdOrArgs.descending ?? false,
        tableIdOrArgs.offset ?? 0,
        tableIdOrArgs.limit,
        cellIdOrListener as SortedRowIdsListener,
        descendingOrMutator,
        offsetOrStoreOrStoreId as MaybeAccessor<StoreOrStoreId | undefined>,
      )
    : useSortedRowIdsListenerImpl(
        tableIdOrArgs,
        cellIdOrListener as MaybeAccessor<Id | undefined>,
        (descendingOrMutator ?? false) as MaybeAccessor<boolean>,
        (offsetOrStoreOrStoreId ?? 0) as MaybeAccessor<number>,
        limit as MaybeAccessor<number | undefined>,
        listener as SortedRowIdsListener,
        mutator,
        storeOrStoreId,
      );

export const useHasRowListener = (
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + ROW,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, rowId],
    mutator,
  );

export const useRowListener = (
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    ROW,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, rowId],
    mutator,
  );

export const useCellIdsListener = (
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, rowId],
    mutator,
  );

export const useHasCellListener = (
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + CELL,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, rowId, cellId],
    mutator,
  );

export const useCellListener = (
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    CELL,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [tableId, rowId, cellId],
    mutator,
  );

export const useHasValuesListener = (
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + VALUES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [],
    mutator,
  );

export const useValuesListener = (
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    VALUES,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    EMPTY_LISTENER_ARG_GETTERS,
    mutator,
  );

export const useValueIdsListener = (
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    VALUE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    EMPTY_LISTENER_ARG_GETTERS,
    mutator,
  );

export const useHasValueListener = (
  valueId: MaybeAccessor<IdOrNull>,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    HAS + VALUE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [valueId],
    mutator,
  );

export const useValueListener = (
  valueId: MaybeAccessor<IdOrNull>,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    listener,
    [valueId],
    mutator,
  );

export const useStartTransactionListener = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    'Start' + TRANSACTION,
    useStoreOrStoreById(storeOrStoreId),
    listener,
  );

export const useWillFinishTransactionListener = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    'Will' + FINISH + TRANSACTION,
    useStoreOrStoreById(storeOrStoreId),
    listener,
  );

export const useDidFinishTransactionListener = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void =>
  useListener(
    'Did' + FINISH + TRANSACTION,
    useStoreOrStoreById(storeOrStoreId),
    listener,
  );

export const useCreateMetrics = (
  store: Store | undefined,
  create: (store: Store) => Metrics,
): Accessor<Metrics | undefined> => useCreate(store, create);

export const useMetricsIds = () => useThingIds(OFFSET_METRICS);

export const useMetrics = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Metrics | undefined> => useThing(id, OFFSET_METRICS);

export const useMetricsOrMetricsById = (
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): Accessor<Metrics | undefined> =>
  useThingOrThingById(metricsOrMetricsId, OFFSET_METRICS);

export const useProvideMetrics = (metricsId: Id, metrics: Metrics): void =>
  useProvideThing(metricsId, metrics, OFFSET_METRICS);

export const useMetricIds = (
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): Accessor<Ids> =>
  useListenable(
    METRIC + IDS,
    useMetricsOrMetricsById(metricsOrMetricsId),
    ReturnType.Array,
  );

export const useMetric = (
  metricId: MaybeAccessor<Id>,
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): Accessor<number | undefined> =>
  useListenable(
    METRIC,
    useMetricsOrMetricsById(metricsOrMetricsId),
    ReturnType.CellOrValue,
    [metricId],
  );

export const useMetricListener = (
  metricId: MaybeAccessor<IdOrNull>,
  listener: MetricListener,
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): void =>
  useListener(METRIC, useMetricsOrMetricsById(metricsOrMetricsId), listener, [
    metricId,
  ]);

export const useCreateIndexes = (
  store: Store | undefined,
  create: (store: Store) => Indexes,
): Accessor<Indexes | undefined> => useCreate(store, create);

export const useIndexesIds = () => useThingIds(OFFSET_INDEXES);

export const useIndexes = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Indexes | undefined> => useThing(id, OFFSET_INDEXES);

export const useIndexesOrIndexesById = (
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Indexes | undefined> =>
  useThingOrThingById(indexesOrIndexesId, OFFSET_INDEXES);

export const useProvideIndexes = (indexesId: Id, indexes: Indexes): void =>
  useProvideThing(indexesId, indexes, OFFSET_INDEXES);

export const useSliceIds = (
  indexId: MaybeAccessor<Id>,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    SLICE + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
    [indexId],
  );

export const useIndexIds = (
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    INDEX + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
  );

export const useSliceRowIds = (
  indexId: MaybeAccessor<Id>,
  sliceId: MaybeAccessor<Id>,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    SLICE + ROW_IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
    [indexId, sliceId],
  );

export const useSliceIdsListener = (
  indexId: MaybeAccessor<IdOrNull>,
  listener: SliceIdsListener,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): void =>
  useListener(
    SLICE + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    listener,
    [indexId],
  );

export const useSliceRowIdsListener = (
  indexId: MaybeAccessor<IdOrNull>,
  sliceId: MaybeAccessor<IdOrNull>,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): void =>
  useListener(
    SLICE + ROW_IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    listener,
    [indexId, sliceId],
  );

export const useCreateRelationships = (
  store: Store | undefined,
  create: (store: Store) => Relationships,
): Accessor<Relationships | undefined> => useCreate(store, create);

export const useRelationshipsIds = () => useThingIds(OFFSET_RELATIONSHIPS);

export const useRelationships = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Relationships | undefined> => useThing(id, OFFSET_RELATIONSHIPS);

export const useRelationshipsOrRelationshipsById = (
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): Accessor<Relationships | undefined> =>
  useThingOrThingById(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);

export const useProvideRelationships = (
  relationshipsId: Id,
  relationships: Relationships,
): void =>
  useProvideThing(relationshipsId, relationships, OFFSET_RELATIONSHIPS);

export const useRelationshipIds = (
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): Accessor<Ids> =>
  useListenable(
    RELATIONSHIP + IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
  );

export const useRemoteRowId = (
  relationshipId: MaybeAccessor<Id>,
  localRowId: MaybeAccessor<Id>,
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): Accessor<Id | undefined> =>
  useListenable(
    REMOTE_ROW_ID,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.CellOrValue,
    [relationshipId, localRowId],
  );

export const useLocalRowIds = (
  relationshipId: MaybeAccessor<Id>,
  remoteRowId: MaybeAccessor<Id>,
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): Accessor<Ids> =>
  useListenable(
    LOCAL + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIds = (
  relationshipId: MaybeAccessor<Id>,
  firstRowId: MaybeAccessor<Id>,
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): Accessor<Ids> =>
  useListenable(
    LINKED + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
    [relationshipId, firstRowId],
  );

export const useRemoteRowIdListener = (
  relationshipId: MaybeAccessor<IdOrNull>,
  localRowId: MaybeAccessor<IdOrNull>,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): void =>
  useListener(
    REMOTE_ROW_ID,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    [relationshipId, localRowId],
  );

export const useLocalRowIdsListener = (
  relationshipId: MaybeAccessor<IdOrNull>,
  remoteRowId: MaybeAccessor<IdOrNull>,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): void =>
  useListener(
    LOCAL + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIdsListener = (
  relationshipId: MaybeAccessor<Id>,
  firstRowId: MaybeAccessor<Id>,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId,
): void =>
  useListener(
    LINKED + ROW_IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    listener,
    [relationshipId, firstRowId],
  );

export const useCreateQueries = (
  store: Store | undefined,
  create: (store: Store) => Queries,
): Accessor<Queries | undefined> => useCreate(store, create);

export const useQueriesIds = () => useThingIds(OFFSET_QUERIES);

export const useQueries = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Queries | undefined> => useThing(id, OFFSET_QUERIES);

export const useQueriesOrQueriesById = (
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Queries | undefined> =>
  useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);

export const useProvideQueries = (queriesId: Id, queries: Queries): void =>
  useProvideThing(queriesId, queries, OFFSET_QUERIES);

export const useQueryIds = (
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    QUERY + IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
  );

export const useResultTable = (
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Table> =>
  useListenable(
    RESULT + TABLE,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Object,
    [queryId],
  );

export const useResultTableCellIds = (
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    RESULT + TABLE + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId],
  );

export const useResultRowCount = (
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<number> =>
  useListenable(
    RESULT + ROW_COUNT,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Number,
    [queryId],
  );

export const useResultRowIds = (
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    RESULT + ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId],
  );

export const useResultSortedRowIds = (
  queryId: MaybeAccessor<Id>,
  cellId?: MaybeAccessor<Id | undefined>,
  descending?: MaybeAccessor<boolean | undefined>,
  offset: MaybeAccessor<number | undefined> = 0,
  limit?: MaybeAccessor<number | undefined>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    RESULT + SORTED_ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId, cellId, descending, offset, limit],
  );

export const useResultRow = (
  queryId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Row> =>
  useListenable(
    RESULT + ROW,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Object,
    [queryId, rowId],
  );

export const useResultCellIds = (
  queryId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids> =>
  useListenable(
    RESULT + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId, rowId],
  );

export const useResultCell = (
  queryId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Cell | undefined> =>
  useListenable(
    RESULT + CELL,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.CellOrValue,
    [queryId, rowId, cellId],
  );

export const useResultTableListener = (
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultTableListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + TABLE,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId],
  );

export const useResultTableCellIdsListener = (
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + TABLE + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId],
  );

export const useResultRowCountListener = (
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + ROW_COUNT,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId],
  );

export const useResultRowIdsListener = (
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId],
  );

export const useResultSortedRowIdsListener = (
  queryId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id> | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + SORTED_ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId, cellId, descending, offset, limit],
  );

export const useResultRowListener = (
  queryId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: ResultRowListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + ROW,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId, rowId],
  );

export const useResultCellIdsListener = (
  queryId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId, rowId],
  );

export const useResultCellListener = (
  queryId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: ResultCellListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    RESULT + CELL,
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId, rowId, cellId],
  );

export const useParamValues = (
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<ParamValues> =>
  useListenable(
    'ParamValues',
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.ParamValues,
    [queryId],
  );

export const useParamValuesState = (
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): [Accessor<ParamValues>, (paramValues: ParamValues) => void] => [
  useParamValues(queryId, queriesOrQueriesId),
  useSetParamValuesCallback(queryId, getArg, queriesOrQueriesId),
];

export const useParamValue = (
  queryId: MaybeAccessor<Id>,
  paramId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<ParamValue | undefined> =>
  useListenable(
    'ParamValue',
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.ParamValue,
    [queryId, paramId],
  );

export const useParamValueState = (
  queryId: MaybeAccessor<Id>,
  paramId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): [Accessor<ParamValue | undefined>, (paramValue: ParamValue) => void] => [
  useParamValue(queryId, paramId, queriesOrQueriesId),
  useSetParamValueCallback(queryId, paramId, getArg, queriesOrQueriesId),
];

export const useParamValuesListener = (
  queryId: MaybeAccessor<IdOrNull>,
  listener: ParamValuesListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    'ParamValues',
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId],
  );

export const useParamValueListener = (
  queryId: MaybeAccessor<IdOrNull>,
  paramId: MaybeAccessor<IdOrNull>,
  listener: ParamValueListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void =>
  useListener(
    'ParamValue',
    useQueriesOrQueriesById(queriesOrQueriesId),
    listener,
    [queryId, paramId],
  );

export const useSetParamValueCallback = <Parameter>(
  queryId: MaybeAccessor<Id> | GetId<Parameter>,
  paramId: MaybeAccessor<Id> | GetId<Parameter>,
  getParamValue: (parameter: Parameter, queries: Queries) => ParamValue,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
  then?: (queries: Queries, paramValue: ParamValue) => void,
): ParameterizedCallback<Parameter> =>
  useQueriesSetCallback(
    queriesOrQueriesId,
    'setParamValue',
    getParamValue,
    then,
    queryId,
    paramId,
  );

export const useSetParamValuesCallback = <Parameter>(
  queryId: MaybeAccessor<Id> | GetId<Parameter>,
  getParamValues: (parameter: Parameter, queries: Queries) => ParamValues,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
  then?: (queries: Queries, paramValues: ParamValues) => void,
): ParameterizedCallback<Parameter> =>
  useQueriesSetCallback(
    queriesOrQueriesId,
    'setParamValues',
    getParamValues,
    then,
    queryId,
  );

export const useCreateCheckpoints = (
  store: Store | undefined,
  create: (store: Store) => Checkpoints,
): Accessor<Checkpoints | undefined> => useCreate(store, create);

export const useCheckpointsIds = () => useThingIds(OFFSET_CHECKPOINTS);

export const useCheckpoints = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Checkpoints | undefined> => useThing(id, OFFSET_CHECKPOINTS);

export const useCheckpointsOrCheckpointsById = (
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): Accessor<Checkpoints | undefined> =>
  useThingOrThingById(checkpointsOrCheckpointsId, OFFSET_CHECKPOINTS);

export const useProvideCheckpoints = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => useProvideThing(checkpointsId, checkpoints, OFFSET_CHECKPOINTS);

export const useCheckpointIds = (
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): Accessor<CheckpointIds> =>
  useListenable(
    CHECKPOINT + IDS,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    ReturnType.Checkpoints,
  );

export const useCheckpoint = (
  checkpointId: MaybeAccessor<Id>,
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): Accessor<string | undefined> =>
  useListenable(
    CHECKPOINT,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    ReturnType.CellOrValue,
    [checkpointId],
  );

export const useSetCheckpointCallback = <Parameter>(
  getCheckpoint: (parameter: Parameter) => string | undefined = getUndefined,
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
  then: (
    checkpointId: MaybeAccessor<Id>,
    checkpoints: Checkpoints,
    label?: string,
  ) => void = getUndefined,
): ParameterizedCallback<Parameter> => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return (parameter) =>
    ifNotUndefined(getThing(checkpoints), (resolvedCheckpoints) => {
      const label = getCheckpoint(parameter as Parameter);
      then(
        resolvedCheckpoints.addCheckpoint(label),
        resolvedCheckpoints,
        label,
      );
    });
};

export const useGoBackwardCallback = (
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): Callback => useCheckpointAction(checkpointsOrCheckpointsId, 'goBackward');

export const useGoForwardCallback = (
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): Callback => useCheckpointAction(checkpointsOrCheckpointsId, 'goForward');

export const useGoToCallback = <Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
  then: (checkpoints: Checkpoints, checkpointId: Id) => void = getUndefined,
): ParameterizedCallback<Parameter> => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return (parameter) =>
    ifNotUndefined(getThing(checkpoints), (resolvedCheckpoints) =>
      ifNotUndefined(
        getCheckpointId(parameter as Parameter),
        (checkpointId: Id) =>
          then(resolvedCheckpoints.goTo(checkpointId), checkpointId),
      ),
    );
};

export const useUndoInformation = (
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): UndoOrRedoInformation => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  const [backwardIds, currentId] = getThing(useCheckpointIds(checkpoints));
  return [
    !arrayIsEmpty(backwardIds),
    useGoBackwardCallback(checkpoints),
    currentId,
    ifNotUndefined(currentId, (id) =>
      getThing(checkpoints)?.getCheckpoint(id),
    ) ?? EMPTY_STRING,
  ];
};

export const useRedoInformation = (
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): UndoOrRedoInformation => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  const [, , [forwardId]] = getThing(useCheckpointIds(checkpoints));
  return [
    !isUndefined(forwardId),
    useGoForwardCallback(checkpoints),
    forwardId,
    ifNotUndefined(forwardId, (id) =>
      getThing(checkpoints)?.getCheckpoint(id),
    ) ?? EMPTY_STRING,
  ];
};

export const useCheckpointIdsListener = (
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): void =>
  useListener(
    CHECKPOINT + IDS,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    listener,
  );

export const useCheckpointListener = (
  checkpointId: MaybeAccessor<IdOrNull>,
  listener: CheckpointListener,
  checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId,
): void =>
  useListener(
    CHECKPOINT,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    listener,
    [checkpointId],
  );

export const useCreatePersister = <
  Persist extends Persists,
  PersisterOrUndefined extends Persister<Persist> | undefined,
>(
  store: PersistedStore<Persist> | undefined,
  create: (
    store: PersistedStore<Persist>,
  ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
  then?: (persister: Persister<Persist>) => Promise<void>,
  destroy?: (persister: Persister<Persist>) => void,
): Accessor<PersisterOrUndefined | undefined> => {
  const [persister, setPersister] = createSignal<PersisterOrUndefined>();
  createEffect(() => {
    (async () => {
      const createdPersister = store ? await create(store) : undefined;
      setPersister(() => createdPersister);
      if (createdPersister && then) {
        await then(createdPersister);
      }
    })();
  });
  createEffect(() =>
    onCleanup(() => {
      const resolvedPersister = getThing(persister);
      if (resolvedPersister) {
        resolvedPersister.destroy();
        destroy?.(resolvedPersister);
      }
    }),
  );
  return persister;
};

export const usePersisterIds = () => useThingIds(OFFSET_PERSISTER);

export const usePersister = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<AnyPersister | undefined> => useThing(id, OFFSET_PERSISTER);

export const usePersisterOrPersisterById = (
  persisterOrPersisterId?: MaybeAccessor<PersisterOrPersisterId | undefined>,
): Accessor<AnyPersister | undefined> =>
  useThingOrThingById(persisterOrPersisterId, OFFSET_PERSISTER);

export const useProvidePersister = (
  persisterId: Id,
  persister: AnyPersister,
): void => useProvideThing(persisterId, persister, OFFSET_PERSISTER);

export const usePersisterStatus = (
  persisterOrPersisterId?: MaybeAccessor<PersisterOrPersisterId | undefined>,
): Accessor<Status> =>
  useListenable(
    STATUS,
    usePersisterOrPersisterById(persisterOrPersisterId),
    ReturnType.Number,
    [],
  );

export const usePersisterStatusListener = (
  listener: StatusListener,
  persisterOrPersisterId?: MaybeAccessor<PersisterOrPersisterId | undefined>,
): void =>
  useListener(
    STATUS,
    usePersisterOrPersisterById(persisterOrPersisterId),
    listener,
    [],
  );

export const useCreateSynchronizer = <
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MergeableStore | undefined,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  destroy?: (synchronizer: Synchronizer) => void,
): Accessor<SynchronizerOrUndefined | undefined> => {
  const [synchronizer, setSynchronizer] =
    createSignal<SynchronizerOrUndefined>();
  createEffect(() => {
    (async () => {
      const createdSynchronizer = store ? await create(store) : undefined;
      setSynchronizer(() => createdSynchronizer);
    })();
  });
  createEffect(() =>
    onCleanup(() => {
      const resolvedSynchronizer = getThing(synchronizer);
      if (resolvedSynchronizer) {
        resolvedSynchronizer.destroy();
        destroy?.(resolvedSynchronizer);
      }
    }),
  );
  return synchronizer;
};

export const useSynchronizerIds = () => useThingIds(OFFSET_SYNCHRONIZER);

export const useSynchronizer = (
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Synchronizer | undefined> => useThing(id, OFFSET_SYNCHRONIZER);

export const useSynchronizerOrSynchronizerById = (
  synchronizerOrSynchronizerId?: MaybeSynchronizerOrSynchronizerId,
): Accessor<Synchronizer | undefined> =>
  useThingOrThingById(synchronizerOrSynchronizerId, OFFSET_SYNCHRONIZER);

export const useProvideSynchronizer = (
  persisterId: Id,
  persister: Synchronizer,
): void => useProvideThing(persisterId, persister, OFFSET_SYNCHRONIZER);

export const useSynchronizerStatus = (
  synchronizerOrSynchronizerId?: MaybeSynchronizerOrSynchronizerId,
): Accessor<Status> =>
  useListenable(
    STATUS,
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    ReturnType.Number,
    [],
  );

export const useSynchronizerStatusListener = (
  listener: StatusListener,
  synchronizerOrSynchronizerId?: MaybeSynchronizerOrSynchronizerId,
): void =>
  useListener(
    STATUS,
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    listener,
    [],
  );
