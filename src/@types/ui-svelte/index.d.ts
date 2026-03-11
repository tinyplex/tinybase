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
export declare const Provider: Component<ProviderProps>;

/// ui-svelte.BackwardCheckpointsView
export declare const BackwardCheckpointsView: Component<BackwardCheckpointsViewProps>;

/// ui-svelte.CellView
export declare const CellView: Component<CellViewProps>;

/// ui-svelte.CheckpointView
export declare const CheckpointView: Component<CheckpointViewProps>;

/// ui-svelte.CurrentCheckpointView
export declare const CurrentCheckpointView: Component<CurrentCheckpointViewProps>;

/// ui-svelte.ForwardCheckpointsView
export declare const ForwardCheckpointsView: Component<ForwardCheckpointsViewProps>;

/// ui-svelte.IndexView
export declare const IndexView: Component<IndexViewProps>;

/// ui-svelte.LinkedRowsView
export declare const LinkedRowsView: Component<LinkedRowsViewProps>;

/// ui-svelte.LocalRowsView
export declare const LocalRowsView: Component<LocalRowsViewProps>;

/// ui-svelte.MetricView
export declare const MetricView: Component<MetricViewProps>;

/// ui-svelte.RemoteRowView
export declare const RemoteRowView: Component<RemoteRowViewProps>;

/// ui-svelte.ResultCellView
export declare const ResultCellView: Component<ResultCellViewProps>;

/// ui-svelte.ResultRowView
export declare const ResultRowView: Component<ResultRowViewProps>;

/// ui-svelte.ResultSortedTableView
export declare const ResultSortedTableView: Component<ResultSortedTableViewProps>;

/// ui-svelte.ResultTableView
export declare const ResultTableView: Component<ResultTableViewProps>;

/// ui-svelte.RowView
export declare const RowView: Component<RowViewProps>;

/// ui-svelte.SliceView
export declare const SliceView: Component<SliceViewProps>;

/// ui-svelte.SortedTableView
export declare const SortedTableView: Component<SortedTableViewProps>;

/// ui-svelte.TableView
export declare const TableView: Component<TableViewProps>;

/// ui-svelte.TablesView
export declare const TablesView: Component<TablesViewProps>;

/// ui-svelte.ValueView
export declare const ValueView: Component<ValueViewProps>;

/// ui-svelte.ValuesView
export declare const ValuesView: Component<ValuesViewProps>;

/// ui-svelte.useHasTables
export function useHasTables(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: boolean;
};

/// ui-svelte.useTables
export function useTables(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Tables;
};

