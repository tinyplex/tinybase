import {getContext} from 'svelte';
import {createSubscriber} from 'svelte/reactivity';
import type {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../@types/checkpoints/index.d.ts';
import type {Id, IdOrNull, Ids} from '../@types/common/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../@types/indexes/index.d.ts';
import type {MetricListener, Metrics} from '../@types/metrics/index.d.ts';
import type {
  AnyPersister,
  Status,
  StatusListener,
} from '../@types/persisters/index.d.ts';
import type {
  ParamValueListener,
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
  ValueOrUndefined,
  Values,
  ValuesListener,
} from '../@types/store/index.d.ts';
import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
import type {MaybeGetter} from '../@types/ui-svelte/index.d.ts';
import type {IdObj} from '../common/obj.ts';
import {objGet, objIds} from '../common/obj.ts';
import {
  hasWindow,
  isFunction,
  isString,
  isUndefined,
  noop,
} from '../common/other.ts';
import {
  _HAS,
  ADD,
  CELL,
  CELL_IDS,
  CHECKPOINT,
  FINISH,
  GET,
  HAS,
  IDS,
  INDEX,
  LINKED,
  LISTENER,
  LOCAL,
  METRIC,
  QUERY,
  RELATIONSHIP,
  REMOTE_ROW_ID,
  RESULT,
  ROW,
  ROW_COUNT,
  ROW_IDS,
  SLICE,
  SORTED_ROW_IDS,
  STATUS,
  TABLE,
  TABLE_IDS,
  TABLES,
  TRANSACTION,
  VALUE,
  VALUE_IDS,
  VALUES,
} from '../common/strings.ts';
import type {ContextValue} from './context.ts';
import {TINYBASE_CONTEXT_KEY} from './context.ts';

type Thing =
  | Store
  | Metrics
  | Indexes
  | Relationships
  | Queries
  | Checkpoints
  | AnyPersister
  | Synchronizer;

class ReactiveHandle<Current> {
  readonly #get: () => Current;
  readonly #sub: () => void;

  constructor(getCurrent: () => Current, subscribe: () => void = noop) {
    this.#get = getCurrent;
    this.#sub = subscribe;
  }

  get current(): Current {
    this.#sub();
    return this.#get();
  }
}

class WritableHandle<Current, Next = Current> extends ReactiveHandle<Current> {
  readonly #set: (value: Next) => void;

  constructor(
    getCurrent: () => Current,
    setCurrent: (value: Next) => void,
    subscribe: () => void = noop,
  ) {
    super(getCurrent, subscribe);
    this.#set = setCurrent;
  }

  get current(): Current {
    return super.current;
  }

  set current(value: Next) {
    this.#set(value);
  }
}

const EMPTY_ARR: Ids = [];
const EMPTY_OBJ: Record<string, never> = {};
const DEFAULT_CHECKPOINT_IDS: CheckpointIds = [EMPTY_ARR, undefined, EMPTY_ARR];

const OFFSET_STORE = 0;
const OFFSET_METRICS = 1;
const OFFSET_INDEXES = 2;
const OFFSET_RELATIONSHIPS = 3;
const OFFSET_QUERIES = 4;
const OFFSET_CHECKPOINTS = 5;
const OFFSET_PERSISTER = 6;
const OFFSET_SYNCHRONIZER = 7;

const maybeGet = <
  T extends Thing | string | number | boolean | null | undefined,
>(
  thing: MaybeGetter<T>,
): T => (isFunction(thing) ? thing() : thing);

const getContextValue = (): ContextValue =>
  getContext(TINYBASE_CONTEXT_KEY) ?? [];

const getThing = <UsedThing extends Thing>(
  contextValue: ContextValue,
  thingOrThingId: UsedThing | Id | undefined,
  offset: number,
): UsedThing | undefined =>
  isUndefined(thingOrThingId)
    ? (contextValue[offset * 2] as UsedThing | undefined)
    : isString(thingOrThingId)
      ? (objGet(
          contextValue[offset * 2 + 1] as IdObj<UsedThing>,
          thingOrThingId,
        ) as UsedThing | undefined)
      : (thingOrThingId as UsedThing);

const getProvidedThing = <UsedThing extends Thing>(
  thingOrThingId: UsedThing | Id | undefined,
  offset: number,
): UsedThing | undefined => getThing(getContextValue(), thingOrThingId, offset);

const resolveProvidedThing = <UsedThing extends Thing>(
  thingOrThingId: MaybeGetter<UsedThing | Id | undefined>,
  offset: number,
): (() => UsedThing | undefined) => {
  const contextValue = getContextValue();
  return () =>
    getThing<UsedThing>(contextValue, maybeGet(thingOrThingId), offset);
};

const getThingIds = (contextValue: ContextValue, offset: number): Ids =>
  objIds((contextValue[offset * 2 + 1] ?? EMPTY_OBJ) as IdObj<unknown>);

export const resolveStore = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): (() => Store | undefined) =>
  resolveProvidedThing<Store>(storeOrStoreId as any, OFFSET_STORE);

