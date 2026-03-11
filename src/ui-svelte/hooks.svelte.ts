import {getContext} from 'svelte';
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
import {isFunction, isString, isUndefined} from '../common/other.ts';
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

const useThing = <UsedThing extends Thing>(
  thingOrThingId: UsedThing | Id | undefined,
  offset: number,
): UsedThing | undefined => getThing(getContextValue(), thingOrThingId, offset);

const useThingOrThingById = <UsedThing extends Thing>(
  thingOrThingId: MaybeGetter<UsedThing | Id | undefined>,
  offset: number,
): (() => UsedThing | undefined) => {
  const contextValue = getContextValue();
  return () =>
    getThing<UsedThing>(contextValue, maybeGet(thingOrThingId), offset);
};

const getThingIds = (contextValue: ContextValue, offset: number): Ids =>
  objIds((contextValue[offset * 2 + 1] ?? EMPTY_OBJ) as IdObj<unknown>);

export const useStoreOrStoreById = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): (() => Store | undefined) =>
  useThingOrThingById<Store>(storeOrStoreId as any, OFFSET_STORE);

export const useMetricsOrMetricsById = (
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): (() => Metrics | undefined) =>
  useThingOrThingById<Metrics>(metricsOrMetricsId as any, OFFSET_METRICS);

export const useIndexesOrIndexesById = (
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): (() => Indexes | undefined) =>
  useThingOrThingById<Indexes>(indexesOrIndexesId as any, OFFSET_INDEXES);

export const useRelationshipsOrRelationshipsById = (
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): (() => Relationships | undefined) =>
  useThingOrThingById<Relationships>(
    relationshipsOrRelationshipsId as any,
    OFFSET_RELATIONSHIPS,
  );

export const useQueriesOrQueriesById = (
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): (() => Queries | undefined) =>
  useThingOrThingById<Queries>(queriesOrQueriesId as any, OFFSET_QUERIES);

export const useCheckpointsOrCheckpointsById = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): (() => Checkpoints | undefined) =>
  useThingOrThingById<Checkpoints>(
    checkpointsOrCheckpointsId as any,
    OFFSET_CHECKPOINTS,
  );

export const usePersisterOrPersisterById = (
  persisterOrPersisterId?: MaybeGetter<AnyPersister | Id | undefined>,
): (() => AnyPersister | undefined) =>
  useThingOrThingById<AnyPersister>(
    persisterOrPersisterId as any,
    OFFSET_PERSISTER,
  );

export const useSynchronizerOrSynchronizerById = (
  synchronizerOrSynchronizerId?: MaybeGetter<Synchronizer | Id | undefined>,
): (() => Synchronizer | undefined) =>
  useThingOrThingById<Synchronizer>(
    synchronizerOrSynchronizerId as any,
    OFFSET_SYNCHRONIZER,
  );

const useListenable = <T>(
  getThing: () => any,
  listenable: string,
  defaultValue: T,
  getArgs: () => readonly any[] = () => EMPTY_ARR,
  isHas?: 0 | 1,
): {readonly current: T} => {
  const getMethod = (isHas ? _HAS : GET) + listenable;
  const addMethod = ADD + (isHas ? HAS : '') + listenable + LISTENER;
  let value = $state<T>(
    (getThing()?.[getMethod]?.(...getArgs()) ?? defaultValue) as T,
  );
  if (typeof window !== 'undefined') {
    $effect(() => {
      const thing = getThing();
      const args = getArgs();
      value = (thing?.[getMethod]?.(...args) ?? defaultValue) as T;
      const listenerId = thing?.[addMethod]?.(...args, () => {
        value = (thing[getMethod](...getArgs()) ?? defaultValue) as T;
      });
      return () => thing?.delListener?.(listenerId);
    });
  }
  return {
    get current(): T {
      return value as T;
    },
  };
};

const useListener = (
  getThing: () => any,
  listenable: string,
  listener: (...args: any[]) => void,
  getPreArgs: () => readonly any[] = () => EMPTY_ARR,
  mutator?: boolean,
): void => {
  if (typeof window !== 'undefined') {
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

export const useHasTables = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    TABLES,
    false,
    () => EMPTY_ARR,
    1,
  );

export const useTables = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Tables} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    TABLES,
    EMPTY_OBJ as Tables,
  );

export const useTableIds = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(useStoreOrStoreById(storeOrStoreId), TABLE_IDS, EMPTY_ARR);

