/// ui-svelte
import type {Component, Snippet} from 'svelte';
import type {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../checkpoints/index.d.ts';
import type {Id, IdOrNull, Ids} from '../common/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../indexes/index.d.ts';
import type {MetricListener, Metrics} from '../metrics/index.d.ts';
import type {
  AnyPersister,
  Status,
  StatusListener,
} from '../persisters/index.d.ts';
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
} from '../queries/index.d.ts';
import type {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../relationships/index.d.ts';
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
} from '../store/index.d.ts';
import type {Synchronizer} from '../synchronizers/index.d.ts';

/// ui-svelte.MaybeGetter
export type MaybeGetter<T> = T | (() => T);

/// ui-svelte.StoreOrStoreId
export type StoreOrStoreId = Store | Id;

/// ui-svelte.MetricsOrMetricsId
export type MetricsOrMetricsId = Metrics | Id;

/// ui-svelte.IndexesOrIndexesId
export type IndexesOrIndexesId = Indexes | Id;

/// ui-svelte.RelationshipsOrRelationshipsId
export type RelationshipsOrRelationshipsId = Relationships | Id;

/// ui-svelte.QueriesOrQueriesId
export type QueriesOrQueriesId = Queries | Id;

/// ui-svelte.CheckpointsOrCheckpointsId
export type CheckpointsOrCheckpointsId = Checkpoints | Id;

/// ui-svelte.PersisterOrPersisterId
export type PersisterOrPersisterId = AnyPersister | Id;

/// ui-svelte.SynchronizerOrSynchronizerId
export type SynchronizerOrSynchronizerId = Synchronizer | Id;

/// ui-svelte.ProviderProps
export type ProviderProps = {
  /// ui-svelte.ProviderProps.store
  readonly store?: Store;
  /// ui-svelte.ProviderProps.storesById
  readonly storesById?: {readonly [id: Id]: Store};
  /// ui-svelte.ProviderProps.metrics
  readonly metrics?: Metrics;
  /// ui-svelte.ProviderProps.metricsById
  readonly metricsById?: {readonly [id: Id]: Metrics};
  /// ui-svelte.ProviderProps.indexes
  readonly indexes?: Indexes;
  /// ui-svelte.ProviderProps.indexesById
  readonly indexesById?: {readonly [id: Id]: Indexes};
  /// ui-svelte.ProviderProps.relationships
  readonly relationships?: Relationships;
  /// ui-svelte.ProviderProps.relationshipsById
  readonly relationshipsById?: {readonly [id: Id]: Relationships};
  /// ui-svelte.ProviderProps.queries
  readonly queries?: Queries;
  /// ui-svelte.ProviderProps.queriesById
  readonly queriesById?: {readonly [id: Id]: Queries};
  /// ui-svelte.ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints;
  /// ui-svelte.ProviderProps.checkpointsById
  readonly checkpointsById?: {readonly [id: Id]: Checkpoints};
  /// ui-svelte.ProviderProps.persister
  readonly persister?: AnyPersister;
  /// ui-svelte.ProviderProps.persistersById
  readonly persistersById?: {readonly [id: Id]: AnyPersister};
  /// ui-svelte.ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer;
  /// ui-svelte.ProviderProps.synchronizersById
  readonly synchronizersById?: {readonly [id: Id]: Synchronizer};
  /// ui-svelte.ProviderProps.children
  readonly children: Snippet;
};