export const resolveMetrics = (
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): (() => Metrics | undefined) =>
  resolveProvidedThing<Metrics>(metricsOrMetricsId as any, OFFSET_METRICS);

export const resolveIndexes = (
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): (() => Indexes | undefined) =>
  resolveProvidedThing<Indexes>(indexesOrIndexesId as any, OFFSET_INDEXES);

export const resolveRelationships = (
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): (() => Relationships | undefined) =>
  resolveProvidedThing<Relationships>(
    relationshipsOrRelationshipsId as any,
    OFFSET_RELATIONSHIPS,
  );

export const resolveQueries = (
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): (() => Queries | undefined) =>
  resolveProvidedThing<Queries>(queriesOrQueriesId as any, OFFSET_QUERIES);

export const resolveCheckpoints = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): (() => Checkpoints | undefined) =>
  resolveProvidedThing<Checkpoints>(
    checkpointsOrCheckpointsId as any,
    OFFSET_CHECKPOINTS,
  );

export const resolvePersister = (
  persisterOrPersisterId?: MaybeGetter<AnyPersister | Id | undefined>,
): (() => AnyPersister | undefined) =>
  resolveProvidedThing<AnyPersister>(
    persisterOrPersisterId as any,
    OFFSET_PERSISTER,
  );

export const resolveSynchronizer = (
  synchronizerOrSynchronizerId?: MaybeGetter<Synchronizer | Id | undefined>,
): (() => Synchronizer | undefined) =>
  resolveProvidedThing<Synchronizer>(
    synchronizerOrSynchronizerId as any,
    OFFSET_SYNCHRONIZER,
  );

const createListenable = <Thing>(
  getThing: () => any,
  listenable: string,
  defaultValue: Thing,
  getArgs: () => readonly any[] = () => EMPTY_ARR,
  isHas?: 0 | 1,
): {readonly current: Thing} => {
  const getListenableMethod = (isHas ? _HAS : GET) + listenable;
  const addListenableMethod = ADD + (isHas ? HAS : '') + listenable + LISTENER;
  let subscribe = $state<() => void>(noop);
  if (hasWindow()) {
    $effect(() => {
      const thing = getThing();
      const args = getArgs();
      subscribe = createSubscriber((update) => {
        const listenerId = thing?.[addListenableMethod]?.(...args, update);
        return () => thing?.delListener?.(listenerId);
      });
    });
  }
  return new ReactiveHandle(
    () =>
      (getThing()?.[getListenableMethod]?.(...getArgs()) ??
        defaultValue) as Thing,
    () => subscribe(),
  );
};

const addListenerEffect = (
  getThing: () => any,
  listenable: string,
  listener: (...args: any[]) => void,
  getPreArgs: () => readonly any[] = () => EMPTY_ARR,
  mutator?: boolean,
): void => {
  if (hasWindow()) {
    $effect(() => {
      const thing = getThing();
      const preArgs = getPreArgs();
      const listenerId = thing?.[ADD + listenable + LISTENER]?.(
        ...preArgs,
        listener,
        ...(mutator !== undefined ? [mutator] : EMPTY_ARR),
      );
      return () => thing?.delListener?.(listenerId);
    });
  }
};