export const useHasTable = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    TABLE,
    false,
    () => [maybeGet(tableId)],
    1,
  );

export const useTable = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Table} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    TABLE,
    EMPTY_OBJ as Table,
    () => [maybeGet(tableId)],
  );

export const useTableCellIds = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    TABLE + CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(tableId)],
  );

export const useHasTableCell = (
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    TABLE + CELL,
    false,
    () => [maybeGet(tableId), maybeGet(cellId)],
    1,
  );

export const useRowCount = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: number} =>
  useListenable(useStoreOrStoreById(storeOrStoreId), ROW_COUNT, 0, () => [
    maybeGet(tableId),
  ]);

export const useRowIds = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(useStoreOrStoreById(storeOrStoreId), ROW_IDS, EMPTY_ARR, () => [
    maybeGet(tableId),
  ]);

export const useSortedRowIds = (
  tableId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean> = false,
  offset: MaybeGetter<number> = 0,
  limit?: MaybeGetter<number | undefined>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
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

export const useHasRow = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    ROW,
    false,
    () => [maybeGet(tableId), maybeGet(rowId)],
    1,
  );

export const useRow = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Row} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    ROW,
    EMPTY_OBJ as Row,
    () => [maybeGet(tableId), maybeGet(rowId)],
  );

export const useCellIds = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(tableId), maybeGet(rowId)],
  );

export const useHasCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    CELL,
    false,
    () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
    1,
  );

export const useCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: CellOrUndefined} =>
  useListenable(useStoreOrStoreById(storeOrStoreId), CELL, undefined, () => [
    maybeGet(tableId),
    maybeGet(rowId),
    maybeGet(cellId),
  ]);

export const useBindableCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)} => {
  const getS = useStoreOrStoreById(storeOrStoreId);
  let value = $state<CellOrUndefined>(
    getS()?.getCell(maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)),
  );
  if (typeof window !== 'undefined') {
    $effect(() => {
      const s: any = getS();
      const t = maybeGet(tableId),
        r = maybeGet(rowId),
        c = maybeGet(cellId);
      value = s?.getCell(t, r, c);
      const listenerId = s?.addCellListener(t, r, c, (st: any) => {
        value = st.getCell(
          maybeGet(tableId),
          maybeGet(rowId),
          maybeGet(cellId),
        );
      });
      return () => s?.delListener?.(listenerId);
    });
  }
  return {
    get current(): CellOrUndefined {
      return value;
    },
    set current(v: Cell) {
      getS()?.setCell(maybeGet(tableId), maybeGet(rowId), maybeGet(cellId), v);
    },
  };
};

export const useHasValues = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    VALUES,
    false,
    () => EMPTY_ARR,
    1,
  );

export const useValues = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Values} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    VALUES,
    EMPTY_OBJ as Values,
  );

export const useValueIds = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(useStoreOrStoreById(storeOrStoreId), VALUE_IDS, EMPTY_ARR);

export const useHasValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useListenable(
    useStoreOrStoreById(storeOrStoreId),
    VALUE,
    false,
    () => [maybeGet(valueId)],
    1,
  );

export const useValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: ValueOrUndefined} =>
  useListenable(useStoreOrStoreById(storeOrStoreId), VALUE, undefined, () => [
    maybeGet(valueId),
  ]);

export const useBindableValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)} => {
  const getS = useStoreOrStoreById(storeOrStoreId);
  let value = $state<ValueOrUndefined>(getS()?.getValue(maybeGet(valueId)));
  if (typeof window !== 'undefined') {
    $effect(() => {
      const s: any = getS();
      const vid = maybeGet(valueId);
      value = s?.getValue(vid);
      const listenerId = s?.addValueListener(vid, (st: any) => {
        value = st.getValue(maybeGet(valueId));
      });
      return () => s?.delListener?.(listenerId);
    });
  }
  return {
    get current(): ValueOrUndefined {
      return value;
    },
    set current(v: Value) {
      getS()?.setValue(maybeGet(valueId), v);
    },
  };
};

export const useStore = (id?: Id): Store | undefined =>
  useThing(id, OFFSET_STORE) as Store | undefined;

