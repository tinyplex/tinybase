import {getContext} from 'svelte';
import type {
  CheckpointIds,
  Checkpoints,
} from '../@types/checkpoints/index.d.ts';
import type {Id, Ids} from '../@types/common/index.d.ts';
import type {Indexes} from '../@types/indexes/index.d.ts';
import type {Metrics} from '../@types/metrics/index.d.ts';
import type {AnyPersister, Status} from '../@types/persisters/index.d.ts';
import type {Queries} from '../@types/queries/index.d.ts';
import type {Relationships} from '../@types/relationships/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  Row,
  Store,
  Table,
  Tables,
  Value,
  ValueOrUndefined,
  Values,
} from '../@types/store/index.d.ts';
import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
import type {MaybeGetter} from '../@types/ui-svelte/index.d.ts';
import type {IdObj} from '../common/obj.ts';
import {objGet, objIds} from '../common/obj.ts';
import {isString, isUndefined} from '../common/other.ts';
import {
  _HAS,
  ADD,
  CELL,
  CELL_IDS,
  CHECKPOINT,
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
  VALUE,
  VALUE_IDS,
  VALUES,
} from '../common/strings.ts';
import type {ContextValue} from './context.ts';
import {TINYBASE_CONTEXT_KEY} from './context.ts';

const EMPTY_ARR: Ids = [];
const EMPTY_OBJ: Record<string, never> = {};
const DEFAULT_CHECKPOINT_IDS: CheckpointIds = [EMPTY_ARR, undefined, EMPTY_ARR];

const get = <T>(v: MaybeGetter<T>): T =>
  typeof v === 'function' ? (v as () => T)() : v;

const OFFSET_STORE = 0;
const OFFSET_METRICS = 1;
const OFFSET_INDEXES = 2;
const OFFSET_RELATIONSHIPS = 3;
const OFFSET_QUERIES = 4;
const OFFSET_CHECKPOINTS = 5;
const OFFSET_PERSISTER = 6;
const OFFSET_SYNCHRONIZER = 7;

const getCtx = (): ContextValue =>
  (getContext(TINYBASE_CONTEXT_KEY) as ContextValue) ?? [];

const resolveWithCtx = <T>(
  ctx: ContextValue,
  thingOrId: T | Id | undefined,
  offset: number,
): T | undefined => {
  if (!isUndefined(thingOrId) && !isString(thingOrId)) return thingOrId as T;
  return isUndefined(thingOrId)
    ? (ctx[offset * 2] as T | undefined)
    : (objGet(ctx[offset * 2 + 1] as IdObj<T>, thingOrId as Id) as
        | T
        | undefined);
};

const useThing = <T>(
  thingOrId: T | Id | undefined,
  offset: number,
): T | undefined => resolveWithCtx(getCtx(), thingOrId, offset);

const useThingOrThingById = <T>(
  thingOrId?: T | Id | (() => T | Id | undefined),
  offset?: number,
): (() => T | undefined) => {
  const ctx = getCtx();
  return () =>
    resolveWithCtx<T>(
      ctx,
      (typeof thingOrId === 'function'
        ? (thingOrId as () => T | Id | undefined)()
        : thingOrId) as T | Id | undefined,
      offset!,
    );
};

const getThingIds = (ctx: ContextValue, offset: number): Ids =>
  objIds((ctx[offset * 2 + 1] ?? EMPTY_OBJ) as IdObj<unknown>);

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
  getMethod: string,
  addMethod: string,
  defaultValue: T,
  getArgs: () => readonly any[],
): {readonly current: T} => {
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

const useGet = <T>(
  getThing: () => any,
  listenable: string,
  defaultValue: T,
  getArgs: () => readonly any[] = () => EMPTY_ARR,
): {readonly current: T} =>
  useListenable(
    getThing,
    GET + listenable,
    ADD + listenable + LISTENER,
    defaultValue,
    getArgs,
  );

const useHas = (
  getThing: () => any,
  listenable: string,
  getArgs: () => readonly any[] = () => EMPTY_ARR,
): {readonly current: boolean} =>
  useListenable(
    getThing,
    _HAS + listenable,
    ADD + HAS + listenable + LISTENER,
    false,
    getArgs,
  );

export const useHasTables = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), TABLES);

export const useTables = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Tables} =>
  useGet(useStoreOrStoreById(storeOrStoreId), TABLES, EMPTY_OBJ as Tables);

export const useTableIds = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(useStoreOrStoreById(storeOrStoreId), TABLE_IDS, EMPTY_ARR);

export const useHasTable = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), TABLE, () => [get(tableId)]);

export const useTable = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Table} =>
  useGet(useStoreOrStoreById(storeOrStoreId), TABLE, EMPTY_OBJ as Table, () => [
    get(tableId),
  ]);