/// ui-svelte.CellViewProps
export type CellViewProps = {
  /// ui-svelte.CellViewProps.tableId
  readonly tableId: Id;
  /// ui-svelte.CellViewProps.rowId
  readonly rowId: Id;
  /// ui-svelte.CellViewProps.cellId
  readonly cellId: Id;
  /// ui-svelte.CellViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.CellViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.ValueViewProps
export type ValueViewProps = {
  /// ui-svelte.ValueViewProps.valueId
  readonly valueId: Id;
  /// ui-svelte.ValueViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.ValueViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.MetricViewProps
export type MetricViewProps = {
  /// ui-svelte.MetricViewProps.metricId
  readonly metricId: Id;
  /// ui-svelte.MetricViewProps.metrics
  readonly metrics?: MetricsOrMetricsId;
  /// ui-svelte.MetricViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.CheckpointViewProps
export type CheckpointViewProps = {
  /// ui-svelte.CheckpointViewProps.checkpointId
  readonly checkpointId: Id;
  /// ui-svelte.CheckpointViewProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-svelte.CheckpointViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.RowViewProps
export type RowViewProps = {
  /// ui-svelte.RowViewProps.tableId
  readonly tableId: Id;
  /// ui-svelte.RowViewProps.rowId
  readonly rowId: Id;
  /// ui-svelte.RowViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.RowViewProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-svelte.RowViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.RowViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.RowViewProps.cell
  readonly cell?: Snippet<[cellId: Id]>;
};

/// ui-svelte.TableViewProps
export type TableViewProps = {
  /// ui-svelte.TableViewProps.tableId
  readonly tableId: Id;
  /// ui-svelte.TableViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.TableViewProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-svelte.TableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.TableViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.TableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.SortedTableViewProps
export type SortedTableViewProps = {
  /// ui-svelte.SortedTableViewProps.tableId
  readonly tableId: Id;
  /// ui-svelte.SortedTableViewProps.cellId
  readonly cellId?: Id;
  /// ui-svelte.SortedTableViewProps.descending
  readonly descending?: boolean;
  /// ui-svelte.SortedTableViewProps.offset
  readonly offset?: number;
  /// ui-svelte.SortedTableViewProps.limit
  readonly limit?: number;
  /// ui-svelte.SortedTableViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.SortedTableViewProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-svelte.SortedTableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.SortedTableViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.SortedTableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.TablesViewProps
export type TablesViewProps = {
  /// ui-svelte.TablesViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.TablesViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.TablesViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.TablesViewProps.table
  readonly table?: Snippet<[tableId: Id]>;
};

/// ui-svelte.ValuesViewProps
export type ValuesViewProps = {
  /// ui-svelte.ValuesViewProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte.ValuesViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.ValuesViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.ValuesViewProps.value
  readonly value?: Snippet<[valueId: Id]>;
};

/// ui-svelte.IndexViewProps
export type IndexViewProps = {
  /// ui-svelte.IndexViewProps.indexId
  readonly indexId: Id;
  /// ui-svelte.IndexViewProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-svelte.IndexViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.IndexViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.IndexViewProps.slice
  readonly slice?: Snippet<[sliceId: Id]>;
};

/// ui-svelte.SliceViewProps
export type SliceViewProps = {
  /// ui-svelte.SliceViewProps.indexId
  readonly indexId: Id;
  /// ui-svelte.SliceViewProps.sliceId
  readonly sliceId: Id;
  /// ui-svelte.SliceViewProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-svelte.SliceViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.SliceViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.SliceViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.RemoteRowViewProps
export type RemoteRowViewProps = {
  /// ui-svelte.RemoteRowViewProps.relationshipId
  readonly relationshipId: Id;
  /// ui-svelte.RemoteRowViewProps.localRowId
  readonly localRowId: Id;
  /// ui-svelte.RemoteRowViewProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-svelte.RemoteRowViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.RemoteRowViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.LocalRowsViewProps
export type LocalRowsViewProps = {
  /// ui-svelte.LocalRowsViewProps.relationshipId
  readonly relationshipId: Id;
  /// ui-svelte.LocalRowsViewProps.remoteRowId
  readonly remoteRowId: Id;
  /// ui-svelte.LocalRowsViewProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-svelte.LocalRowsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.LocalRowsViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.LocalRowsViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.LinkedRowsViewProps
export type LinkedRowsViewProps = {
  /// ui-svelte.LinkedRowsViewProps.relationshipId
  readonly relationshipId: Id;
  /// ui-svelte.LinkedRowsViewProps.firstRowId
  readonly firstRowId: Id;
  /// ui-svelte.LinkedRowsViewProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-svelte.LinkedRowsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.LinkedRowsViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.LinkedRowsViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.ResultCellViewProps
export type ResultCellViewProps = {
  /// ui-svelte.ResultCellViewProps.queryId
  readonly queryId: Id;
  /// ui-svelte.ResultCellViewProps.rowId
  readonly rowId: Id;
  /// ui-svelte.ResultCellViewProps.cellId
  readonly cellId: Id;
  /// ui-svelte.ResultCellViewProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-svelte.ResultCellViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.ResultRowViewProps
export type ResultRowViewProps = {
  /// ui-svelte.ResultRowViewProps.queryId
  readonly queryId: Id;
  /// ui-svelte.ResultRowViewProps.rowId
  readonly rowId: Id;
  /// ui-svelte.ResultRowViewProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-svelte.ResultRowViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.ResultRowViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.ResultRowViewProps.cell
  readonly cell?: Snippet<[cellId: Id]>;
};

/// ui-svelte.ResultTableViewProps
export type ResultTableViewProps = {
  /// ui-svelte.ResultTableViewProps.queryId
  readonly queryId: Id;
  /// ui-svelte.ResultTableViewProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-svelte.ResultTableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.ResultTableViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.ResultTableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.ResultSortedTableViewProps
export type ResultSortedTableViewProps = {
  /// ui-svelte.ResultSortedTableViewProps.queryId
  readonly queryId: Id;
  /// ui-svelte.ResultSortedTableViewProps.cellId
  readonly cellId?: Id;
  /// ui-svelte.ResultSortedTableViewProps.descending
  readonly descending?: boolean;
  /// ui-svelte.ResultSortedTableViewProps.offset
  readonly offset?: number;
  /// ui-svelte.ResultSortedTableViewProps.limit
  readonly limit?: number;
  /// ui-svelte.ResultSortedTableViewProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-svelte.ResultSortedTableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.ResultSortedTableViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.ResultSortedTableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.BackwardCheckpointsViewProps
export type BackwardCheckpointsViewProps = {
  /// ui-svelte.BackwardCheckpointsViewProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-svelte.BackwardCheckpointsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.BackwardCheckpointsViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.BackwardCheckpointsViewProps.checkpoint
  readonly checkpoint?: Snippet<[checkpointId: Id]>;
};

/// ui-svelte.ForwardCheckpointsViewProps
export type ForwardCheckpointsViewProps = {
  /// ui-svelte.ForwardCheckpointsViewProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-svelte.ForwardCheckpointsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ui-svelte.ForwardCheckpointsViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.ForwardCheckpointsViewProps.checkpoint
  readonly checkpoint?: Snippet<[checkpointId: Id]>;
};

/// ui-svelte.CurrentCheckpointViewProps
export type CurrentCheckpointViewProps = {
  /// ui-svelte.CurrentCheckpointViewProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-svelte.CurrentCheckpointViewProps.debugIds
  readonly debugIds?: boolean;
  /// ui-svelte.CurrentCheckpointViewProps.checkpoint
  readonly checkpoint?: Snippet<[checkpointId: Id]>;
};

/// ui-svelte.Provider
export const Provider: Component<ProviderProps>;

/// ui-svelte.BackwardCheckpointsView
export const BackwardCheckpointsView: Component<BackwardCheckpointsViewProps>;

/// ui-svelte.CellView
export const CellView: Component<CellViewProps>;

/// ui-svelte.CheckpointView
export const CheckpointView: Component<CheckpointViewProps>;

/// ui-svelte.CurrentCheckpointView
export const CurrentCheckpointView: Component<CurrentCheckpointViewProps>;

/// ui-svelte.ForwardCheckpointsView
export const ForwardCheckpointsView: Component<ForwardCheckpointsViewProps>;

/// ui-svelte.IndexView
export const IndexView: Component<IndexViewProps>;

/// ui-svelte.LinkedRowsView
export const LinkedRowsView: Component<LinkedRowsViewProps>;

/// ui-svelte.LocalRowsView
export const LocalRowsView: Component<LocalRowsViewProps>;

/// ui-svelte.MetricView
export const MetricView: Component<MetricViewProps>;

/// ui-svelte.RemoteRowView
export const RemoteRowView: Component<RemoteRowViewProps>;

/// ui-svelte.ResultCellView
export const ResultCellView: Component<ResultCellViewProps>;

/// ui-svelte.ResultRowView
export const ResultRowView: Component<ResultRowViewProps>;

/// ui-svelte.ResultSortedTableView
export const ResultSortedTableView: Component<ResultSortedTableViewProps>;

/// ui-svelte.ResultTableView
export const ResultTableView: Component<ResultTableViewProps>;

/// ui-svelte.RowView
export const RowView: Component<RowViewProps>;

/// ui-svelte.SliceView
export const SliceView: Component<SliceViewProps>;

/// ui-svelte.SortedTableView
export const SortedTableView: Component<SortedTableViewProps>;

/// ui-svelte.TableView
export const TableView: Component<TableViewProps>;

/// ui-svelte.TablesView
export const TablesView: Component<TablesViewProps>;

/// ui-svelte.ValueView
export const ValueView: Component<ValueViewProps>;

/// ui-svelte.ValuesView
export const ValuesView: Component<ValuesViewProps>;

/// ui-svelte.hasTables
export function hasTables(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: boolean;
};

/// ui-svelte.getTables
export function getTables(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Tables;
};

/// ui-svelte.getTableIds
export function getTableIds(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.hasTable
export function hasTable(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.getTable
export function getTable(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Table};

/// ui-svelte.getTableCellIds
export function getTableCellIds(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.hasTableCell
export function hasTableCell(
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.getRowCount
export function getRowCount(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: number};

/// ui-svelte.getRowIds
export function getRowIds(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getSortedRowIds
export function getSortedRowIds(
  tableId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending?: MaybeGetter<boolean>,
  offset?: MaybeGetter<number>,
  limit?: MaybeGetter<number | undefined>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.hasRow
export function hasRow(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.getRow
export function getRow(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Row};

/// ui-svelte.getCellIds
export function getCellIds(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.hasCell
export function hasCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.getCell
export function getCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)};

/// ui-svelte.hasValues
export function hasValues(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: boolean;
};

/// ui-svelte.getValues
export function getValues(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Values;
};

/// ui-svelte.getValueIds
export function getValueIds(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.hasValue
export function hasValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.getValue
export function getValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)};

/// ui-svelte.getStore
export function getStore(id?: Id): Store | undefined;

/// ui-svelte.resolveStore
export function resolveStore(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): () => Store | undefined;

/// ui-svelte.getStoreIds
export function getStoreIds(): {readonly current: Ids};

/// ui-svelte.getMetrics
export function getMetrics(id?: Id): Metrics | undefined;

/// ui-svelte.resolveMetrics
export function resolveMetrics(
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): () => Metrics | undefined;

/// ui-svelte.getMetricsIds
export function getMetricsIds(): {readonly current: Ids};

/// ui-svelte.getMetricIds
export function getMetricIds(
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.getMetric
export function getMetric(
  metricId: MaybeGetter<Id>,
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): {readonly current: number | undefined};

/// ui-svelte.getIndexes
export function getIndexes(id?: Id): Indexes | undefined;

/// ui-svelte.resolveIndexes
export function resolveIndexes(
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): () => Indexes | undefined;

/// ui-svelte.getIndexStoreTableId
export function getIndexStoreTableId(
  indexesOrId: MaybeGetter<IndexesOrIndexesId | undefined>,
  indexId: MaybeGetter<Id>,
): {readonly store: Store | undefined; readonly tableId: Id | undefined};

/// ui-svelte.getIndexesIds
export function getIndexesIds(): {readonly current: Ids};

/// ui-svelte.getIndexIds
export function getIndexIds(
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.getSliceIds
export function getSliceIds(
  indexId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getSliceRowIds
export function getSliceRowIds(
  indexId: MaybeGetter<Id>,
  sliceId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getQueries
export function getQueries(id?: Id): Queries | undefined;

/// ui-svelte.resolveQueries
export function resolveQueries(
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): () => Queries | undefined;

/// ui-svelte.getQueriesIds
export function getQueriesIds(): {readonly current: Ids};

/// ui-svelte.getQueryIds
export function getQueryIds(
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.getResultTable
export function getResultTable(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Table};

/// ui-svelte.getResultTableCellIds
export function getResultTableCellIds(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getResultRowCount
export function getResultRowCount(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: number};

/// ui-svelte.getResultRowIds
export function getResultRowIds(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getResultSortedRowIds
export function getResultSortedRowIds(
  queryId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending?: MaybeGetter<boolean>,
  offset?: MaybeGetter<number>,
  limit?: MaybeGetter<number | undefined>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getResultRow
export function getResultRow(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Row};

/// ui-svelte.getResultCellIds
export function getResultCellIds(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.getResultCell
export function getResultCell(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.getRelationships
export function getRelationships(id?: Id): Relationships | undefined;

/// ui-svelte.resolveRelationships
export function resolveRelationships(
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): () => Relationships | undefined;

/// ui-svelte.getRelationshipsStoreTableIds
export function getRelationshipsStoreTableIds(
  relationshipsOrId: MaybeGetter<RelationshipsOrRelationshipsId | undefined>,
  relationshipId: MaybeGetter<Id>,
): {
  readonly store: Store | undefined;
  readonly localTableId: Id | undefined;
  readonly remoteTableId: Id | undefined;
};

/// ui-svelte.getRelationshipsIds
export function getRelationshipsIds(): {readonly current: Ids};

/// ui-svelte.getRelationshipIds
export function getRelationshipIds(
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Ids};

/// ui-svelte.getRemoteRowId
export function getRemoteRowId(
  relationshipId: MaybeGetter<Id>,
  localRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Id | undefined};

/// ui-svelte.getLocalRowIds
export function getLocalRowIds(
  relationshipId: MaybeGetter<Id>,
  remoteRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Ids};

/// ui-svelte.getLinkedRowIds
export function getLinkedRowIds(
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Ids};

/// ui-svelte.getCheckpoints
export function getCheckpoints(id?: Id): Checkpoints | undefined;

/// ui-svelte.resolveCheckpoints
export function resolveCheckpoints(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): () => Checkpoints | undefined;

/// ui-svelte.getCheckpointsIds
export function getCheckpointsIds(): {readonly current: Ids};

/// ui-svelte.getCheckpointIds
export function getCheckpointIds(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): {readonly current: CheckpointIds};

/// ui-svelte.getCheckpoint
export function getCheckpoint(
  checkpointId: MaybeGetter<Id>,
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): {readonly current: string | undefined};

/// ui-svelte.createGoBackwardCallback
export function createGoBackwardCallback(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): () => void;

/// ui-svelte.createGoForwardCallback
export function createGoForwardCallback(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): () => void;

/// ui-svelte.getPersister
export function getPersister(id?: Id): AnyPersister | undefined;

/// ui-svelte.resolvePersister
export function resolvePersister(
  persisterOrPersisterId?: MaybeGetter<PersisterOrPersisterId | undefined>,
): () => AnyPersister | undefined;

/// ui-svelte.getPersisterIds
export function getPersisterIds(): {readonly current: Ids};

/// ui-svelte.getPersisterStatus
export function getPersisterStatus(
  persisterOrPersisterId?: MaybeGetter<PersisterOrPersisterId | undefined>,
): {readonly current: Status};

/// ui-svelte.getSynchronizer
export function getSynchronizer(id?: Id): Synchronizer | undefined;

/// ui-svelte.resolveSynchronizer
export function resolveSynchronizer(
  synchronizerOrSynchronizerId?: MaybeGetter<
    SynchronizerOrSynchronizerId | undefined
  >,
): () => Synchronizer | undefined;

/// ui-svelte.getSynchronizerIds
export function getSynchronizerIds(): {readonly current: Ids};

/// ui-svelte.getSynchronizerStatus
export function getSynchronizerStatus(
  synchronizerOrSynchronizerId?: MaybeGetter<
    SynchronizerOrSynchronizerId | undefined
  >,
): {readonly current: Status};

/// ui-svelte.onHasTables
export function onHasTables(
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onTables
export function onTables(
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onTableIds
export function onTableIds(
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onHasTable
export function onHasTable(
  tableId: MaybeGetter<IdOrNull>,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onTable
export function onTable(
  tableId: MaybeGetter<IdOrNull>,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onTableCellIds
export function onTableCellIds(
  tableId: MaybeGetter<IdOrNull>,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onHasTableCell
export function onHasTableCell(
  tableId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onRowCount
export function onRowCount(
  tableId: MaybeGetter<IdOrNull>,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onRowIds
export function onRowIds(
  tableId: MaybeGetter<IdOrNull>,
  listener: RowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onSortedRowIds
export function onSortedRowIds(
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onHasRow
export function onHasRow(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onRow
export function onRow(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onCellIds
export function onCellIds(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onHasCell
export function onHasCell(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onCell
export function onCell(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onHasValues
export function onHasValues(
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onValues
export function onValues(
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onValueIds
export function onValueIds(
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onHasValue
export function onHasValue(
  valueId: MaybeGetter<IdOrNull>,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onValue
export function onValue(
  valueId: MaybeGetter<IdOrNull>,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onStartTransaction
export function onStartTransaction(
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onWillFinishTransaction
export function onWillFinishTransaction(
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onDidFinishTransaction
export function onDidFinishTransaction(
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.onMetric
export function onMetric(
  metricId: MaybeGetter<IdOrNull>,
  listener: MetricListener,
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): void;

/// ui-svelte.onSliceIds
export function onSliceIds(
  indexId: MaybeGetter<IdOrNull>,
  listener: SliceIdsListener,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): void;

/// ui-svelte.onSliceRowIds
export function onSliceRowIds(
  indexId: MaybeGetter<IdOrNull>,
  sliceId: MaybeGetter<IdOrNull>,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): void;

/// ui-svelte.onRemoteRowId
export function onRemoteRowId(
  relationshipId: MaybeGetter<IdOrNull>,
  localRowId: MaybeGetter<IdOrNull>,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-svelte.onLocalRowIds
export function onLocalRowIds(
  relationshipId: MaybeGetter<IdOrNull>,
  remoteRowId: MaybeGetter<IdOrNull>,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-svelte.onLinkedRowIds
export function onLinkedRowIds(
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-svelte.onResultTable
export function onResultTable(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultTableCellIds
export function onResultTableCellIds(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultRowCount
export function onResultRowCount(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultRowIds
export function onResultRowIds(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultSortedRowIds
export function onResultSortedRowIds(
  queryId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultRow
export function onResultRow(
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultRowListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultCellIds
export function onResultCellIds(
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onResultCell
export function onResultCell(
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: ResultCellListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onParamValues
export function onParamValues(
  queryId: MaybeGetter<IdOrNull>,
  listener: ParamValuesListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onParamValue
export function onParamValue(
  queryId: MaybeGetter<IdOrNull>,
  paramId: MaybeGetter<IdOrNull>,
  listener: ParamValueListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.onCheckpointIds
export function onCheckpointIds(
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): void;

/// ui-svelte.onCheckpoint
export function onCheckpoint(
  checkpointId: MaybeGetter<IdOrNull>,
  listener: CheckpointListener,
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): void;

/// ui-svelte.onPersisterStatus
export function onPersisterStatus(
  listener: StatusListener,
  persisterOrPersisterId?: MaybeGetter<PersisterOrPersisterId | undefined>,
): void;

/// ui-svelte.onSynchronizerStatus
export function onSynchronizerStatus(
  listener: StatusListener,
  synchronizerOrSynchronizerId?: MaybeGetter<
    SynchronizerOrSynchronizerId | undefined
  >,
): void;

/// ui-svelte.provideStore
export function provideStore(storeId: Id, store: Store): void;

/// ui-svelte.provideMetrics
export function provideMetrics(metricsId: Id, metrics: Metrics): void;

/// ui-svelte.provideIndexes
export function provideIndexes(indexesId: Id, indexes: Indexes): void;

/// ui-svelte.provideRelationships
export function provideRelationships(
  relationshipsId: Id,
  relationships: Relationships,
): void;

/// ui-svelte.provideQueries
export function provideQueries(queriesId: Id, queries: Queries): void;

/// ui-svelte.provideCheckpoints
export function provideCheckpoints(
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void;

/// ui-svelte.providePersister
export function providePersister(
  persisterId: Id,
  persister: AnyPersister,
): void;

/// ui-svelte.provideSynchronizer
export function provideSynchronizer(
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void;