export const useStoreIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_STORE));
  if (typeof window !== 'undefined') {
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

export const useMetrics = (id?: Id): Metrics | undefined =>
  useThing(id, OFFSET_METRICS) as Metrics | undefined;

export const useMetricsIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_METRICS));
  if (typeof window !== 'undefined') {
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

export const useMetricIds = (
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useMetricsOrMetricsById(metricsOrMetricsId),
    METRIC + IDS,
    EMPTY_ARR,
  );

export const useMetric = (
  metricId: MaybeGetter<Id>,
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {readonly current: number | undefined} =>
  useListenable(
    useMetricsOrMetricsById(metricsOrMetricsId),
    METRIC,
    undefined,
    () => [maybeGet(metricId)],
  );

export const useIndexes = (id?: Id): Indexes | undefined =>
  useThing(id, OFFSET_INDEXES) as Indexes | undefined;

export const useIndexesIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_INDEXES));
  if (typeof window !== 'undefined') {
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

export const useIndexIds = (
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useIndexesOrIndexesById(indexesOrIndexesId),
    INDEX + IDS,
    EMPTY_ARR,
  );

export const useSliceIds = (
  indexId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useIndexesOrIndexesById(indexesOrIndexesId),
    SLICE + IDS,
    EMPTY_ARR,
    () => [maybeGet(indexId)],
  );

export const useSliceRowIds = (
  indexId: MaybeGetter<Id>,
  sliceId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useIndexesOrIndexesById(indexesOrIndexesId),
    SLICE + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(indexId), maybeGet(sliceId)],
  );

export const useIndexStoreTableId = (
  indexesOrId: MaybeGetter<Indexes | Id | undefined>,
  indexId: MaybeGetter<Id>,
) => {
  const getI = useIndexesOrIndexesById(indexesOrId);
  return {
    get store() {
      return getI()?.getStore();
    },
    get tableId() {
      return getI()?.getTableId(maybeGet(indexId));
    },
  };
};

export const useQueries = (id?: Id): Queries | undefined =>
  useThing(id, OFFSET_QUERIES) as Queries | undefined;

export const useQueriesIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_QUERIES));
  if (typeof window !== 'undefined') {
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

export const useQueryIds = (
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    QUERY + IDS,
    EMPTY_ARR,
  );

export const useResultTable = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Table} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + TABLE,
    EMPTY_OBJ as Table,
    () => [maybeGet(queryId)],
  );

export const useResultTableCellIds = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + TABLE + CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(queryId)],
  );

export const useResultRowCount = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: number} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW_COUNT,
    0,
    () => [maybeGet(queryId)],
  );

export const useResultRowIds = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(queryId)],
  );

export const useResultSortedRowIds = (
  queryId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean> = false,
  offset: MaybeGetter<number> = 0,
  limit?: MaybeGetter<number | undefined>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
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

export const useResultRow = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Row} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW,
    EMPTY_OBJ as Row,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const useResultCellIds = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + CELL_IDS,
    EMPTY_ARR,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const useResultCell = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Cell | undefined} =>
  useListenable(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + CELL,
    undefined,
    () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)],
  );

export const useRelationships = (id?: Id): Relationships | undefined =>
  useThing(id, OFFSET_RELATIONSHIPS) as Relationships | undefined;

export const useRelationshipsIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_RELATIONSHIPS));
  if (typeof window !== 'undefined') {
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

export const useRelationshipIds = (
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    RELATIONSHIP + IDS,
    EMPTY_ARR,
  );

export const useRemoteRowId = (
  relationshipId: MaybeGetter<Id>,
  localRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Id | undefined} =>
  useListenable(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    REMOTE_ROW_ID,
    undefined,
    () => [maybeGet(relationshipId), maybeGet(localRowId)],
  );

export const useLocalRowIds = (
  relationshipId: MaybeGetter<Id>,
  remoteRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    LOCAL + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(relationshipId), maybeGet(remoteRowId)],
  );

export const useLinkedRowIds = (
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useListenable(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    EMPTY_ARR,
    () => [maybeGet(relationshipId), maybeGet(firstRowId)],
  );

export const useRelationshipsStoreTableIds = (
  relationshipsOrId: MaybeGetter<Relationships | Id | undefined>,
  relationshipId: MaybeGetter<Id>,
) => {
  const getR = useRelationshipsOrRelationshipsById(relationshipsOrId);
  return {
    get store() {
      return getR()?.getStore();
    },
    get localTableId() {
      return getR()?.getLocalTableId(maybeGet(relationshipId));
    },
    get remoteTableId() {
      return getR()?.getRemoteTableId(maybeGet(relationshipId));
    },
  };
};

export const useCheckpoints = (id?: Id): Checkpoints | undefined =>
  useThing(id, OFFSET_CHECKPOINTS) as Checkpoints | undefined;

export const useCheckpointsIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_CHECKPOINTS));
  if (typeof window !== 'undefined') {
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

export const useCheckpointIds = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: CheckpointIds} =>
  useListenable(
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    DEFAULT_CHECKPOINT_IDS,
  );

