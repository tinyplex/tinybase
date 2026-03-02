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
import type {DependencyList} from '../common/solid.ts';
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

type MaybeAccessor<Thing> = Thing | Accessor<Thing>;

const getThing = <Thing>(thing: MaybeAccessor<Thing>): Thing =>
  (isFunction(thing) ? (thing as Accessor<Thing>)() : thing) as Thing;

const useCreate = (
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => any,
  _createDeps: DependencyList = EMPTY_ARRAY,
) => {
  const [thing, setThing] = createSignal<any>();
  createEffect(() => {
    const resolvedStore = getThing(store);
    const newThing = resolvedStore ? create(resolvedStore) : undefined;
    setThing(() => newThing);
    onCleanup(() => newThing?.destroy?.());
  });
  return thing as any;
};

const addAndDelListener = (thing: any, listenable: string, ...args: any[]) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener?.(listenerId);
};

const useListenable = (
  listenable: string,
  thing: MaybeAccessor<any>,
  returnType: ReturnType,
  args: Readonly<ListenerArgument[]> = EMPTY_ARRAY,
): any => {
  const [result, setResult] = createSignal(DEFAULTS[returnType] as any);
  const getResult = () =>
    getThing(thing)?.[
      (returnType == ReturnType.Boolean ? _HAS : GET) + listenable
    ]?.(...args) ?? DEFAULTS[returnType];
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
    updateResult();
    const cleanup = addAndDelListener(
      resolvedThing,
      (returnType == ReturnType.Boolean ? HAS : EMPTY_STRING) + listenable,
      ...args,
      updateResult,
    );
    onCleanup(cleanup);
  });
  return result as any;
};

const useListener = (
  listenable: string,
  thing: MaybeAccessor<any>,
  listener: (...args: any[]) => void,
  _listenerDeps: DependencyList = EMPTY_ARRAY,
  preArgs: Readonly<ListenerArgument[]> = EMPTY_ARRAY,
  ...postArgs: ListenerArgument[]
): void =>
  createRenderEffect(() => {
    const cleanup = addAndDelListener(
      getThing(thing),
      listenable,
      ...preArgs,
      listener,
      ...postArgs,
    );
    onCleanup(cleanup);
  });

