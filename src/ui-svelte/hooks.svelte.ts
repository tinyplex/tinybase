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

const resolveByOffset = <T>(
  thingOrId: T | Id | undefined,
  offset: number,
): T | undefined => resolveWithCtx(getCtx(), thingOrId, offset);

const mkGetter = <T>(
  offset: number,
  thingOrId?: T | Id,
): (() => T | undefined) => {
  const ctx = getCtx();
  return () => resolveWithCtx<T>(ctx, thingOrId, offset);
};

const getThingIds = (ctx: ContextValue, offset: number): Ids =>
  objIds((ctx[offset * 2 + 1] ?? EMPTY_OBJ) as IdObj<unknown>);

const sg = (s?: Store | Id): (() => Store | undefined) =>
  mkGetter<Store>(OFFSET_STORE, s);

const mg = (m?: Metrics | Id): (() => Metrics | undefined) =>
  mkGetter<Metrics>(OFFSET_METRICS, m);

const ig = (i?: Indexes | Id): (() => Indexes | undefined) =>
  mkGetter<Indexes>(OFFSET_INDEXES, i);

const rg = (r?: Relationships | Id): (() => Relationships | undefined) =>
  mkGetter<Relationships>(OFFSET_RELATIONSHIPS, r);

const qg = (q?: Queries | Id): (() => Queries | undefined) =>
  mkGetter<Queries>(OFFSET_QUERIES, q);

const cg = (c?: Checkpoints | Id): (() => Checkpoints | undefined) =>
  mkGetter<Checkpoints>(OFFSET_CHECKPOINTS, c);

const pg = (p?: AnyPersister | Id): (() => AnyPersister | undefined) =>
  mkGetter<AnyPersister>(OFFSET_PERSISTER, p);

const syg = (sy?: Synchronizer | Id): (() => Synchronizer | undefined) =>
  mkGetter<Synchronizer>(OFFSET_SYNCHRONIZER, sy);

const useListenable = <T>(
  getThing: () => any,
  getMethod: string,
  addMethod: string,
  defaultValue: T,
  args: readonly any[],
): {readonly current: T} => {
  let value = $state<T>(
    (getThing()?.[getMethod]?.(...args) ?? defaultValue) as T,
  );
  $effect(() => {
    const thing = getThing();
    value = (thing?.[getMethod]?.(...args) ?? defaultValue) as T;
    const listenerId = thing?.[addMethod]?.(...args, () => {
      value = (thing[getMethod](...args) ?? defaultValue) as T;
    });
    return () => thing?.delListener?.(listenerId);
  });
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
  args: readonly any[] = EMPTY_ARR,
): {readonly current: T} =>
  useListenable(
    getThing,
    GET + listenable,
    ADD + listenable + LISTENER,
    defaultValue,
    args,
  );

const useHas = (
  getThing: () => any,
  listenable: string,
  args: readonly any[] = EMPTY_ARR,
): {readonly current: boolean} =>
  useListenable(
    getThing,
    _HAS + listenable,
    ADD + HAS + listenable + LISTENER,
    false,
    args,
  );

export const useHasTables = (
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(sg(storeOrStoreId), TABLES);

export const useTables = (
  storeOrStoreId?: Store | Id,
): {readonly current: Tables} =>
  useGet(sg(storeOrStoreId), TABLES, EMPTY_OBJ as Tables);

export const useTableIds = (
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} => useGet(sg(storeOrStoreId), TABLE_IDS, EMPTY_ARR);

export const useHasTable = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(sg(storeOrStoreId), TABLE, [tableId]);

export const useTable = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Table} =>
  useGet(sg(storeOrStoreId), TABLE, EMPTY_OBJ as Table, [tableId]);

export const useTableCellIds = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), TABLE + CELL_IDS, EMPTY_ARR, [tableId]);

export const useHasTableCell = (
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), TABLE + CELL, [tableId, cellId]);

export const useRowCount = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: number} =>
  useGet(sg(storeOrStoreId), ROW_COUNT, 0, [tableId]);

export const useRowIds = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), ROW_IDS, EMPTY_ARR, [tableId]);

export const useSortedRowIds = (
  tableId: Id,
  cellId?: Id,
  descending = false,
  offset = 0,
  limit?: number,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), SORTED_ROW_IDS, EMPTY_ARR, [
    tableId,
    cellId,
    descending,
    offset,
    limit,
  ]);

export const useHasRow = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), ROW, [tableId, rowId]);

export const useRow = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Row} =>
  useGet(sg(storeOrStoreId), ROW, EMPTY_OBJ as Row, [tableId, rowId]);

export const useCellIds = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), CELL_IDS, EMPTY_ARR, [tableId, rowId]);

export const useHasCell = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), CELL, [tableId, rowId, cellId]);

export const useCell = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: CellOrUndefined} =>
  useGet(sg(storeOrStoreId), CELL, undefined, [tableId, rowId, cellId]);

