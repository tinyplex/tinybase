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

const resolveByOffset = <T>(
  thingOrId: T | Id | undefined,
  offset: number,
): T | undefined => {
  if (isUndefined(thingOrId) || isString(thingOrId)) {
    const ctx = getCtx();
    return isUndefined(thingOrId)
      ? (ctx[offset * 2] as T | undefined)
      : (objGet(ctx[offset * 2 + 1] as IdObj<T>, thingOrId as Id) as
          | T
          | undefined);
  }
  return thingOrId as T;
};

const getThingIds = (offset: number): Ids =>
  objIds((getCtx()[offset * 2 + 1] ?? EMPTY_OBJ) as IdObj<unknown>);

const getStore = (s?: Store | Id): Store | undefined =>
  resolveByOffset(s, OFFSET_STORE);

const getMetrics = (m?: Metrics | Id): Metrics | undefined =>
  resolveByOffset(m, OFFSET_METRICS);

const getIndexes = (i?: Indexes | Id): Indexes | undefined =>
  resolveByOffset(i, OFFSET_INDEXES);

const getRelationships = (r?: Relationships | Id): Relationships | undefined =>
  resolveByOffset(r, OFFSET_RELATIONSHIPS);

const getQueries = (q?: Queries | Id): Queries | undefined =>
  resolveByOffset(q, OFFSET_QUERIES);

const getCheckpoints = (c?: Checkpoints | Id): Checkpoints | undefined =>
  resolveByOffset(c, OFFSET_CHECKPOINTS);

const getPersister = (p?: AnyPersister | Id): AnyPersister | undefined =>
  resolveByOffset(p, OFFSET_PERSISTER);

const getSynchronizer = (sy?: Synchronizer | Id): Synchronizer | undefined =>
  resolveByOffset(sy, OFFSET_SYNCHRONIZER);