export const createHasTables = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    TABLES,
    false,
    () => EMPTY_ARR,
    1,
  );

export const createTables = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Tables} =>
  createListenable(resolveStore(storeOrStoreId), TABLES, EMPTY_OBJ as Tables);

export const createTableIds = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveStore(storeOrStoreId), TABLE_IDS, EMPTY_ARR);

export const createHasTable = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    TABLE,
    false,
    () => [maybeGet(tableId)],
    1,
  );

export const createTable = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Table} =>
  createListenable(
    resolveStore(storeOrStoreId),
    TABLE,
    EMPTY_OBJ as Table,
    () => [maybeGet(tableId)],
  );

export const createTableCellIds = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveStore(storeOrStoreId),
    TABLE + CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(tableId)],
  );

export const createHasTableCell = (
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    TABLE + CELL,
    false,
    () => [maybeGet(tableId), maybeGet(cellId)],
    1,
  );

export const createRowCount = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: number} =>
  createListenable(resolveStore(storeOrStoreId), ROW_COUNT, 0, () => [
    maybeGet(tableId),
  ]);

export const createRowIds = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveStore(storeOrStoreId), ROW_IDS, EMPTY_ARR, () => [
    maybeGet(tableId),
  ]);

export const createSortedRowIds = (
  tableId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean> = false,
  offset: MaybeGetter<number> = 0,
  limit?: MaybeGetter<number | undefined>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveStore(storeOrStoreId),
    SORTED_ROW_IDS,
    EMPTY_ARR,
    () => [
      maybeGet(tableId),
      maybeGet(cellId),
      maybeGet(descending),
      maybeGet(offset),
      maybeGet(limit),
    ],
  );

export const createHasRow = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    ROW,
    false,
    () => [maybeGet(tableId), maybeGet(rowId)],
    1,
  );

export const createRow = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Row} =>
  createListenable(resolveStore(storeOrStoreId), ROW, EMPTY_OBJ as Row, () => [
    maybeGet(tableId),
    maybeGet(rowId),
  ]);

export const createCellIds = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveStore(storeOrStoreId), CELL_IDS, EMPTY_ARR, () => [
    maybeGet(tableId),
    maybeGet(rowId),
  ]);

export const createHasCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    CELL,
    false,
    () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
    1,
  );

export const createCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)} => {
  const getStore = resolveStore(storeOrStoreId);
  let subscribe = $state<() => void>(noop);
  if (hasWindow()) {
    $effect(() => {
      const store: any = getStore();
      const tableIdValue = maybeGet(tableId);
      const rowIdValue = maybeGet(rowId);
      const cellIdValue = maybeGet(cellId);
      subscribe = createSubscriber((update) => {
        const listenerId = store?.addCellListener(
          tableIdValue,
          rowIdValue,
          cellIdValue,
          update,
        );
        return () => store?.delListener?.(listenerId);
      });
    });
  }
  return new WritableHandle<CellOrUndefined, Cell>(
    () =>
      getStore()?.getCell(maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)),
    (nextCell) =>
      getStore()?.setCell(
        maybeGet(tableId),
        maybeGet(rowId),
        maybeGet(cellId),
        nextCell,
      ),
    () => subscribe(),
  );
};

export const createHasValues = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    VALUES,
    false,
    () => EMPTY_ARR,
    1,
  );

export const createValues = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Values} =>
  createListenable(resolveStore(storeOrStoreId), VALUES, EMPTY_OBJ as Values);

export const createValueIds = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveStore(storeOrStoreId), VALUE_IDS, EMPTY_ARR);

export const createHasValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  createListenable(
    resolveStore(storeOrStoreId),
    VALUE,
    false,
    () => [maybeGet(valueId)],
    1,
  );

