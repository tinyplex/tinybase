/// ui-svelte
import type {Component, Snippet} from 'svelte';
import type {CheckpointIds, Checkpoints} from '../checkpoints/index.d.ts';
import type {Id, Ids} from '../common/index.d.ts';
import type {Indexes} from '../indexes/index.d.ts';
import type {Metrics} from '../metrics/index.d.ts';
import type {AnyPersister, Status} from '../persisters/index.d.ts';
import type {Queries} from '../queries/index.d.ts';
import type {Relationships} from '../relationships/index.d.ts';
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
} from '../store/index.d.ts';
import type {Synchronizer} from '../synchronizers/index.d.ts';

/// ui-svelte.MaybeGetter
export type MaybeGetter<T> = T | (() => T);

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
  readonly store?: Store | Id;
  /// ui-svelte.CellViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.ValueViewProps
export type ValueViewProps = {
  /// ui-svelte.ValueViewProps.valueId
  readonly valueId: Id;
  /// ui-svelte.ValueViewProps.store
  readonly store?: Store | Id;
  /// ui-svelte.ValueViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.MetricViewProps
export type MetricViewProps = {
  /// ui-svelte.MetricViewProps.metricId
  readonly metricId: Id;
  /// ui-svelte.MetricViewProps.metrics
  readonly metrics?: Metrics | Id;
  /// ui-svelte.MetricViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.CheckpointViewProps
export type CheckpointViewProps = {
  /// ui-svelte.CheckpointViewProps.checkpointId
  readonly checkpointId: Id;
  /// ui-svelte.CheckpointViewProps.checkpoints
  readonly checkpoints?: Checkpoints | Id;
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
  readonly store?: Store | Id;
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
  readonly store?: Store | Id;
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
  readonly store?: Store | Id;
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
  readonly store?: Store | Id;
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
  readonly store?: Store | Id;
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
  readonly indexes?: Indexes | Id;
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
  readonly indexes?: Indexes | Id;
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
  readonly relationships?: Relationships | Id;
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
  readonly relationships?: Relationships | Id;
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
  readonly relationships?: Relationships | Id;
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
  readonly queries?: Queries | Id;
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
  readonly queries?: Queries | Id;
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
  readonly queries?: Queries | Id;
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
  readonly queries?: Queries | Id;
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
  readonly checkpoints?: Checkpoints | Id;
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
  readonly checkpoints?: Checkpoints | Id;
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
  readonly checkpoints?: Checkpoints | Id;
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
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {
  readonly current: boolean;
};

/// ui-svelte.useTables
export function useTables(
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {
  readonly current: Tables;
};

/// ui-svelte.useTableIds
export function useTableIds(
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useHasTable
export function useHasTable(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useTable
export function useTable(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Table};

/// ui-svelte.useTableCellIds
export function useTableCellIds(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasTableCell
export function useHasTableCell(
  tableId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useRowCount
export function useRowCount(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: number};

/// ui-svelte.useRowIds
export function useRowIds(
  tableId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useSortedRowIds
export function useSortedRowIds(
  tableId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending?: MaybeGetter<boolean>,
  offset?: MaybeGetter<number>,
  limit?: MaybeGetter<number | undefined>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasRow
export function useHasRow(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useRow
export function useRow(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Row};

/// ui-svelte.useCellIds
export function useCellIds(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasCell
export function useHasCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useCell
export function useCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.useBindableCell
export function useBindableCell(
  tableId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)};

/// ui-svelte.useHasValues
export function useHasValues(
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {
  readonly current: boolean;
};

/// ui-svelte.useValues
export function useValues(
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {
  readonly current: Values;
};

/// ui-svelte.useValueIds
export function useValueIds(
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useHasValue
export function useHasValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useValue
export function useValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {readonly current: ValueOrUndefined};

/// ui-svelte.useBindableValue
export function useBindableValue(
  valueId: MaybeGetter<Id>,
  storeOrStoreId?: MaybeGetter<Store | Id | undefined>,
): {get current(): ValueOrUndefined; set current(v: Value)};

/// ui-svelte.useStore
export function useStore(id?: Id): Store | undefined;

/// ui-svelte.useStoreIds
export function useStoreIds(): {readonly current: Ids};

/// ui-svelte.useMetrics
export function useMetrics(id?: Id): Metrics | undefined;

/// ui-svelte.useMetricsIds
export function useMetricsIds(): {readonly current: Ids};

/// ui-svelte.useMetricIds
export function useMetricIds(
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useMetric
export function useMetric(
  metricId: MaybeGetter<Id>,
  metricsOrMetricsId?: MaybeGetter<Metrics | Id | undefined>,
): {readonly current: number | undefined};

/// ui-svelte.useIndexes
export function useIndexes(id?: Id): Indexes | undefined;

/// ui-svelte.useIndexesIds
export function useIndexesIds(): {readonly current: Ids};

/// ui-svelte.useIndexIds
export function useIndexIds(
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useSliceIds
export function useSliceIds(
  indexId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useSliceRowIds
export function useSliceRowIds(
  indexId: MaybeGetter<Id>,
  sliceId: MaybeGetter<Id>,
  indexesOrIndexesId?: MaybeGetter<Indexes | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useQueries
export function useQueries(id?: Id): Queries | undefined;

/// ui-svelte.useQueriesIds
export function useQueriesIds(): {readonly current: Ids};

/// ui-svelte.useQueryIds
export function useQueryIds(
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useResultTable
export function useResultTable(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Table};

/// ui-svelte.useResultTableCellIds
export function useResultTableCellIds(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultRowCount
export function useResultRowCount(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: number};

/// ui-svelte.useResultRowIds
export function useResultRowIds(
  queryId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultSortedRowIds
export function useResultSortedRowIds(
  queryId: MaybeGetter<Id>,
  cellId?: MaybeGetter<Id | undefined>,
  descending?: MaybeGetter<boolean>,
  offset?: MaybeGetter<number>,
  limit?: MaybeGetter<number | undefined>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultRow
export function useResultRow(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Row};

/// ui-svelte.useResultCellIds
export function useResultCellIds(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultCell
export function useResultCell(
  queryId: MaybeGetter<Id>,
  rowId: MaybeGetter<Id>,
  cellId: MaybeGetter<Id>,
  queriesOrQueriesId?: MaybeGetter<Queries | Id | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.useRelationships
export function useRelationships(id?: Id): Relationships | undefined;

/// ui-svelte.useRelationshipsIds
export function useRelationshipsIds(): {readonly current: Ids};

/// ui-svelte.useRelationshipIds
export function useRelationshipIds(
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useRemoteRowId
export function useRemoteRowId(
  relationshipId: MaybeGetter<Id>,
  localRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Id | undefined};

/// ui-svelte.useLocalRowIds
export function useLocalRowIds(
  relationshipId: MaybeGetter<Id>,
  remoteRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useLinkedRowIds
export function useLinkedRowIds(
  relationshipId: MaybeGetter<Id>,
  firstRowId: MaybeGetter<Id>,
  relationshipsOrRelationshipsId?: MaybeGetter<Relationships | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useCheckpoints
export function useCheckpoints(id?: Id): Checkpoints | undefined;

/// ui-svelte.useCheckpointsIds
export function useCheckpointsIds(): {readonly current: Ids};

/// ui-svelte.useCheckpointIds
export function useCheckpointIds(
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: CheckpointIds};

/// ui-svelte.useCheckpoint
export function useCheckpoint(
  checkpointId: MaybeGetter<Id>,
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): {readonly current: string | undefined};

/// ui-svelte.useGoBackwardCallback
export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): () => void;

/// ui-svelte.useGoForwardCallback
export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: MaybeGetter<Checkpoints | Id | undefined>,
): () => void;

/// ui-svelte.usePersister
export function usePersister(id?: Id): AnyPersister | undefined;

/// ui-svelte.usePersisterIds
export function usePersisterIds(): {readonly current: Ids};

/// ui-svelte.usePersisterStatus
export function usePersisterStatus(
  persisterOrPersisterId?: AnyPersister | Id,
): {readonly current: Status};

/// ui-svelte.useSynchronizer
export function useSynchronizer(id?: Id): Synchronizer | undefined;

/// ui-svelte.useSynchronizerIds
export function useSynchronizerIds(): {readonly current: Ids};

/// ui-svelte.useSynchronizerStatus
export function useSynchronizerStatus(
  synchronizerOrSynchronizerId?: Synchronizer | Id,
): {readonly current: Status};

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