export const useTableCellIds = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useStoreOrStoreById(storeOrStoreId),
    TABLE + CELL_IDS,
    EMPTY_ARR,
    () => [get(tableId)],
  );

export const useHasTableCell = (
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), TABLE + CELL, () => [
    get(tableId),
    get(cellId),
  ]);

export const useRowCount = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: number} =>
  useGet(useStoreOrStoreById(storeOrStoreId), ROW_COUNT, 0, () => [
    get(tableId),
  ]);

export const useRowIds = (
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(useStoreOrStoreById(storeOrStoreId), ROW_IDS, EMPTY_ARR, () => [
    get(tableId),
  ]);

export const useSortedRowIds = (
  tableId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean> = false,
  offset: MaybeGetter<number> = 0,
  limit?: MaybeGetter<number | undefined>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(useStoreOrStoreById(storeOrStoreId), SORTED_ROW_IDS, EMPTY_ARR, () => [
    get(tableId),
    get(cellId),
    get(descending),
    get(offset),
    get(limit),
  ]);

export const useHasRow = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), ROW, () => [
    get(tableId),
    get(rowId),
  ]);

export const useRow = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Row} =>
  useGet(useStoreOrStoreById(storeOrStoreId), ROW, EMPTY_OBJ as Row, () => [
    get(tableId),
    get(rowId),
  ]);

export const useCellIds = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(useStoreOrStoreById(storeOrStoreId), CELL_IDS, EMPTY_ARR, () => [
    get(tableId),
    get(rowId),
  ]);

export const useHasCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), CELL, () => [
    get(tableId),
    get(rowId),
    get(cellId),
  ]);

export const useCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: CellOrUndefined} =>
  useGet(useStoreOrStoreById(storeOrStoreId), CELL, undefined, () => [
    get(tableId),
    get(rowId),
    get(cellId),
  ]);

export const useBindableCell = (
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)} => {
  const getS = useStoreOrStoreById(storeOrStoreId);
  let value = $state<CellOrUndefined>(
    getS()?.getCell(get(tableId), get(rowId), get(cellId)),
  );
  if (typeof window !== 'undefined') {
    $effect(() => {
      const s: any = getS();
      const t = get(tableId),
        r = get(rowId),
        c = get(cellId);
      value = s?.getCell(t, r, c);
      const listenerId = s?.addCellListener(t, r, c, (st: any) => {
        value = st.getCell(get(tableId), get(rowId), get(cellId));
      });
      return () => s?.delListener?.(listenerId);
    });
  }
  return {
    get current(): CellOrUndefined {
      return value;
    },
    set current(v: Cell) {
      getS()?.setCell(get(tableId), get(rowId), get(cellId), v);
    },
  };
};

export const useHasValues = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), VALUES);

export const useValues = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Values} =>
  useGet(useStoreOrStoreById(storeOrStoreId), VALUES, EMPTY_OBJ as Values);

export const useValueIds = (
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(useStoreOrStoreById(storeOrStoreId), VALUE_IDS, EMPTY_ARR);

export const useHasValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(useStoreOrStoreById(storeOrStoreId), VALUE, () => [get(valueId)]);

export const useValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: ValueOrUndefined} =>
  useGet(useStoreOrStoreById(storeOrStoreId), VALUE, undefined, () => [
    get(valueId),
  ]);

export const useBindableValue = (
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)} => {
  const getS = useStoreOrStoreById(storeOrStoreId);
  let value = $state<ValueOrUndefined>(getS()?.getValue(get(valueId)));
  if (typeof window !== 'undefined') {
    $effect(() => {
      const s: any = getS();
      const vid = get(valueId);
      value = s?.getValue(vid);
      const listenerId = s?.addValueListener(vid, (st: any) => {
        value = st.getValue(get(valueId));
      });
      return () => s?.delListener?.(listenerId);
    });
  }
  return {
    get current(): ValueOrUndefined {
      return value;
    },
    set current(v: Value) {
      getS()?.setValue(get(valueId), v);
    },
  };
};

export const useStore = (id?: Id): Store | undefined =>
  useThing(id, OFFSET_STORE) as Store | undefined;

export const useStoreIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_STORE));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_STORE);
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
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_METRICS));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_METRICS);
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
  useGet(useMetricsOrMetricsById(metricsOrMetricsId), METRIC + IDS, EMPTY_ARR);

export const useMetric = (
  metricId: MaybeGetter<Id>,
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {readonly current: number | undefined} =>
  useGet(useMetricsOrMetricsById(metricsOrMetricsId), METRIC, undefined, () => [
    get(metricId),
  ]);

export const useIndexes = (id?: Id): Indexes | undefined =>
  useThing(id, OFFSET_INDEXES) as Indexes | undefined;

export const useIndexesIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_INDEXES));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_INDEXES);
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
  useGet(useIndexesOrIndexesById(indexesOrIndexesId), INDEX + IDS, EMPTY_ARR);