export const createValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)} => {
  const getStore = resolveStore(storeOrStoreId);
  let subscribe = $state<() => void>(noop);
  if (hasWindow()) {
    $effect(() => {
      const store: any = getStore();
      const valueIdValue = maybeGet(valueId);
      subscribe = createSubscriber((update) => {
        const listenerId = store?.addValueListener(valueIdValue, update);
        return () => store?.delListener?.(listenerId);
      });
    });
  }
  return new WritableHandle<ValueOrUndefined, Value>(
    () => getStore()?.getValue(maybeGet(valueId)),
    (nextValue) => getStore()?.setValue(maybeGet(valueId), nextValue),
    () => subscribe(),
  );
};

export const getStore = (id?: Id): Store | undefined =>
  getProvidedThing(id, OFFSET_STORE) as Store | undefined;

export const createStoreIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_STORE));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_STORE);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const getMetrics = (id?: Id): Metrics | undefined =>
  getProvidedThing(id, OFFSET_METRICS) as Metrics | undefined;

export const createMetricsIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_METRICS));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_METRICS);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createMetricIds = (
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveMetrics(metricsOrMetricsId), METRIC + IDS, EMPTY_ARR);

export const createMetric = (
  metricId: MaybeGetter<Id>,
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {readonly current: number | undefined} =>
  createListenable(
    resolveMetrics(metricsOrMetricsId),
    METRIC,
    undefined,
    () => [maybeGet(metricId)],
  );

export const getIndexes = (id?: Id): Indexes | undefined =>
  getProvidedThing(id, OFFSET_INDEXES) as Indexes | undefined;

export const createIndexesIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_INDEXES));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_INDEXES);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createIndexIds = (
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveIndexes(indexesOrIndexesId), INDEX + IDS, EMPTY_ARR);

export const createSliceIds = (
  indexId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveIndexes(indexesOrIndexesId),
    SLICE + IDS,
    EMPTY_ARR,
    () => [maybeGet(indexId)],
  );

export const createSliceRowIds = (
  indexId: MaybeGetter<Id>,
  sliceId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveIndexes(indexesOrIndexesId),
    SLICE + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(indexId), maybeGet(sliceId)],
  );

export const getIndexStoreTableId = (
  indexesOrId: MaybeGetter<Indexes | Id | undefined>,
  indexId: MaybeGetter<Id>,
) => {
  const getIndexes = resolveIndexes(indexesOrId);
  return {
    get store() {
      return getIndexes()?.getStore();
    },
    get tableId() {
      return getIndexes()?.getTableId(maybeGet(indexId));
    },
  };
};

export const getQueries = (id?: Id): Queries | undefined =>
  getProvidedThing(id, OFFSET_QUERIES) as Queries | undefined;

export const createQueriesIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_QUERIES));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_QUERIES);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createQueryIds = (
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(resolveQueries(queriesOrQueriesId), QUERY + IDS, EMPTY_ARR);

export const createResultTable = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Table} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + TABLE,
    EMPTY_OBJ as Table,
    () => [maybeGet(queryId)],
  );

export const createResultTableCellIds = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + TABLE + CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(queryId)],
  );

export const createResultRowCount = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: number} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + ROW_COUNT,
    0,
    () => [maybeGet(queryId)],
  );

export const createResultRowIds = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(queryId)],
  );

export const createResultSortedRowIds = (
  queryId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean> = false,
  offset: MaybeGetter<number> = 0,
  limit?: MaybeGetter<number | undefined>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + SORTED_ROW_IDS,
    EMPTY_ARR,
    () => [
      maybeGet(queryId),
      maybeGet(cellId),
      maybeGet(descending),
      maybeGet(offset),
      maybeGet(limit),
    ],
  );

export const createResultRow = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Row} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + ROW,
    EMPTY_OBJ as Row,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const createResultCellIds = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const createResultCell = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Cell | undefined} =>
  createListenable(
    resolveQueries(queriesOrQueriesId),
    RESULT + CELL,
    undefined,
    () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)],
  );

export const getRelationships = (id?: Id): Relationships | undefined =>
  getProvidedThing(id, OFFSET_RELATIONSHIPS) as Relationships | undefined;

