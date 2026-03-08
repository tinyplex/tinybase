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

type R<T> = T | (() => T);
const rv = <T>(v: R<T>): T => (typeof v === 'function' ? (v as () => T)() : v);

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
  thingOrId?: T | Id | (() => T | Id | undefined),
): (() => T | undefined) => {
  const ctx = getCtx();
  return () =>
    resolveWithCtx<T>(
      ctx,
      (typeof thingOrId === 'function'
        ? (thingOrId as () => T | Id | undefined)()
        : thingOrId) as T | Id | undefined,
      offset,
    );
};

const getThingIds = (ctx: ContextValue, offset: number): Ids =>
  objIds((ctx[offset * 2 + 1] ?? EMPTY_OBJ) as IdObj<unknown>);

const sg = (s?: R<Store | Id | undefined>): (() => Store | undefined) =>
  mkGetter<Store>(OFFSET_STORE, s as any);

const mg = (m?: R<Metrics | Id | undefined>): (() => Metrics | undefined) =>
  mkGetter<Metrics>(OFFSET_METRICS, m as any);

const ig = (i?: R<Indexes | Id | undefined>): (() => Indexes | undefined) =>
  mkGetter<Indexes>(OFFSET_INDEXES, i as any);

const rg = (
  r?: R<Relationships | Id | undefined>,
): (() => Relationships | undefined) =>
  mkGetter<Relationships>(OFFSET_RELATIONSHIPS, r as any);

const qg = (q?: R<Queries | Id | undefined>): (() => Queries | undefined) =>
  mkGetter<Queries>(OFFSET_QUERIES, q as any);

const cg = (
  c?: R<Checkpoints | Id | undefined>,
): (() => Checkpoints | undefined) =>
  mkGetter<Checkpoints>(OFFSET_CHECKPOINTS, c as any);

const pg = (
  p?: R<AnyPersister | Id | undefined>,
): (() => AnyPersister | undefined) =>
  mkGetter<AnyPersister>(OFFSET_PERSISTER, p as any);

const syg = (
  sy?: R<Synchronizer | Id | undefined>,
): (() => Synchronizer | undefined) =>
  mkGetter<Synchronizer>(OFFSET_SYNCHRONIZER, sy as any);

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
  $effect(() => {
    const thing = getThing();
    const args = getArgs();
    value = (thing?.[getMethod]?.(...args) ?? defaultValue) as T;
    const listenerId = thing?.[addMethod]?.(...args, () => {
      value = (thing[getMethod](...getArgs()) ?? defaultValue) as T;
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
  storeOrStoreId?: Store | Id,
): {readonly current: boolean} => useHas(sg(storeOrStoreId), TABLES);

export const useTables = (
  storeOrStoreId?: Store | Id,
): {readonly current: Tables} =>
  useGet(sg(storeOrStoreId), TABLES, EMPTY_OBJ as Tables);

export const useTableIds = (
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids} => useGet(sg(storeOrStoreId), TABLE_IDS, EMPTY_ARR);

export const useHasTable = (
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), TABLE, () => [rv(tableId)]);

export const useTable = (
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Table} =>
  useGet(sg(storeOrStoreId), TABLE, EMPTY_OBJ as Table, () => [rv(tableId)]);

export const useTableCellIds = (
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), TABLE + CELL_IDS, EMPTY_ARR, () => [rv(tableId)]);

export const useHasTableCell = (
  tableId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), TABLE + CELL, () => [rv(tableId), rv(cellId)]);

export const useRowCount = (
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: number} =>
  useGet(sg(storeOrStoreId), ROW_COUNT, 0, () => [rv(tableId)]);

export const useRowIds = (
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), ROW_IDS, EMPTY_ARR, () => [rv(tableId)]);

export const useSortedRowIds = (
  tableId: R<Id>,
  cellId?: R<Id | undefined>,
  descending: R<boolean> = false,
  offset: R<number> = 0,
  limit?: R<number | undefined>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), SORTED_ROW_IDS, EMPTY_ARR, () => [
    rv(tableId),
    rv(cellId),
    rv(descending),
    rv(offset),
    rv(limit),
  ]);

export const useHasRow = (
  tableId: R<Id>,
  rowId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), ROW, () => [rv(tableId), rv(rowId)]);

export const useRow = (
  tableId: R<Id>,
  rowId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Row} =>
  useGet(sg(storeOrStoreId), ROW, EMPTY_OBJ as Row, () => [
    rv(tableId),
    rv(rowId),
  ]);

export const useCellIds = (
  tableId: R<Id>,
  rowId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids} =>
  useGet(sg(storeOrStoreId), CELL_IDS, EMPTY_ARR, () => [
    rv(tableId),
    rv(rowId),
  ]);

export const useHasCell = (
  tableId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), CELL, () => [rv(tableId), rv(rowId), rv(cellId)]);

export const useCell = (
  tableId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: CellOrUndefined} =>
  useGet(sg(storeOrStoreId), CELL, undefined, () => [
    rv(tableId),
    rv(rowId),
    rv(cellId),
  ]);