export const useSliceIds = (
  indexId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useIndexesOrIndexesById(indexesOrIndexesId),
    SLICE + IDS,
    EMPTY_ARR,
    () => [get(indexId)],
  );

export const useSliceRowIds = (
  indexId: MaybeGetter<Id>,
  sliceId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useIndexesOrIndexesById(indexesOrIndexesId),
    SLICE + ROW_IDS,
    EMPTY_ARR,
    () => [get(indexId), get(sliceId)],
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
      return getI()?.getTableId(get(indexId));
    },
  };
};

export const useQueries = (id?: Id): Queries | undefined =>
  useThing(id, OFFSET_QUERIES) as Queries | undefined;

export const useQueriesIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_QUERIES));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_QUERIES);
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
  useGet(useQueriesOrQueriesById(queriesOrQueriesId), QUERY + IDS, EMPTY_ARR);

export const useResultTable = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Table} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + TABLE,
    EMPTY_OBJ as Table,
    () => [get(queryId)],
  );

export const useResultTableCellIds = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + TABLE + CELL_IDS,
    EMPTY_ARR,
    () => [get(queryId)],
  );

export const useResultRowCount = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: number} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW_COUNT,
    0,
    () => [get(queryId)],
  );

export const useResultRowIds = (
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW_IDS,
    EMPTY_ARR,
    () => [get(queryId)],
  );

export const useResultSortedRowIds = (
  queryId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean> = false,
  offset: MaybeGetter<number> = 0,
  limit?: MaybeGetter<number | undefined>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + SORTED_ROW_IDS,
    EMPTY_ARR,
    () => [get(queryId), get(cellId), get(descending), get(offset), get(limit)],
  );

export const useResultRow = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Row} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + ROW,
    EMPTY_OBJ as Row,
    () => [get(queryId), get(rowId)],
  );

export const useResultCellIds = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + CELL_IDS,
    EMPTY_ARR,
    () => [get(queryId), get(rowId)],
  );

export const useResultCell = (
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Cell | undefined} =>
  useGet(
    useQueriesOrQueriesById(queriesOrQueriesId),
    RESULT + CELL,
    undefined,
    () => [get(queryId), get(rowId), get(cellId)],
  );

export const useRelationships = (id?: Id): Relationships | undefined =>
  useThing(id, OFFSET_RELATIONSHIPS) as Relationships | undefined;

export const useRelationshipsIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_RELATIONSHIPS));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_RELATIONSHIPS);
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
  useGet(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    RELATIONSHIP + IDS,
    EMPTY_ARR,
  );

export const useRemoteRowId = (
  relationshipId: MaybeGetter<Id>,
  localRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Id | undefined} =>
  useGet(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    REMOTE_ROW_ID,
    undefined,
    () => [get(relationshipId), get(localRowId)],
  );

export const useLocalRowIds = (
  relationshipId: MaybeGetter<Id>,
  remoteRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    LOCAL + ROW_IDS,
    EMPTY_ARR,
    () => [get(relationshipId), get(remoteRowId)],
  );

export const useLinkedRowIds = (
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    EMPTY_ARR,
    () => [get(relationshipId), get(firstRowId)],
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
      return getR()?.getLocalTableId(get(relationshipId));
    },
    get remoteTableId() {
      return getR()?.getRemoteTableId(get(relationshipId));
    },
  };
};

export const useCheckpoints = (id?: Id): Checkpoints | undefined =>
  useThing(id, OFFSET_CHECKPOINTS) as Checkpoints | undefined;

export const useCheckpointsIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_CHECKPOINTS));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_CHECKPOINTS);
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
  useGet(
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    DEFAULT_CHECKPOINT_IDS,
  );

export const useCheckpoint = (
  checkpointId: MaybeGetter<Id>,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: string | undefined} =>
  useGet(
    useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
    CHECKPOINT,
    undefined,
    () => [get(checkpointId)],
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
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_PERSISTER));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_PERSISTER);
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
  useGet(
    usePersisterOrPersisterById(persisterOrPersisterId),
    STATUS,
    0 as Status,
  );

export const useSynchronizer = (id?: Id): Synchronizer | undefined =>
  useThing(id, OFFSET_SYNCHRONIZER) as Synchronizer | undefined;

export const useSynchronizerIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_SYNCHRONIZER));
  if (typeof window !== 'undefined') {
    $effect(() => {
      ids = getThingIds(ctx, OFFSET_SYNCHRONIZER);
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
  useGet(
    useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
    STATUS,
    0 as Status,
  );

const provideThing = (thingId: Id, thing: any, offset: number): void => {
  const ctx = getCtx();
  if (typeof window !== 'undefined') {
    $effect(() => {
      ctx[16]?.(offset, thingId, thing);
      return () => ctx[17]?.(offset, thingId);
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