const useListenable = <T>(
  thing: any,
  getMethod: string,
  addMethod: string,
  defaultValue: T,
  args: readonly any[],
): {readonly current: T} => {
  let value = $state<T>((thing?.[getMethod]?.(...args) ?? defaultValue) as T);
  $effect(() => {
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
  thing: any,
  listenable: string,
  defaultValue: T,
  args: readonly any[] = EMPTY_ARR,
): {readonly current: T} =>
  useListenable(
    thing,
    GET + listenable,
    ADD + listenable + LISTENER,
    defaultValue,
    args,
  );

const useHas = (
  thing: any,
  listenable: string,
  args: readonly any[] = EMPTY_ARR,
): {readonly current: boolean} =>
  useListenable(
    thing,
    _HAS + listenable,
    ADD + HAS + listenable + LISTENER,
    false,
    args,
  );

export const useHasTables = (
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(getStore(storeOrStoreId), TABLES);

export const useTables = (
  storeOrStoreId?: Store | Id,
): {readonly current: Tables} =>
  useGet(getStore(storeOrStoreId), TABLES, EMPTY_OBJ as Tables);

export const useTableIds = (
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(getStore(storeOrStoreId), TABLE_IDS, EMPTY_ARR);

export const useHasTable = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(getStore(storeOrStoreId), TABLE, [tableId]);

export const useTable = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Table} =>
  useGet(getStore(storeOrStoreId), TABLE, EMPTY_OBJ as Table, [tableId]);

export const useTableCellIds = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(getStore(storeOrStoreId), TABLE + CELL_IDS, EMPTY_ARR, [tableId]);

export const useHasTableCell = (
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(getStore(storeOrStoreId), TABLE + CELL, [tableId, cellId]);

export const useRowCount = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: number} =>
  useGet(getStore(storeOrStoreId), ROW_COUNT, 0, [tableId]);

export const useRowIds = (
  tableId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(getStore(storeOrStoreId), ROW_IDS, EMPTY_ARR, [tableId]);

export const useSortedRowIds = (
  tableId: Id,
  cellId?: Id,
  descending = false,
  offset = 0,
  limit?: number,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(getStore(storeOrStoreId), SORTED_ROW_IDS, EMPTY_ARR, [
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
  useHas(getStore(storeOrStoreId), ROW, [tableId, rowId]);

export const useRow = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Row} =>
  useGet(getStore(storeOrStoreId), ROW, EMPTY_OBJ as Row, [tableId, rowId]);

export const useCellIds = (
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(getStore(storeOrStoreId), CELL_IDS, EMPTY_ARR, [tableId, rowId]);

export const useHasCell = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(getStore(storeOrStoreId), CELL, [tableId, rowId, cellId]);

export const useCell = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: CellOrUndefined} =>
  useGet(getStore(storeOrStoreId), CELL, undefined, [tableId, rowId, cellId]);

export const useCellState = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: Store | Id,
): {get current(): CellOrUndefined; set current(v: Cell)} => {
  const store = getStore(storeOrStoreId);
  const s: any = store;
  let value = $state<CellOrUndefined>(s?.getCell(tableId, rowId, cellId));
  $effect(() => {
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
      s?.setCell(tableId, rowId, cellId, v);
    },
  };
};

export const useHasValues = (
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(getStore(storeOrStoreId), VALUES);

export const useValues = (
  storeOrStoreId?: Store | Id,
): {readonly current: Values} =>
  useGet(getStore(storeOrStoreId), VALUES, EMPTY_OBJ as Values);

export const useValueIds = (
  storeOrStoreId?: Store | Id,
): {readonly current: Ids} =>
  useGet(getStore(storeOrStoreId), VALUE_IDS, EMPTY_ARR);

export const useHasValue = (
  valueId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} =>
  useHas(getStore(storeOrStoreId), VALUE, [valueId]);

export const useValue = (
  valueId: Id,
  storeOrStoreId?: Store | Id,
): {readonly current: ValueOrUndefined} =>
  useGet(getStore(storeOrStoreId), VALUE, undefined, [valueId]);

export const useValueState = (
  valueId: Id,
  storeOrStoreId?: Store | Id,
): {get current(): ValueOrUndefined; set current(v: Value)} => {
  const store = getStore(storeOrStoreId);
  const s: any = store;
  let value = $state<ValueOrUndefined>(s?.getValue(valueId));
  $effect(() => {
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
      s?.setValue(valueId, v);
    },
  };
};

export const useStore = (id?: Id): Store | undefined =>
  resolveByOffset(id, OFFSET_STORE) as Store | undefined;

export const useStoreIds = (): Ids => getThingIds(OFFSET_STORE);

export const useMetrics = (id?: Id): Metrics | undefined =>
  resolveByOffset(id, OFFSET_METRICS) as Metrics | undefined;

export const useMetricsIds = (): Ids => getThingIds(OFFSET_METRICS);

export const useMetricIds = (
  metricsOrMetricsId?: Metrics | Id,
): {readonly current: Ids} =>
  useGet(getMetrics(metricsOrMetricsId), METRIC + IDS, EMPTY_ARR);

export const useMetric = (
  metricId: Id,
  metricsOrMetricsId?: Metrics | Id,
): {readonly current: number | undefined} =>
  useGet(getMetrics(metricsOrMetricsId), METRIC, undefined, [metricId]);

export const useIndexes = (id?: Id): Indexes | undefined =>
  resolveByOffset(id, OFFSET_INDEXES) as Indexes | undefined;

export const useIndexesIds = (): Ids => getThingIds(OFFSET_INDEXES);

export const useIndexIds = (
  indexesOrIndexesId?: Indexes | Id,
): {readonly current: Ids} =>
  useGet(getIndexes(indexesOrIndexesId), INDEX + IDS, EMPTY_ARR);

export const useSliceIds = (
  indexId: Id,
  indexesOrIndexesId?: Indexes | Id,
): {readonly current: Ids} =>
  useGet(getIndexes(indexesOrIndexesId), SLICE + IDS, EMPTY_ARR, [indexId]);

export const useSliceRowIds = (
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: Indexes | Id,
): {readonly current: Ids} =>
  useGet(getIndexes(indexesOrIndexesId), SLICE + ROW_IDS, EMPTY_ARR, [
    indexId,
    sliceId,
  ]);

export const useQueries = (id?: Id): Queries | undefined =>
  resolveByOffset(id, OFFSET_QUERIES) as Queries | undefined;

export const useQueriesIds = (): Ids => getThingIds(OFFSET_QUERIES);

export const useQueryIds = (
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(getQueries(queriesOrQueriesId), QUERY + IDS, EMPTY_ARR);

export const useResultTable = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Table} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + TABLE, EMPTY_OBJ as Table, [
    queryId,
  ]);

export const useResultTableCellIds = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + TABLE + CELL_IDS, EMPTY_ARR, [
    queryId,
  ]);

export const useResultRowCount = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: number} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + ROW_COUNT, 0, [queryId]);

export const useResultRowIds = (
  queryId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + ROW_IDS, EMPTY_ARR, [
    queryId,
  ]);

export const useResultSortedRowIds = (
  queryId: Id,
  cellId?: Id,
  descending = false,
  offset = 0,
  limit?: number,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + SORTED_ROW_IDS, EMPTY_ARR, [
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
  useGet(getQueries(queriesOrQueriesId), RESULT + ROW, EMPTY_OBJ as Row, [
    queryId,
    rowId,
  ]);

export const useResultCellIds = (
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Ids} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + CELL_IDS, EMPTY_ARR, [
    queryId,
    rowId,
  ]);

export const useResultCell = (
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: Queries | Id,
): {readonly current: Cell | undefined} =>
  useGet(getQueries(queriesOrQueriesId), RESULT + CELL, undefined, [
    queryId,
    rowId,
    cellId,
  ]);

export const useRelationships = (id?: Id): Relationships | undefined =>
  resolveByOffset(id, OFFSET_RELATIONSHIPS) as Relationships | undefined;

export const useRelationshipsIds = (): Ids => getThingIds(OFFSET_RELATIONSHIPS);

export const useRelationshipIds = (
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Ids} =>
  useGet(
    getRelationships(relationshipsOrRelationshipsId),
    RELATIONSHIP + IDS,
    EMPTY_ARR,
  );

export const useRemoteRowId = (
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Id | undefined} =>
  useGet(
    getRelationships(relationshipsOrRelationshipsId),
    REMOTE_ROW_ID,
    undefined,
    [relationshipId, localRowId],
  );

export const useLocalRowIds = (
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Ids} =>
  useGet(
    getRelationships(relationshipsOrRelationshipsId),
    LOCAL + ROW_IDS,
    EMPTY_ARR,
    [relationshipId, remoteRowId],
  );

export const useLinkedRowIds = (
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: Relationships | Id,
): {readonly current: Ids} =>
  useGet(
    getRelationships(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    EMPTY_ARR,
    [relationshipId, firstRowId],
  );

export const useCheckpoints = (id?: Id): Checkpoints | undefined =>
  resolveByOffset(id, OFFSET_CHECKPOINTS) as Checkpoints | undefined;

export const useCheckpointsIds = (): Ids => getThingIds(OFFSET_CHECKPOINTS);

export const useCheckpointIds = (
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): {readonly current: CheckpointIds} =>
  useGet(
    getCheckpoints(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    DEFAULT_CHECKPOINT_IDS,
  );

export const useCheckpoint = (
  checkpointId: Id,
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): {readonly current: string | undefined} =>
  useGet(getCheckpoints(checkpointsOrCheckpointsId), CHECKPOINT, undefined, [
    checkpointId,
  ]);

export const useGoBackwardCallback = (
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): (() => void) => {
  const checkpoints = getCheckpoints(checkpointsOrCheckpointsId);
  return () => checkpoints?.goBackward();
};

export const useGoForwardCallback = (
  checkpointsOrCheckpointsId?: Checkpoints | Id,
): (() => void) => {
  const checkpoints = getCheckpoints(checkpointsOrCheckpointsId);
  return () => checkpoints?.goForward();
};

export const usePersister = (id?: Id): AnyPersister | undefined =>
  resolveByOffset(id, OFFSET_PERSISTER) as AnyPersister | undefined;

export const usePersisterIds = (): Ids => getThingIds(OFFSET_PERSISTER);

export const usePersisterStatus = (
  persisterOrPersisterId?: AnyPersister | Id,
): {readonly current: Status} =>
  useGet(getPersister(persisterOrPersisterId), STATUS, 0 as Status);

export const useSynchronizer = (id?: Id): Synchronizer | undefined =>
  resolveByOffset(id, OFFSET_SYNCHRONIZER) as Synchronizer | undefined;

export const useSynchronizerIds = (): Ids => getThingIds(OFFSET_SYNCHRONIZER);

export const useSynchronizerStatus = (
  synchronizerOrSynchronizerId?: Synchronizer | Id,
): {readonly current: Status} =>
  useGet(getSynchronizer(synchronizerOrSynchronizerId), STATUS, 0 as Status);