/// ui-svelte.useTableIds
export function useTableIds(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useHasTable
export function useHasTable(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.useTable
export function useTable(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Table};

/// ui-svelte.useTableCellIds
export function useTableCellIds(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasTableCell
export function useHasTableCell(
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.useRowCount
export function useRowCount(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: number};

/// ui-svelte.useRowIds
export function useRowIds(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useSortedRowIds
export function useSortedRowIds(
  tableId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending?: MaybeGetter<boolean>,
  offset?: MaybeGetter<number>,
  limit?: MaybeGetter<number | undefined>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasRow
export function useHasRow(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.useRow
export function useRow(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Row};

/// ui-svelte.useCellIds
export function useCellIds(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasCell
export function useHasCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.useCell
export function useCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.useBindableCell
export function useBindableCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)};

/// ui-svelte.useHasValues
export function useHasValues(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: boolean;
};

/// ui-svelte.useValues
export function useValues(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Values;
};

/// ui-svelte.useValueIds
export function useValueIds(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useHasValue
export function useHasValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: boolean};

/// ui-svelte.useValue
export function useValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {readonly current: ValueOrUndefined};

/// ui-svelte.useBindableValue
export function useBindableValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)};

/// ui-svelte.useStore
export function useStore(id?: Id): Store | undefined;

/// ui-svelte.useStoreOrStoreById
export function useStoreOrStoreById(
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): () => Store | undefined;

/// ui-svelte.useStoreIds
export function useStoreIds(): {readonly current: Ids};

/// ui-svelte.useMetrics
export function useMetrics(id?: Id): Metrics | undefined;

/// ui-svelte.useMetricsOrMetricsById
export function useMetricsOrMetricsById(
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): () => Metrics | undefined;

/// ui-svelte.useMetricsIds
export function useMetricsIds(): {readonly current: Ids};

/// ui-svelte.useMetricIds
export function useMetricIds(
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useMetric
export function useMetric(
  metricId: MaybeGetter<Id>,
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): {readonly current: number | undefined};

/// ui-svelte.useIndexes
export function useIndexes(id?: Id): Indexes | undefined;

/// ui-svelte.useIndexesOrIndexesById
export function useIndexesOrIndexesById(
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): () => Indexes | undefined;

/// ui-svelte.useIndexStoreTableId
export function useIndexStoreTableId(
  indexesOrId: MaybeGetter<IndexesOrIndexesId | undefined>,
  indexId: MaybeGetter<Id>,
): {readonly store: Store | undefined; readonly tableId: Id | undefined};

/// ui-svelte.useIndexesIds
export function useIndexesIds(): {readonly current: Ids};

/// ui-svelte.useIndexIds
export function useIndexIds(
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useSliceIds
export function useSliceIds(
  indexId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useSliceRowIds
export function useSliceRowIds(
  indexId: MaybeGetter<Id>,
  sliceId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useQueries
export function useQueries(id?: Id): Queries | undefined;

/// ui-svelte.useQueriesOrQueriesById
export function useQueriesOrQueriesById(
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): () => Queries | undefined;

/// ui-svelte.useQueriesIds
export function useQueriesIds(): {readonly current: Ids};

/// ui-svelte.useQueryIds
export function useQueryIds(
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useResultTable
export function useResultTable(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Table};

/// ui-svelte.useResultTableCellIds
export function useResultTableCellIds(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultRowCount
export function useResultRowCount(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: number};

/// ui-svelte.useResultRowIds
export function useResultRowIds(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultSortedRowIds
export function useResultSortedRowIds(
  queryId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending?: MaybeGetter<boolean>,
  offset?: MaybeGetter<number>,
  limit?: MaybeGetter<number | undefined>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultRow
export function useResultRow(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Row};

/// ui-svelte.useResultCellIds
export function useResultCellIds(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultCell
export function useResultCell(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.useRelationships
export function useRelationships(id?: Id): Relationships | undefined;

/// ui-svelte.useRelationshipsOrRelationshipsById
export function useRelationshipsOrRelationshipsById(
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): () => Relationships | undefined;

/// ui-svelte.useRelationshipsStoreTableIds
export function useRelationshipsStoreTableIds(
  relationshipsOrId: MaybeGetter<RelationshipsOrRelationshipsId | undefined>,
  relationshipId: MaybeGetter<Id>,
): {
  readonly store: Store | undefined;
  readonly localTableId: Id | undefined;
  readonly remoteTableId: Id | undefined;
};

/// ui-svelte.useRelationshipsIds
export function useRelationshipsIds(): {readonly current: Ids};

/// ui-svelte.useRelationshipIds
export function useRelationshipIds(
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Ids};

/// ui-svelte.useRemoteRowId
export function useRemoteRowId(
  relationshipId: MaybeGetter<Id>,
  localRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Id | undefined};

/// ui-svelte.useLocalRowIds
export function useLocalRowIds(
  relationshipId: MaybeGetter<Id>,
  remoteRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Ids};

/// ui-svelte.useLinkedRowIds
export function useLinkedRowIds(
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): {readonly current: Ids};

/// ui-svelte.useCheckpoints
export function useCheckpoints(id?: Id): Checkpoints | undefined;

/// ui-svelte.useCheckpointsOrCheckpointsById
export function useCheckpointsOrCheckpointsById(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): () => Checkpoints | undefined;

/// ui-svelte.useCheckpointsIds
export function useCheckpointsIds(): {readonly current: Ids};

/// ui-svelte.useCheckpointIds
export function useCheckpointIds(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): {readonly current: CheckpointIds};

/// ui-svelte.useCheckpoint
export function useCheckpoint(
  checkpointId: MaybeGetter<Id>,
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): {readonly current: string | undefined};

/// ui-svelte.useGoBackwardCallback
export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): () => void;

/// ui-svelte.useGoForwardCallback
export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): () => void;

/// ui-svelte.usePersister
export function usePersister(id?: Id): AnyPersister | undefined;

/// ui-svelte.usePersisterOrPersisterById
export function usePersisterOrPersisterById(
  persisterOrPersisterId?: MaybeGetter<PersisterOrPersisterId | undefined>,
): () => AnyPersister | undefined;

/// ui-svelte.usePersisterIds
export function usePersisterIds(): {readonly current: Ids};

/// ui-svelte.usePersisterStatus
export function usePersisterStatus(
  persisterOrPersisterId?: PersisterOrPersisterId,
): {readonly current: Status};

/// ui-svelte.useSynchronizer
export function useSynchronizer(id?: Id): Synchronizer | undefined;

/// ui-svelte.useSynchronizerOrSynchronizerById
export function useSynchronizerOrSynchronizerById(
  synchronizerOrSynchronizerId?: MaybeGetter<
    SynchronizerOrSynchronizerId | undefined
  >,
): () => Synchronizer | undefined;

/// ui-svelte.useSynchronizerIds
export function useSynchronizerIds(): {readonly current: Ids};

/// ui-svelte.useSynchronizerStatus
export function useSynchronizerStatus(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): {readonly current: Status};

/// ui-svelte.useHasTablesListener
export function useHasTablesListener(
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useTablesListener
export function useTablesListener(
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useTableIdsListener
export function useTableIdsListener(
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useHasTableListener
export function useHasTableListener(
  tableId: MaybeGetter<IdOrNull>,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useTableListener
export function useTableListener(
  tableId: MaybeGetter<IdOrNull>,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useTableCellIdsListener
export function useTableCellIdsListener(
  tableId: MaybeGetter<IdOrNull>,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useHasTableCellListener
export function useHasTableCellListener(
  tableId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useRowCountListener
export function useRowCountListener(
  tableId: MaybeGetter<IdOrNull>,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useRowIdsListener
export function useRowIdsListener(
  tableId: MaybeGetter<IdOrNull>,
  listener: RowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useSortedRowIdsListener
export function useSortedRowIdsListener(
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useHasRowListener
export function useHasRowListener(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useRowListener
export function useRowListener(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useCellIdsListener
export function useCellIdsListener(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useHasCellListener
export function useHasCellListener(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useCellListener
export function useCellListener(
  tableId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useHasValuesListener
export function useHasValuesListener(
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useValuesListener
export function useValuesListener(
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useValueIdsListener
export function useValueIdsListener(
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useHasValueListener
export function useHasValueListener(
  valueId: MaybeGetter<IdOrNull>,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useValueListener
export function useValueListener(
  valueId: MaybeGetter<IdOrNull>,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useStartTransactionListener
export function useStartTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useWillFinishTransactionListener
export function useWillFinishTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useDidFinishTransactionListener
export function useDidFinishTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: MaybeGetter<StoreOrStoreId | undefined>,
): void;

/// ui-svelte.useMetricListener
export function useMetricListener(
  metricId: MaybeGetter<IdOrNull>,
  listener: MetricListener,
  metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId | undefined>,
): void;

/// ui-svelte.useSliceIdsListener
export function useSliceIdsListener(
  indexId: MaybeGetter<IdOrNull>,
  listener: SliceIdsListener,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): void;

/// ui-svelte.useSliceRowIdsListener
export function useSliceRowIdsListener(
  indexId: MaybeGetter<IdOrNull>,
  sliceId: MaybeGetter<IdOrNull>,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId | undefined>,
): void;

/// ui-svelte.useRemoteRowIdListener
export function useRemoteRowIdListener(
  relationshipId: MaybeGetter<IdOrNull>,
  localRowId: MaybeGetter<IdOrNull>,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-svelte.useLocalRowIdsListener
export function useLocalRowIdsListener(
  relationshipId: MaybeGetter<IdOrNull>,
  remoteRowId: MaybeGetter<IdOrNull>,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-svelte.useLinkedRowIdsListener
export function useLinkedRowIdsListener(
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeGetter<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-svelte.useResultTableListener
export function useResultTableListener(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultTableCellIdsListener
export function useResultTableCellIdsListener(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultRowCountListener
export function useResultRowCountListener(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultRowIdsListener
export function useResultRowIdsListener(
  queryId: MaybeGetter<IdOrNull>,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultSortedRowIdsListener
export function useResultSortedRowIdsListener(
  queryId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id | undefined>,
  descending: MaybeGetter<boolean>,
  offset: MaybeGetter<number>,
  limit: MaybeGetter<number | undefined>,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultRowListener
export function useResultRowListener(
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultRowListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultCellIdsListener
export function useResultCellIdsListener(
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useResultCellListener
export function useResultCellListener(
  queryId: MaybeGetter<IdOrNull>,
  rowId: MaybeGetter<IdOrNull>,
  cellId: MaybeGetter<IdOrNull>,
  listener: ResultCellListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useParamValuesListener
export function useParamValuesListener(
  queryId: MaybeGetter<IdOrNull>,
  listener: ParamValuesListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useParamValueListener
export function useParamValueListener(
  queryId: MaybeGetter<IdOrNull>,
  paramId: MaybeGetter<IdOrNull>,
  listener: ParamValueListener,
  queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId | undefined>,
): void;

/// ui-svelte.useCheckpointIdsListener
export function useCheckpointIdsListener(
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): void;

/// ui-svelte.useCheckpointListener
export function useCheckpointListener(
  checkpointId: MaybeGetter<IdOrNull>,
  listener: CheckpointListener,
  checkpointsOrCheckpointsId?: MaybeGetter<
    CheckpointsOrCheckpointsId | undefined
  >,
): void;

/// ui-svelte.usePersisterStatusListener
export function usePersisterStatusListener(
  listener: StatusListener,
  persisterOrPersisterId?: MaybeGetter<PersisterOrPersisterId | undefined>,
): void;

/// ui-svelte.useSynchronizerStatusListener
export function useSynchronizerStatusListener(
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