export const useCellState = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {get current(): CellOrUndefined; set current(v: Cell)} => {
  const getS = sg(storeOrStoreId);
  let value = $state<CellOrUndefined>(getS()?.getCell(tableId, rowId, cellId));
  $effect(() => {
    const s: any = getS();
    value = s?.getCell(tableId, rowId, cellId);
    const listenerId = s?.addCellListener(tableId, rowId, cellId, (st: any) => {
      value = st.getCell(tableId, rowId, cellId);
    });
    return () => s?.delListener?.(listenerId);
  });
  return {
    get current(): CellOrUndefined {
      return value;
    },
    set current(v: Cell) {
      getS()?.setCell(tableId, rowId, cellId, v);
    },
  };
};

export const useHasValues = (
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(sg(storeOrStoreId), VALUES);

export const useValues = (
  storeOrStoreId?: Store | Id,
): {readonly current: Values} =>
  useGet(sg(storeOrStoreId), VALUES, EMPTY_OBJ as Values);

export const useValueIds = (
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} => useGet(sg(storeOrStoreId), VALUE_IDS, EMPTY_ARR);

export const useHasValue = (
  valueId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(sg(storeOrStoreId), VALUE, [valueId]);

export const useValue = (
  valueId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: ValueOrUndefined} =>
  useGet(sg(storeOrStoreId), VALUE, undefined, [valueId]);

export const useValueState = (
  valueId: Id,
  storeOrStoreId?: Store | Id,
): {get current(): ValueOrUndefined; set current(v: Value)} => {
  const getS = sg(storeOrStoreId);
  let value = $state<ValueOrUndefined>(getS()?.getValue(valueId));
  $effect(() => {
    const s: any = getS();
    value = s?.getValue(valueId);
    const listenerId = s?.addValueListener(valueId, (st: any) => {
      value = st.getValue(valueId);
    });
    return () => s?.delListener?.(listenerId);
  });
  return {
    get current(): ValueOrUndefined {
      return value;
    },
    set current(v: Value) {
      getS()?.setValue(valueId, v);
    },
  };
};

export const useStore = (id?: Id): Store | undefined =>
  resolveByOffset(id, OFFSET_STORE) as Store | undefined;

export const useStoreIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_STORE));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_STORE);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useMetrics = (id?: Id): Metrics | undefined =>
  resolveByOffset(id, OFFSET_METRICS) as Metrics | undefined;

export const useMetricsIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_METRICS));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_METRICS);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useMetricIds = (
  metricsOrMetricsId?: Metrics | Id,
): {readonly current: Ids} =>
  useGet(mg(metricsOrMetricsId), METRIC + IDS, EMPTY_ARR);

export const useMetric = (
  metricId: Id,
  metricsOrMetricsId?: Metrics | Id,
): {readonly current: number | undefined} =>
  useGet(mg(metricsOrMetricsId), METRIC, undefined, [metricId]);

export const useIndexes = (id?: Id): Indexes | undefined =>
  resolveByOffset(id, OFFSET_INDEXES) as Indexes | undefined;

export const useIndexesIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_INDEXES));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_INDEXES);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useIndexIds = (
  indexesOrIndexesId?: Indexes | Id,
): {readonly current: Ids} =>
  useGet(ig(indexesOrIndexesId), INDEX + IDS, EMPTY_ARR);

export const useSliceIds = (
  indexId: Id,
  indexesOrIndexesId?: Indexes | Id,
): {readonly current: Ids} =>
  useGet(ig(indexesOrIndexesId), SLICE + IDS, EMPTY_ARR, [indexId]);

export const useSliceRowIds = (
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: Indexes | Id,
): {readonly current: Ids} =>
  useGet(ig(indexesOrIndexesId), SLICE + ROW_IDS, EMPTY_ARR, [
    indexId,
    sliceId,
  ]);

export const useQueries = (id?: Id): Queries | undefined =>
  resolveByOffset(id, OFFSET_QUERIES) as Queries | undefined;

export const useQueriesIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_QUERIES));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_QUERIES);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useQueryIds = (
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), QUERY + IDS, EMPTY_ARR);

export const useResultTable = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Table} =>
  useGet(qg(queriesOrQueriesId), RESULT + TABLE, EMPTY_OBJ as Table, [queryId]);

export const useResultTableCellIds = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + TABLE + CELL_IDS, EMPTY_ARR, [
    queryId,
  ]);

export const useResultRowCount = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: number} =>
  useGet(qg(queriesOrQueriesId), RESULT + ROW_COUNT, 0, [queryId]);

export const useResultRowIds = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + ROW_IDS, EMPTY_ARR, [queryId]);

export const useResultSortedRowIds = (
  queryId: Id,
  cellId?: Id,
  descending = false,
  offset = 0,
  limit?: number,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + SORTED_ROW_IDS, EMPTY_ARR, [
    queryId,
    cellId,
    descending,
    offset,
    limit,
  ]);

export const useResultRow = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Row} =>
  useGet(qg(queriesOrQueriesId), RESULT + ROW, EMPTY_OBJ as Row, [
    queryId,
    rowId,
  ]);