export const useCheckpoint = (
  checkpointId: MaybeGetter<Id>,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: string | undefined} =>
  useListenable(
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    CHECKPOINT,
    undefined,
    () => [maybeGet(checkpointId)],
  );

export const useGoBackwardCallback = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): (() => void) => {
  const getC = useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId);
  return () => getC()?.goBackward();
};

export const useGoForwardCallback = (
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): (() => void) => {
  const getC = useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId);
  return () => getC()?.goForward();
};

export const usePersister = (id?: Id): AnyPersister | undefined =>
  useThing(id, OFFSET_PERSISTER) as AnyPersister | undefined;

export const usePersisterIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_PERSISTER));
  if (typeof window !== 'undefined') {
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

export const usePersisterStatus = (
  persisterOrPersisterId?: AnyPersister | Id,
): {readonly current: Status} =>
  useListenable(
    usePersisterOrPersisterById(persisterOrPersisterId),
    STATUS,
    0 as Status,
  );

export const useSynchronizer = (id?: Id): Synchronizer | undefined =>
  useThing(id, OFFSET_SYNCHRONIZER) as Synchronizer | undefined;

export const useSynchronizerIds = (): {readonly current: Ids} => {
  const contextValue = getContextValue();
  let ids = $state<Ids>(getThingIds(contextValue, OFFSET_SYNCHRONIZER));
  if (typeof window !== 'undefined') {
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

export const useSynchronizerStatus = (
  synchronizerOrSynchronizerId?: Synchronizer | Id,
): {readonly current: Status} =>
  useListenable(
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    STATUS,
    0 as Status,
  );

export const useHasTablesListener = (
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + TABLES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const useTablesListener = (
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    TABLES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const useTableIdsListener = (
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    TABLE_IDS,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const useHasTableListener = (
  tableId: MaybeGetter<IdOrNull>,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + TABLE,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const useTableListener = (
  tableId: MaybeGetter<IdOrNull>,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    TABLE,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const useTableCellIdsListener = (
  tableId: MaybeGetter<IdOrNull>,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    TABLE + CELL_IDS,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const useHasTableCellListener = (
  tableId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + TABLE + CELL,
    listener,
    () => [maybeGet(tableId), maybeGet(cellId)],
    mutator,
  );

export const useRowCountListener = (
  tableId: MaybeGetter<IdOrNull>,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    ROW_COUNT,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const useRowIdsListener = (
  tableId: MaybeGetter<IdOrNull>,
  listener: RowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    ROW_IDS,
    listener,
    () => [maybeGet(tableId)],
    mutator,
  );

export const useSortedRowIdsListener = (
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
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

export const useHasRowListener = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + ROW,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId)],
    mutator,
  );

export const useRowListener = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    ROW,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId)],
    mutator,
  );

export const useCellIdsListener = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    CELL_IDS,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId)],
    mutator,
  );

export const useHasCellListener = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + CELL,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
    mutator,
  );

export const useCellListener = (
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    CELL,
    listener,
    () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
    mutator,
  );

export const useHasValuesListener = (
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + VALUES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const useValuesListener = (
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    VALUES,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const useValueIdsListener = (
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    VALUE_IDS,
    listener,
    () => EMPTY_ARR,
    mutator,
  );

export const useHasValueListener = (
  valueId: MaybeGetter<IdOrNull>,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    HAS + VALUE,
    listener,
    () => [maybeGet(valueId)],
    mutator,
  );

export const useValueListener = (
  valueId: MaybeGetter<IdOrNull>,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    VALUE,
    listener,
    () => [maybeGet(valueId)],
    mutator,
  );

export const useStartTransactionListener = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    'Start' + TRANSACTION,
    listener,
  );

export const useWillFinishTransactionListener = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    'Will' + FINISH + TRANSACTION,
    listener,
  );

export const useDidFinishTransactionListener = (
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): void =>
  useListener(
    useStoreOrStoreById(storeOrStoreId),
    'Did' + FINISH + TRANSACTION,
    listener,
  );

export const useMetricListener = (
  metricId: MaybeGetter<IdOrNull>,
  listener: MetricListener,
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): void =>
  useListener(
    useMetricsOrMetricsById(metricsOrMetricsId),
    METRIC,
    listener,
    () => [maybeGet(metricId)],
  );

export const useSliceIdsListener = (
  indexId: MaybeGetter<IdOrNull>,
  listener: SliceIdsListener,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): void =>
  useListener(
    useIndexesOrIndexesById(indexesOrIndexesId),
    SLICE + IDS,
    listener,
    () => [maybeGet(indexId)],
  );

export const useSliceRowIdsListener = (
  indexId: MaybeGetter<IdOrNull>,
  sliceId: MaybeGetter<IdOrNull>,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): void =>
  useListener(
    useIndexesOrIndexesById(indexesOrIndexesId),
    SLICE + ROW_IDS,
    listener,
    () => [maybeGet(indexId), maybeGet(sliceId)],
  );

export const useRemoteRowIdListener = (
  relationshipId: MaybeGetter<IdOrNull>,
  localRowId: MaybeGetter<IdOrNull>,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): void =>
  useListener(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    REMOTE_ROW_ID,
    listener,
    () => [maybeGet(relationshipId), maybeGet(localRowId)],
  );

export const useLocalRowIdsListener = (
  relationshipId: MaybeGetter<IdOrNull>,
  remoteRowId: MaybeGetter<IdOrNull>,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): void =>
  useListener(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    LOCAL + ROW_IDS,
    listener,
    () => [maybeGet(relationshipId), maybeGet(remoteRowId)],
  );

export const useLinkedRowIdsListener = (
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): void =>
  useListener(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    listener,
    () => [maybeGet(relationshipId), maybeGet(firstRowId)],
  );

export const useResultTableListener = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + TABLE,
    listener,
    () => [maybeGet(queryId)],
  );