export const createRelationshipsIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_RELATIONSHIPS));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_RELATIONSHIPS);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createRelationshipIds = (
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveRelationships(relationshipsOrRelationshipsId),
    RELATIONSHIP + IDS,
    EMPTY_ARR,
  );

export const createRemoteRowId = (
  relationshipId: MaybeGetter<Id>,
  localRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Id | undefined} =>
  createListenable(
    resolveRelationships(relationshipsOrRelationshipsId),
    REMOTE_ROW_ID,
    undefined,
    () => [maybeGet(relationshipId), maybeGet(localRowId)],
  );

export const createLocalRowIds = (
  relationshipId: MaybeGetter<Id>,
  remoteRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveRelationships(relationshipsOrRelationshipsId),
    LOCAL + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(relationshipId), maybeGet(remoteRowId)],
  );

export const createLinkedRowIds = (
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  createListenable(
    resolveRelationships(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(relationshipId), maybeGet(firstRowId)],
  );

export const getRelationshipsStoreTableIds = (
  relationshipsOrId: MaybeGetter<Relationships | Id | undefined>,
  relationshipId: MaybeGetter<Id>,
) => {
  const getRelationships = resolveRelationships(relationshipsOrId);
  return {
    get store() {
      return getRelationships()?.getStore();
    },
    get localTableId() {
      return getRelationships()?.getLocalTableId(maybeGet(relationshipId));
    },
    get remoteTableId() {
      return getRelationships()?.getRemoteTableId(maybeGet(relationshipId));
    },
  };
};

export const getCheckpoints = (id?: Id): Checkpoints | undefined =>
  getProvidedThing(id, OFFSET_CHECKPOINTS) as Checkpoints | undefined;

export const createCheckpointsIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_CHECKPOINTS));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_CHECKPOINTS);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createCheckpointIds = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: CheckpointIds} =>
  createListenable(
    resolveCheckpoints(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    DEFAULT_CHECKPOINT_IDS,
  );

export const createCheckpoint = (
  checkpointId: MaybeGetter<Id>,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: string | undefined} =>
  createListenable(
    resolveCheckpoints(checkpointsOrCheckpointsId),
    CHECKPOINT,
    undefined,
    () => [maybeGet(checkpointId)],
  );

export const createGoBackwardCallback = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): (() => void) => {
  const getCheckpoints = resolveCheckpoints(checkpointsOrCheckpointsId);
  return () => getCheckpoints()?.goBackward();
};

export const createGoForwardCallback = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): (() => void) => {
  const getCheckpoints = resolveCheckpoints(checkpointsOrCheckpointsId);
  return () => getCheckpoints()?.goForward();
};

export const getPersister = (id?: Id): AnyPersister | undefined =>
  getProvidedThing(id, OFFSET_PERSISTER) as AnyPersister | undefined;

export const createPersisterIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_PERSISTER));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_PERSISTER);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createPersisterStatus = (
  persisterOrPersisterId?: MaybeGetter<AnyPersister | Id | undefined>,
): {readonly current: Status} =>
  createListenable(
    resolvePersister(persisterOrPersisterId),
    STATUS,
    0 as Status,
  );

export const getSynchronizer = (id?: Id): Synchronizer | undefined =>
  getProvidedThing(id, OFFSET_SYNCHRONIZER) as Synchronizer | undefined;

export const createSynchronizerIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_SYNCHRONIZER));
  if (hasWindow()) {
    $effect(() => {
      ids = getThingIds(contextValue, OFFSET_SYNCHRONIZER);
    });
  }
  return {
    get current() {
      return ids;
    },
  };
};

export const createSynchronizerStatus = (
  synchronizerOrSynchronizerId?: MaybeGetter<Synchronizer | Id | undefined>,
): {readonly current: Status} =>
  createListenable(
    resolveSynchronizer(synchronizerOrSynchronizerId),
    STATUS,
    0 as Status,
  );