export const useResultCellIds = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + CELL_IDS, EMPTY_ARR, [
    queryId,
    rowId,
  ]);

export const useResultCell = (
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Cell | undefined} =>
  useGet(qg(queriesOrQueriesId), RESULT + CELL, undefined, [
    queryId,
    rowId,
    cellId,
  ]);

export const useRelationships = (id?: Id): Relationships | undefined =>
  resolveByOffset(id, OFFSET_RELATIONSHIPS) as Relationships | undefined;

export const useRelationshipsIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_RELATIONSHIPS));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_RELATIONSHIPS);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useRelationshipIds = (
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Ids} =>
  useGet(rg(relationshipsOrRelationshipsId), RELATIONSHIP + IDS, EMPTY_ARR);

export const useRemoteRowId = (
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Id | undefined} =>
  useGet(rg(relationshipsOrRelationshipsId), REMOTE_ROW_ID, undefined, [
    relationshipId,
    localRowId,
  ]);

export const useLocalRowIds = (
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Ids} =>
  useGet(rg(relationshipsOrRelationshipsId), LOCAL + ROW_IDS, EMPTY_ARR, [
    relationshipId,
    remoteRowId,
  ]);

export const useLinkedRowIds = (
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Ids} =>
  useGet(rg(relationshipsOrRelationshipsId), LINKED + ROW_IDS, EMPTY_ARR, [
    relationshipId,
    firstRowId,
  ]);

export const useCheckpoints = (id?: Id): Checkpoints | undefined =>
  resolveByOffset(id, OFFSET_CHECKPOINTS) as Checkpoints | undefined;

export const useCheckpointsIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_CHECKPOINTS));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_CHECKPOINTS);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useCheckpointIds = (
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): {readonly current: CheckpointIds} =>
  useGet(
    cg(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    DEFAULT_CHECKPOINT_IDS,
  );

export const useCheckpoint = (
  checkpointId: Id,
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): {readonly current: string | undefined} =>
  useGet(cg(checkpointsOrCheckpointsId), CHECKPOINT, undefined, [checkpointId]);

export const useGoBackwardCallback = (
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): (() => void) => {
  const getC = cg(checkpointsOrCheckpointsId);
  return () => getC()?.goBackward();
};

export const useGoForwardCallback = (
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): (() => void) => {
  const getC = cg(checkpointsOrCheckpointsId);
  return () => getC()?.goForward();
};

export const usePersister = (id?: Id): AnyPersister | undefined =>
  resolveByOffset(id, OFFSET_PERSISTER) as AnyPersister | undefined;

export const usePersisterIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_PERSISTER));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_PERSISTER);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const usePersisterStatus = (
  persisterOrPersisterId?: AnyPersister | Id,
): {readonly current: Status} =>
  useGet(pg(persisterOrPersisterId), STATUS, 0 as Status);

export const useSynchronizer = (id?: Id): Synchronizer | undefined =>
  resolveByOffset(id, OFFSET_SYNCHRONIZER) as Synchronizer | undefined;

export const useSynchronizerIds = (): {readonly current: Ids} => {
  const ctx = getCtx();
  let ids = $state<Ids>(getThingIds(ctx, OFFSET_SYNCHRONIZER));
  $effect(() => {
    ids = getThingIds(ctx, OFFSET_SYNCHRONIZER);
  });
  return {
    get current() {
      return ids;
    },
  };
};

export const useSynchronizerStatus = (
  synchronizerOrSynchronizerId?: Synchronizer | Id,
): {readonly current: Status} =>
  useGet(syg(synchronizerOrSynchronizerId), STATUS, 0 as Status);

const injectThing = (offset: number, id: Id, thing: any): void => {
  const ctx = getCtx();
  $effect(() => {
    ctx[16]?.(offset, id, thing);
    return () => ctx[17]?.(offset, id);
  });
};

export const provideStore = (storeId: Id, store: Store): void =>
  injectThing(OFFSET_STORE, storeId, store);

export const provideMetrics = (metricsId: Id, metrics: Metrics): void =>
  injectThing(OFFSET_METRICS, metricsId, metrics);

export const provideIndexes = (indexesId: Id, indexes: Indexes): void =>
  injectThing(OFFSET_INDEXES, indexesId, indexes);

export const provideRelationships = (
  relationshipsId: Id,
  relationships: Relationships,
): void => injectThing(OFFSET_RELATIONSHIPS, relationshipsId, relationships);

export const provideQueries = (queriesId: Id, queries: Queries): void =>
  injectThing(OFFSET_QUERIES, queriesId, queries);

export const provideCheckpoints = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => injectThing(OFFSET_CHECKPOINTS, checkpointsId, checkpoints);

export const providePersister = (
  persisterId: Id,
  persister: AnyPersister,
): void => injectThing(OFFSET_PERSISTER, persisterId, persister);

export const provideSynchronizer = (
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void => injectThing(OFFSET_SYNCHRONIZER, synchronizerId, synchronizer);