export const useResultTableCellIdsListener = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + TABLE + CELL_IDS,
    listener,
    () => [maybeGet(queryId)],
  );

export const useResultRowCountListener = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW_COUNT,
    listener,
    () => [maybeGet(queryId)],
  );

export const useResultRowIdsListener = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW_IDS,
    listener,
    () => [maybeGet(queryId)],
  );

export const useResultSortedRowIdsListener = (
  queryId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
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

export const useResultRowListener = (
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultRowListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW,
    listener,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const useResultCellIdsListener = (
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + CELL_IDS,
    listener,
    () => [maybeGet(queryId), maybeGet(rowId)],
  );

export const useResultCellListener = (
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: ResultCellListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + CELL,
    listener,
    () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)],
  );

export const useParamValuesListener = (
  queryId: MaybeGetter<IdOrNull>,
  listener: ParamValuesListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    'ParamValues',
    listener,
    () => [maybeGet(queryId)],
  );

export const useParamValueListener = (
  queryId: MaybeGetter<IdOrNull>,
  paramId: MaybeGetter<IdOrNull>,
  listener: ParamValueListener,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): void =>
  useListener(
    useQueriesOrQueriesById(queriesOrQueriesId),
    'ParamValue',
    listener,
    () => [maybeGet(queryId), maybeGet(paramId)],
  );

export const useCheckpointIdsListener = (
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): void =>
  useListener(
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    listener,
  );

export const useCheckpointListener = (
  checkpointId: MaybeGetter<IdOrNull>,
  listener: CheckpointListener,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): void =>
  useListener(
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    CHECKPOINT,
    listener,
    () => [maybeGet(checkpointId)],
  );

export const usePersisterStatusListener = (
  listener: StatusListener,
  persisterOrPersisterId?: MaybeGetter<AnyPersister | Id | undefined>,
): void =>
  useListener(
    usePersisterOrPersisterById(persisterOrPersisterId),
    STATUS,
    listener,
  );

export const useSynchronizerStatusListener = (
  listener: StatusListener,
  synchronizerOrSynchronizerId?: MaybeGetter<Synchronizer | Id | undefined>,
): void =>
  useListener(
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    STATUS,
    listener,
  );

const provideThing = (thingId: Id, thing: any, offset: number): void => {
  const contextValue = getContextValue();
  if (typeof window !== 'undefined') {
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