export const onHasTables = (
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + TABLES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const onTables = (
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    TABLES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const onTableIds = (
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    TABLE_IDS,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const onHasTable = (
  tableId: MaybeGetter<IdOrNull>,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + TABLE,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const onTable = (
  tableId: MaybeGetter<IdOrNull>,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    TABLE,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const onTableCellIds = (
  tableId: MaybeGetter<IdOrNull>,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    TABLE + CELL_IDS,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const onHasTableCell = (
  tableId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + TABLE + CELL,
    listener,
    () => [maybeGet(tableId), maybeGet(cellId)],
    mutator,
  );

export const onRowCount = (
  tableId: MaybeGetter<IdOrNull>,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    ROW_COUNT,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const onRowIds = (
  tableId: MaybeGetter<IdOrNull>,
  listener: RowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    ROW_IDS,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const onSortedRowIds = (
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    SORTED_ROW_IDS,
    listener,
    () => [
      maybeGet(tableId),
      maybeGet(cellId),
      maybeGet(descending),
      maybeGet(offset),
      maybeGet(limit),
    ],
    mutator,
  );

export const onHasRow = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + ROW,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId)],
    mutator,
  );

export const onRow = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    ROW,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId)],
    mutator,
  );

export const onCellIds = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    CELL_IDS,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId)],
    mutator,
  );

export const onHasCell = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + CELL,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
    mutator,
  );

export const onCell = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    CELL,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
    mutator,
  );

export const onHasValues = (
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + VALUES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const onValues = (
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    VALUES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const onValueIds = (
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    VALUE_IDS,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const onHasValue = (
  valueId: MaybeGetter<IdOrNull>,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    HAS + VALUE,
    listener,
    () => [maybeGet(valueId)],
    mutator,
  );

export const onValue = (
  valueId: MaybeGetter<IdOrNull>,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    VALUE,
    listener,
    () => [maybeGet(valueId)],
    mutator,
  );

export const onStartTransaction = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    'Start' + TRANSACTION,
    listener,
  );

export const onWillFinishTransaction = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    'Will' + FINISH + TRANSACTION,
    listener,
  );

export const onDidFinishTransaction = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  addListenerEffect(
    resolveStore(storeOrStoreId),
    'Did' + FINISH + TRANSACTION,
    listener,
  );

export const onMetric = (
  metricId: MaybeGetter<IdOrNull>,
  listener: MetricListener,
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): void =>
  addListenerEffect(
    resolveMetrics(metricsOrMetricsId),
    METRIC,
    listener,
    () => [maybeGet(metricId)],
  );

export const onSliceIds = (
  indexId: MaybeGetter<IdOrNull>,
  listener: SliceIdsListener,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): void =>
  addListenerEffect(
    resolveIndexes(indexesOrIndexesId),
    SLICE + IDS,
    listener,
    () => [maybeGet(indexId)],
  );

export const onSliceRowIds = (
  indexId: MaybeGetter<IdOrNull>,
  sliceId: MaybeGetter<IdOrNull>,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): void =>
  addListenerEffect(
    resolveIndexes(indexesOrIndexesId),
    SLICE + ROW_IDS,
    listener,
    () => [maybeGet(indexId), maybeGet(sliceId)],
  );

export const onRemoteRowId = (
  relationshipId: MaybeGetter<IdOrNull>,
  localRowId: MaybeGetter<IdOrNull>,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): void =>
  addListenerEffect(
    resolveRelationships(relationshipsOrRelationshipsId),
    REMOTE_ROW_ID,
    listener,
    () => [maybeGet(relationshipId), maybeGet(localRowId)],
  );

export const onLocalRowIds = (
  relationshipId: MaybeGetter<IdOrNull>,
  remoteRowId: MaybeGetter<IdOrNull>,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): void =>
  addListenerEffect(
    resolveRelationships(relationshipsOrRelationshipsId),
    LOCAL + ROW_IDS,
    listener,
    () => [maybeGet(relationshipId), maybeGet(remoteRowId)],
  );

export const onLinkedRowIds = (
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): void =>
  addListenerEffect(
    resolveRelationships(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    listener,
    () => [maybeGet(relationshipId), maybeGet(firstRowId)],
  );

export const onResultTable = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + TABLE,
    listener,
    () => [maybeGet(queryId)],
  );

export const onResultTableCellIds = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + TABLE + CELL_IDS,
    listener,
    () => [maybeGet(queryId)],
  );