const useSetCallback = <Parameter, Thing, StoreOrQueries>(
  storeOrQueries: MaybeAccessor<StoreOrQueries | undefined>,
  settable: string,
  get: (parameter: Parameter, obj: StoreOrQueries) => Thing,
  _getDeps: DependencyList = EMPTY_ARRAY,
  then: (obj: StoreOrQueries, thing: Thing) => void = getUndefined,
  _thenDeps: DependencyList = EMPTY_ARRAY,
  methodPrefix?: string,
  ...args: (Id | GetId<Parameter>)[]
): ParameterizedCallback<Parameter> =>
  (parameter?: Parameter) =>
    ifNotUndefined(getThing(storeOrQueries), (obj: any) =>
      ifNotUndefined(get(parameter as any, obj), (thing: Thing) =>
        then(
          obj[methodPrefix + settable](
            ...argsOrGetArgs(args, obj, parameter),
            thing,
          ),
          thing,
        ),
      ),
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

const useDel = <Parameter>(
  storeOrStoreId: StoreOrStoreId | undefined,
  deletable: string,
  then: (store: Store) => void = getUndefined,
  _thenDeps: DependencyList = EMPTY_ARRAY,
  ...args: (Id | GetId<Parameter> | boolean | undefined)[]
): ParameterizedCallback<Parameter> => {
  const store: any = useStoreOrStoreById(storeOrStoreId);
  return (parameter?: Parameter) => {
    const resolvedStore = getThing(store);
    then(
      resolvedStore?.[DEL + deletable](
        ...argsOrGetArgs(args, resolvedStore, parameter),
      ),
    );
  };
};

const useCheckpointAction = (
  checkpointsOrCheckpointsId: CheckpointsOrCheckpointsId | undefined,
  action: string,
  arg?: string,
) => {
  const checkpoints: any = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return () => getThing(checkpoints)?.[action](arg);
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

export const useCreateStore = (
  create: () => Store,
  _createDeps: DependencyList = EMPTY_ARRAY,
): Store => createMemo(create) as any;

export const useStoreIds = () =>
  useThingIds(OFFSET_STORE) as any;

export const useStore = (id?: Id): Store | undefined =>
  useThing(id, OFFSET_STORE) as any;

export const useStores = (): IdObj<Store> =>
  useThings(OFFSET_STORE) as any;

export const useStoreOrStoreById = (
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined =>
  useThingOrThingById(storeOrStoreId, OFFSET_STORE) as any;

export const useProvideStore = (
  storeId: Id,
  store: Store,
): void => useProvideThing(storeId, store, OFFSET_STORE);

export const useCreateMergeableStore = (
  create: () => MergeableStore,
  _createDeps: DependencyList = EMPTY_ARRAY,
): MergeableStore => createMemo(create) as any;

export const useHasTables = (
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    TABLES,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [],
  );

export const useTables = (
  storeOrStoreId?: StoreOrStoreId,
): Tables =>
  useListenable(TABLES, useStoreOrStoreById(storeOrStoreId), ReturnType.Object);

export const useTablesState = (
  storeOrStoreId?: StoreOrStoreId,
): [Tables, (tables: Tables) => void] => [
  useTables(storeOrStoreId),
  useSetTablesCallback(getArg, [], storeOrStoreId),
];

export const useTableIds = (
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    TABLE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
  );

export const useHasTable = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    TABLE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [tableId],
  );

export const useTable = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Table =>
  useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), ReturnType.Object, [
    tableId,
  ]);
export const useTableState = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Table, (table: Table) => void] => [
  useTable(tableId, storeOrStoreId),
  useSetTableCallback(tableId, getArg, [], storeOrStoreId),
];

export const useTableCellIds = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    TABLE + CELL_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId],
  );

export const useHasTableCell = (
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

export const useRowCount = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): number =>
  useListenable(
    ROW_COUNT,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Number,
    [tableId],
  );

export const useRowIds = (
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    ROW_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
    [tableId],
  );

export const useSortedRowIds = (
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

export const useHasRow = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), ReturnType.Boolean, [
    tableId,
    rowId,
  ]);

export const useRow = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Row =>
  useListenable(ROW, useStoreOrStoreById(storeOrStoreId), ReturnType.Object, [
    tableId,
    rowId,
  ]);

export const useRowState = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Row, (row: Row) => void] => [
  useRow(tableId, rowId, storeOrStoreId),
  useSetRowCallback(tableId, rowId, getArg, [], storeOrStoreId),
];