export const useCellState = (
  tableId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)} => {
  const getS = sg(storeOrStoreId);
  let value = $state<CellOrUndefined>(
    getS()?.getCell(rv(tableId), rv(rowId), rv(cellId)),
  );
  $effect(() => {
    const s: any = getS();
    const t = rv(tableId),
      r = rv(rowId),
      c = rv(cellId);
    value = s?.getCell(t, r, c);
    const listenerId = s?.addCellListener(t, r, c, (st: any) => {
      value = st.getCell(rv(tableId), rv(rowId), rv(cellId));
    });
    return () => s?.delListener?.(listenerId);
  });
  return {
    get current(): CellOrUndefined {
      return value;
    },
    set current(v: Cell) {
      getS()?.setCell(rv(tableId), rv(rowId), rv(cellId), v);
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
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids} => useGet(sg(storeOrStoreId), VALUE_IDS, EMPTY_ARR);

export const useHasValue = (
  valueId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean} =>
  useHas(sg(storeOrStoreId), VALUE, () => [rv(valueId)]);

export const useValue = (
  valueId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: ValueOrUndefined} =>
  useGet(sg(storeOrStoreId), VALUE, undefined, () => [rv(valueId)]);

export const useValueState = (
  valueId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)} => {
  const getS = sg(storeOrStoreId);
  let value = $state<ValueOrUndefined>(getS()?.getValue(rv(valueId)));
  $effect(() => {
    const s: any = getS();
    const vid = rv(valueId);
    value = s?.getValue(vid);
    const listenerId = s?.addValueListener(vid, (st: any) => {
      value = st.getValue(rv(valueId));
    });
    return () => s?.delListener?.(listenerId);
  });
  return {
    get current(): ValueOrUndefined {
      return value;
    },
    set current(v: Value) {
      getS()?.setValue(rv(valueId), v);
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
  metricId: R<Id>,
  metricsOrMetricsId?: R<Metrics | Id | undefined>,
): {readonly current: number | undefined} =>
  useGet(mg(metricsOrMetricsId), METRIC, undefined, () => [rv(metricId)]);

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
  indexId: R<Id>,
  indexesOrIndexesId?: R<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useGet(ig(indexesOrIndexesId), SLICE + IDS, EMPTY_ARR, () => [rv(indexId)]);

export const useSliceRowIds = (
  indexId: R<Id>,
  sliceId: R<Id>,
  indexesOrIndexesId?: R<Indexes | Id | undefined>,
): {readonly current: Ids} =>
  useGet(ig(indexesOrIndexesId), SLICE + ROW_IDS, EMPTY_ARR, () => [
    rv(indexId),
    rv(sliceId),
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
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Table} =>
  useGet(qg(queriesOrQueriesId), RESULT + TABLE, EMPTY_OBJ as Table, () => [
    rv(queryId),
  ]);

export const useResultTableCellIds = (
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + TABLE + CELL_IDS, EMPTY_ARR, () => [
    rv(queryId),
  ]);

export const useResultRowCount = (
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: number} =>
  useGet(qg(queriesOrQueriesId), RESULT + ROW_COUNT, 0, () => [rv(queryId)]);

export const useResultRowIds = (
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + ROW_IDS, EMPTY_ARR, () => [
    rv(queryId),
  ]);

export const useResultSortedRowIds = (
  queryId: R<Id>,
  cellId?: R<Id | undefined>,
  descending: R<boolean> = false,
  offset: R<number> = 0,
  limit?: R<number | undefined>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + SORTED_ROW_IDS, EMPTY_ARR, () => [
    rv(queryId),
    rv(cellId),
    rv(descending),
    rv(offset),
    rv(limit),
  ]);

export const useResultRow = (
  queryId: R<Id>,
  rowId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Row} =>
  useGet(qg(queriesOrQueriesId), RESULT + ROW, EMPTY_OBJ as Row, () => [
    rv(queryId),
    rv(rowId),
  ]);

export const useResultCellIds = (
  queryId: R<Id>,
  rowId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids} =>
  useGet(qg(queriesOrQueriesId), RESULT + CELL_IDS, EMPTY_ARR, () => [
    rv(queryId),
    rv(rowId),
  ]);

export const useResultCell = (
  queryId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Cell | undefined} =>
  useGet(qg(queriesOrQueriesId), RESULT + CELL, undefined, () => [
    rv(queryId),
    rv(rowId),
    rv(cellId),
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
  relationshipId: R<Id>,
  localRowId: R<Id>,
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Id | undefined} =>
  useGet(rg(relationshipsOrRelationshipsId), REMOTE_ROW_ID, undefined, () => [
    rv(relationshipId),
    rv(localRowId),
  ]);

export const useLocalRowIds = (
  relationshipId: R<Id>,
  remoteRowId: R<Id>,
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useGet(rg(relationshipsOrRelationshipsId), LOCAL + ROW_IDS, EMPTY_ARR, () => [
    rv(relationshipId),
    rv(remoteRowId),
  ]);

export const useLinkedRowIds = (
  relationshipId: R<Id>,
  firstRowId: R<Id>,
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Ids} =>
  useGet(
    rg(relationshipsOrRelationshipsId),
    LINKED + ROW_IDS,
    EMPTY_ARR,
    () => [rv(relationshipId), rv(firstRowId)],
  );

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
  checkpointsOrCheckpointsId?: R<Checkpoints | Id | undefined>,
): {readonly current: CheckpointIds} =>
  useGet(
    cg(checkpointsOrCheckpointsId),
    CHECKPOINT + IDS,
    DEFAULT_CHECKPOINT_IDS,
  );

export const useCheckpoint = (
  checkpointId: R<Id>,
  checkpointsOrCheckpointsId?: R<Checkpoints | Id | undefined>,
): {readonly current: string | undefined} =>
  useGet(cg(checkpointsOrCheckpointsId), CHECKPOINT, undefined, () => [
    rv(checkpointId),
  ]);

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