export const onResultRowCount = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + ROW_COUNT,
    listener,
    () => [maybeGet(queryId)],
  );

export const onResultRowIds = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + ROW_IDS,
    listener,
    () => [maybeGet(queryId)],
  );

export const onResultSortedRowIds = (
  queryId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + SORTED_ROW_IDS,
    listener,
    () => [
      maybeGet(queryId),
      maybeGet(cellId),
      maybeGet(descending),
      maybeGet(offset),
      maybeGet(limit),
    ],
  );

export const onResultRow = (
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultRowListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + ROW,
    listener,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const onResultCellIds = (
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + CELL_IDS,
    listener,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const onResultCell = (
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: ResultCellListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    RESULT + CELL,
    listener,
    () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)],
  );

export const onParamValues = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ParamValuesListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    'ParamValues',
    listener,
    () => [maybeGet(queryId)],
  );

export const onParamValue = (
  queryId: MaybeGetter<IdOrNull>,
  paramId: MaybeGetter<IdOrNull>,
  listener: ParamValueListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  addListenerEffect(
    resolveQueries(queriesOrQueriesId),
    'ParamValue',
    listener,
    () => [maybeGet(queryId), maybeGet(paramId)],
  );

export const onCheckpointIds = (
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): void =>
  addListenerEffect(
    resolveCheckpoints(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    listener,
  );

export const onCheckpoint = (
  checkpointId: MaybeGetter<IdOrNull>,
  listener: CheckpointListener,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): void =>
  addListenerEffect(
    resolveCheckpoints(checkpointsOrCheckpointsId),
    CHECKPOINT,
    listener,
    () => [maybeGet(checkpointId)],
  );

export const onPersisterStatus = (
  listener: StatusListener,
  persisterOrPersisterId?: MaybeGetter<AnyPersister | Id | undefined>,
): void =>
  addListenerEffect(resolvePersister(persisterOrPersisterId), STATUS, listener);

export const onSynchronizerStatus = (
  listener: StatusListener,
  synchronizerOrSynchronizerId?: MaybeGetter<Synchronizer | Id | undefined>,
): void =>
  addListenerEffect(
    resolveSynchronizer(synchronizerOrSynchronizerId),
    STATUS,
    listener,
  );

const provideThing = (thingId: Id, thing: any, offset: number): void => {
  const contextValue = getContextValue();
  if (hasWindow()) {
    $effect(() => {
      contextValue[16]?.(offset, thingId, thing);
      return () => contextValue[17]?.(offset, thingId);
    });
  }
};

export const provideStore = (storeId: Id, store: Store): void =>
  provideThing(storeId, store, OFFSET_STORE);

export const provideMetrics = (metricsId: Id, metrics: Metrics): void =>
  provideThing(metricsId, metrics, OFFSET_METRICS);

export const provideIndexes = (indexesId: Id, indexes: Indexes): void =>
  provideThing(indexesId, indexes, OFFSET_INDEXES);

export const provideRelationships = (
  relationshipsId: Id,
  relationships: Relationships,
): void => provideThing(relationshipsId, relationships, OFFSET_RELATIONSHIPS);

export const provideQueries = (queriesId: Id, queries: Queries): void =>
  provideThing(queriesId, queries, OFFSET_QUERIES);

export const provideCheckpoints = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => provideThing(checkpointsId, checkpoints, OFFSET_CHECKPOINTS);

export const providePersister = (
  persisterId: Id,
  persister: AnyPersister,
): void => provideThing(persisterId, persister, OFFSET_PERSISTER);

export const provideSynchronizer = (
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void => provideThing(synchronizerId, synchronizer, OFFSET_SYNCHRONIZER);