export const useCellIds = (
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

export const useHasCell = (
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

export const useCell = (
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

export const useCellState = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [CellOrUndefined, (cell: Cell) => void] => [
  useCell(tableId, rowId, cellId, storeOrStoreId),
  useSetCellCallback(tableId, rowId, cellId, getArg, [], storeOrStoreId),
];

export const useHasValues = (
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    VALUES,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [],
  );

export const useValues = (
  storeOrStoreId?: StoreOrStoreId,
): Values =>
  useListenable(VALUES, useStoreOrStoreById(storeOrStoreId), ReturnType.Object);

export const useValuesState = (
  storeOrStoreId?: StoreOrStoreId,
): [Values, (values: Values) => void] => [
  useValues(storeOrStoreId),
  useSetValuesCallback(getArg, [], storeOrStoreId),
];

export const useValueIds = (
  storeOrStoreId?: StoreOrStoreId,
): Ids =>
  useListenable(
    VALUE_IDS,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Array,
  );

export const useHasValue = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean =>
  useListenable(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.Boolean,
    [valueId],
  );

export const useValue = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): ValueOrUndefined =>
  useListenable(
    VALUE,
    useStoreOrStoreById(storeOrStoreId),
    ReturnType.CellOrValue,
    [valueId],
  );

export const useValueState = (
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [ValueOrUndefined, (value: Value) => void] => [
  useValue(valueId, storeOrStoreId),
  useSetValueCallback(valueId, getArg, [], storeOrStoreId),
];

export const useSetTablesCallback = <
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

export const useSetTableCallback = <Parameter>(
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

export const useSetRowCallback = <Parameter>(
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

export const useAddRowCallback = <Parameter>(
  tableId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  _getRowDeps: DependencyList = EMPTY_ARRAY,
  storeOrStoreId?: StoreOrStoreId,
  then: (rowId: Id | undefined, store: Store, row: Row) => void = getUndefined,
  _thenDeps: DependencyList = EMPTY_ARRAY,
  reuseRowIds = true,
): ParameterizedCallback<Parameter> => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (parameter) =>
    ifNotUndefined(getThing(store), (resolvedStore) =>
      ifNotUndefined(getRow(parameter as any, resolvedStore), (row: Row) =>
        then(
          resolvedStore.addRow(
            isFunction(tableId)
              ? tableId(parameter as any, resolvedStore)
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

export const useSetPartialRowCallback = <
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

export const useSetCellCallback = <Parameter>(
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

export const useSetValuesCallback = <
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

export const useSetPartialValuesCallback =
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

export const useSetValueCallback = <Parameter>(
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

export const useDelTablesCallback = (
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): Callback => useDel(storeOrStoreId, TABLES, then, thenDeps);

export const useDelTableCallback = <Parameter>(
  tableId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, TABLE, then, thenDeps, tableId);

export const useDelRowCallback = <Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, ROW, then, thenDeps, tableId, rowId);

export const useDelCellCallback = <Parameter>(
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

export const useDelValuesCallback = (
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): Callback => useDel(storeOrStoreId, VALUES, then, thenDeps);

export const useDelValueCallback = <Parameter>(
  valueId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter> =>
  useDel(storeOrStoreId, VALUE, then, thenDeps, valueId);

export const useHasTablesListener = (
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

export const useTablesListener = (
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

export const useTableIdsListener = (
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

export const useHasTableListener = (
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

export const useTableListener = (
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

export const useTableCellIdsListener = (
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

export const useHasTableCellListener = (
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

export const useRowCountListener = (
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

export const useRowIdsListener = (
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

export const useSortedRowIdsListener = (
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

export const useHasRowListener = (
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

export const useRowListener = (
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

export const useCellIdsListener = (
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

export const useHasCellListener = (
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

export const useCellListener = (
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

export const useHasValuesListener = (
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

export const useValuesListener = (
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

export const useValueIdsListener = (
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

export const useHasValueListener = (
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

export const useValueListener = (
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

export const useStartTransactionListener =
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

export const useWillFinishTransactionListener =
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

export const useDidFinishTransactionListener =
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

export const useCreateMetrics = (
  store: Store | undefined,
  create: (store: Store) => Metrics,
  createDeps?: DependencyList,
): Metrics | undefined => useCreate(store, create, createDeps);

export const useMetricsIds = () =>
  useThingIds(OFFSET_METRICS) as any;

export const useMetrics = (
  id?: Id,
): Metrics | undefined => useThing(id, OFFSET_METRICS) as any;

export const useMetricsOrMetricsById = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined =>
  useThingOrThingById(metricsOrMetricsId, OFFSET_METRICS) as any;

export const useProvideMetrics = (
  metricsId: Id,
  metrics: Metrics,
): void => useProvideThing(metricsId, metrics, OFFSET_METRICS);

export const useMetricIds = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Ids =>
  useListenable(
    METRIC + IDS,
    useMetricsOrMetricsById(metricsOrMetricsId),
    ReturnType.Array,
  );

export const useMetric = (
  metricId: Id,
  metricsOrMetricsId?: MetricsOrMetricsId,
): number | undefined =>
  useListenable(
    METRIC,
    useMetricsOrMetricsById(metricsOrMetricsId),
    ReturnType.CellOrValue,
    [metricId],
  );

export const useMetricListener = (
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

export const useCreateIndexes = (
  store: Store | undefined,
  create: (store: Store) => Indexes,
  createDeps?: DependencyList,
): Indexes | undefined => useCreate(store, create, createDeps);

export const useIndexesIds = () =>
  useThingIds(OFFSET_INDEXES) as any;

export const useIndexes = (
  id?: Id,
): Indexes | undefined => useThing(id, OFFSET_INDEXES) as any;

export const useIndexesOrIndexesById = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined =>
  useThingOrThingById(indexesOrIndexesId, OFFSET_INDEXES) as any;

export const useProvideIndexes = (
  indexesId: Id,
  indexes: Indexes,
): void => useProvideThing(indexesId, indexes, OFFSET_INDEXES);

export const useSliceIds = (
  indexId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable(
    SLICE + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
    [indexId],
  );

export const useIndexIds = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids =>
  useListenable(
    INDEX + IDS,
    useIndexesOrIndexesById(indexesOrIndexesId),
    ReturnType.Array,
  );

export const useSliceRowIds = (
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

export const useSliceIdsListener = (
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

export const useSliceRowIdsListener = (
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

export const useCreateRelationships = (
  store: Store | undefined,
  create: (store: Store) => Relationships,
  createDeps?: DependencyList,
): Relationships | undefined => useCreate(store, create, createDeps);

export const useRelationshipsIds = () =>
  useThingIds(OFFSET_RELATIONSHIPS) as any;

export const useRelationships = (
  id?: Id,
): Relationships | undefined => useThing(id, OFFSET_RELATIONSHIPS) as any;

export const useRelationshipsOrRelationshipsById =
  (
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
  ): Relationships | undefined =>
    useThingOrThingById(
      relationshipsOrRelationshipsId,
      OFFSET_RELATIONSHIPS,
    ) as any;

export const useProvideRelationships = (
  relationshipsId: Id,
  relationships: Relationships,
): void =>
  useProvideThing(relationshipsId, relationships, OFFSET_RELATIONSHIPS);

export const useRelationshipIds = (
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids =>
  useListenable(
    RELATIONSHIP + IDS,
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    ReturnType.Array,
  );

export const useRemoteRowId = (
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

export const useLocalRowIds = (
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

export const useLinkedRowIds = (
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

export const useRemoteRowIdListener = (
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

export const useLocalRowIdsListener = (
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

export const useLinkedRowIdsListener = (
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

export const useCreateQueries = (
  store: Store | undefined,
  create: (store: Store) => Queries,
  createDeps?: DependencyList,
): Queries | undefined => useCreate(store, create, createDeps);

export const useQueriesIds = () =>
  useThingIds(OFFSET_QUERIES) as any;

export const useQueries = (
  id?: Id,
): Queries | undefined => useThing(id, OFFSET_QUERIES) as any;

export const useQueriesOrQueriesById = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Queries | undefined =>
  useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES) as any;

export const useProvideQueries = (
  queriesId: Id,
  queries: Queries,
): void => useProvideThing(queriesId, queries, OFFSET_QUERIES);

export const useQueryIds = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    QUERY + IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
  );

export const useResultTable = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Table =>
  useListenable(
    RESULT + TABLE,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Object,
    [queryId],
  );

export const useResultTableCellIds = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + TABLE + CELL_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId],
  );

export const useResultRowCount = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): number =>
  useListenable(
    RESULT + ROW_COUNT,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Number,
    [queryId],
  );

export const useResultRowIds = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids =>
  useListenable(
    RESULT + ROW_IDS,
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.Array,
    [queryId],
  );

export const useResultSortedRowIds = (
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

export const useResultRow = (
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

export const useResultCellIds = (
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

export const useResultCell = (
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

export const useResultTableListener = (
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

export const useResultTableCellIdsListener =
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

export const useResultRowCountListener = (
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

export const useResultRowIdsListener = (
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

export const useResultSortedRowIdsListener =
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

export const useResultRowListener = (
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

export const useResultCellIdsListener = (
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

export const useResultCellListener = (
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

export const useParamValues = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValues =>
  useListenable(
    'ParamValues',
    useQueriesOrQueriesById(queriesOrQueriesId),
    ReturnType.ParamValues,
    [queryId],
  );

export const useParamValuesState = (
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [ParamValues, (paramValues: ParamValues) => void] => [
  useParamValues(queryId, queriesOrQueriesId),
  useSetParamValuesCallback(queryId, getArg, [], queriesOrQueriesId),
];

export const useParamValue = (
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

export const useParamValueState = (
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [ParamValue | undefined, (paramValue: ParamValue) => void] => [
  useParamValue(queryId, paramId, queriesOrQueriesId),
  useSetParamValueCallback(queryId, paramId, getArg, [], queriesOrQueriesId),
];

export const useParamValuesListener = (
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

export const useParamValueListener = (
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

export const useSetParamValueCallback = <
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

export const useSetParamValuesCallback = <
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

export const useCreateCheckpoints = (
  store: Store | undefined,
  create: (store: Store) => Checkpoints,
  createDeps?: DependencyList,
): Checkpoints | undefined => useCreate(store, create, createDeps);

export const useCheckpointsIds = () =>
  useThingIds(OFFSET_CHECKPOINTS) as any;

export const useCheckpoints = (
  id?: Id,
): Checkpoints | undefined => useThing(id, OFFSET_CHECKPOINTS) as any;

export const useCheckpointsOrCheckpointsById =
  (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  ): Checkpoints | undefined =>
    useThingOrThingById(checkpointsOrCheckpointsId, OFFSET_CHECKPOINTS) as any;

export const useProvideCheckpoints = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => useProvideThing(checkpointsId, checkpoints, OFFSET_CHECKPOINTS);

export const useCheckpointIds = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): CheckpointIds =>
  useListenable(
    CHECKPOINT + IDS,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    ReturnType.Checkpoints,
  );

export const useCheckpoint = (
  checkpointId: Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): string | undefined =>
  useListenable(
    CHECKPOINT,
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    ReturnType.CellOrValue,
    [checkpointId],
  );

export const useSetCheckpointCallback = <
  Parameter,
>(
  getCheckpoint: (parameter: Parameter) => string | undefined = getUndefined,
  _getCheckpointDeps: DependencyList = EMPTY_ARRAY,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then: (
    checkpointId: Id,
    checkpoints: Checkpoints,
    label?: string,
  ) => void = getUndefined,
  _thenDeps: DependencyList = EMPTY_ARRAY,
): ParameterizedCallback<Parameter> => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return (parameter) =>
    ifNotUndefined(getThing(checkpoints), (resolvedCheckpoints) => {
      const label = getCheckpoint(parameter as any);
      then(
        resolvedCheckpoints.addCheckpoint(label),
        resolvedCheckpoints,
        label,
      );
    });
};

export const useGoBackwardCallback = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback => useCheckpointAction(checkpointsOrCheckpointsId, 'goBackward');

export const useGoForwardCallback = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback => useCheckpointAction(checkpointsOrCheckpointsId, 'goForward');

export const useGoToCallback = <Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  _getCheckpointIdDeps: DependencyList = EMPTY_ARRAY,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then: (checkpoints: Checkpoints, checkpointId: Id) => void = getUndefined,
  _thenDeps: DependencyList = EMPTY_ARRAY,
): ParameterizedCallback<Parameter> => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  return (parameter) =>
    ifNotUndefined(getThing(checkpoints), (resolvedCheckpoints) =>
      ifNotUndefined(getCheckpointId(parameter as any), (checkpointId: Id) =>
        then(resolvedCheckpoints.goTo(checkpointId), checkpointId),
      ),
    );
};

export const useUndoInformation = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  const [backwardIds, currentId] = getThing(useCheckpointIds(checkpoints));
  return [
    !arrayIsEmpty(backwardIds),
    useGoBackwardCallback(checkpoints),
    currentId,
    ifNotUndefined(
      currentId,
      (id) => getThing(checkpoints)?.getCheckpoint(id),
    ) ?? EMPTY_STRING,
  ];
};

export const useRedoInformation = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId,
  );
  const [, , [forwardId]] = getThing(useCheckpointIds(checkpoints));
  return [
    !isUndefined(forwardId),
    useGoForwardCallback(checkpoints),
    forwardId,
    ifNotUndefined(
      forwardId,
      (id) => getThing(checkpoints)?.getCheckpoint(id),
    ) ?? EMPTY_STRING,
  ];
};

export const useCheckpointIdsListener = (
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

export const useCheckpointListener = (
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

export const useCreatePersister = <
  Persist extends Persists,
  PersisterOrUndefined extends Persister<Persist> | undefined,
>(
  store: PersistedStore<Persist> | undefined,
  create: (
    store: PersistedStore<Persist>,
  ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
  _createDeps: DependencyList = EMPTY_ARRAY,
  then?: (persister: Persister<Persist>) => Promise<void>,
  _thenDeps: DependencyList = EMPTY_ARRAY,
  destroy?: (persister: Persister<Persist>) => void,
  _destroyDeps: DependencyList = EMPTY_ARRAY,
): PersisterOrUndefined => {
  const [persister, setPersister] = createSignal<any>();
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
  return persister as any;
};

export const usePersisterIds = () =>
  useThingIds(OFFSET_PERSISTER) as any;

export const usePersister = (
  id?: Id,
): AnyPersister | undefined => useThing(id, OFFSET_PERSISTER) as any;

export const usePersisterOrPersisterById =
  (persisterOrPersisterId?: PersisterOrPersisterId): AnyPersister | undefined =>
    useThingOrThingById(persisterOrPersisterId, OFFSET_PERSISTER) as any;

export const useProvidePersister = (
  persisterId: Id,
  persister: AnyPersister,
): void => useProvideThing(persisterId, persister, OFFSET_PERSISTER);

export const usePersisterStatus = (
  persisterOrPersisterId?: PersisterOrPersisterId,
): Status =>
  useListenable(
    STATUS,
    usePersisterOrPersisterById(persisterOrPersisterId),
    ReturnType.Number,
    [],
  );

export const usePersisterStatusListener =
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

export const useCreateSynchronizer = <
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MergeableStore | undefined,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  _createDeps: DependencyList = EMPTY_ARRAY,
  destroy?: (synchronizer: Synchronizer) => void,
  _destroyDeps: DependencyList = EMPTY_ARRAY,
): SynchronizerOrUndefined => {
  const [synchronizer, setSynchronizer] = createSignal<any>();
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
  return synchronizer as any;
};

export const useSynchronizerIds = () =>
  useThingIds(OFFSET_SYNCHRONIZER) as any;

export const useSynchronizer = (
  id?: Id,
): Synchronizer | undefined => useThing(id, OFFSET_SYNCHRONIZER) as any;

export const useSynchronizerOrSynchronizerById =
  (
    synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
  ): Synchronizer | undefined =>
    useThingOrThingById(
      synchronizerOrSynchronizerId,
      OFFSET_SYNCHRONIZER,
    ) as any;

export const useProvideSynchronizer = (
  persisterId: Id,
  persister: Synchronizer,
): void => useProvideThing(persisterId, persister, OFFSET_SYNCHRONIZER);

export const useSynchronizerStatus = (
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Status =>
  useListenable(
    STATUS,
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    ReturnType.Number,
    [],
  );

export const useSynchronizerStatusListener =
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
