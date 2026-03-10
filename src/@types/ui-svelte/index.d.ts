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

/// ui-svelte.R
export type R<T> = T | (() => T);

/// ui-svelte.ProviderProps
export type ProviderProps = {
  /// ProviderProps.store
  readonly store?: Store;
  /// ProviderProps.storesById
  readonly storesById?: {readonly [id: Id]: Store};
  /// ProviderProps.metrics
  readonly metrics?: Metrics;
  /// ProviderProps.metricsById
  readonly metricsById?: {readonly [id: Id]: Metrics};
  /// ProviderProps.indexes
  readonly indexes?: Indexes;
  /// ProviderProps.indexesById
  readonly indexesById?: {readonly [id: Id]: Indexes};
  /// ProviderProps.relationships
  readonly relationships?: Relationships;
  /// ProviderProps.relationshipsById
  readonly relationshipsById?: {readonly [id: Id]: Relationships};
  /// ProviderProps.queries
  readonly queries?: Queries;
  /// ProviderProps.queriesById
  readonly queriesById?: {readonly [id: Id]: Queries};
  /// ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints;
  /// ProviderProps.checkpointsById
  readonly checkpointsById?: {readonly [id: Id]: Checkpoints};
  /// ProviderProps.persister
  readonly persister?: AnyPersister;
  /// ProviderProps.persistersById
  readonly persistersById?: {readonly [id: Id]: AnyPersister};
  /// ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer;
  /// ProviderProps.synchronizersById
  readonly synchronizersById?: {readonly [id: Id]: Synchronizer};
  /// ProviderProps.children
  readonly children: Snippet;
};

/// ui-svelte.CellViewProps
export type CellViewProps = {
  /// CellViewProps.tableId
  readonly tableId: Id;
  /// CellViewProps.rowId
  readonly rowId: Id;
  /// CellViewProps.cellId
  readonly cellId: Id;
  /// CellViewProps.store
  readonly store?: Store | Id;
  /// CellViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.ValueViewProps
export type ValueViewProps = {
  /// ValueViewProps.valueId
  readonly valueId: Id;
  /// ValueViewProps.store
  readonly store?: Store | Id;
  /// ValueViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.MetricViewProps
export type MetricViewProps = {
  /// MetricViewProps.metricId
  readonly metricId: Id;
  /// MetricViewProps.metrics
  readonly metrics?: Metrics | Id;
  /// MetricViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.CheckpointViewProps
export type CheckpointViewProps = {
  /// CheckpointViewProps.checkpointId
  readonly checkpointId: Id;
  /// CheckpointViewProps.checkpoints
  readonly checkpoints?: Checkpoints | Id;
  /// CheckpointViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.RowViewProps
export type RowViewProps = {
  /// RowViewProps.tableId
  readonly tableId: Id;
  /// RowViewProps.rowId
  readonly rowId: Id;
  /// RowViewProps.store
  readonly store?: Store | Id;
  /// RowViewProps.customCellIds
  readonly customCellIds?: Ids;
  /// RowViewProps.separator
  readonly separator?: Snippet<[]>;
  /// RowViewProps.debugIds
  readonly debugIds?: boolean;
  /// RowViewProps.cell
  readonly cell?: Snippet<[cellId: Id]>;
};

/// ui-svelte.TableViewProps
export type TableViewProps = {
  /// TableViewProps.tableId
  readonly tableId: Id;
  /// TableViewProps.store
  readonly store?: Store | Id;
  /// TableViewProps.customCellIds
  readonly customCellIds?: Ids;
  /// TableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// TableViewProps.debugIds
  readonly debugIds?: boolean;
  /// TableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.SortedTableViewProps
export type SortedTableViewProps = {
  /// SortedTableViewProps.tableId
  readonly tableId: Id;
  /// SortedTableViewProps.cellId
  readonly cellId?: Id;
  /// SortedTableViewProps.descending
  readonly descending?: boolean;
  /// SortedTableViewProps.offset
  readonly offset?: number;
  /// SortedTableViewProps.limit
  readonly limit?: number;
  /// SortedTableViewProps.store
  readonly store?: Store | Id;
  /// SortedTableViewProps.customCellIds
  readonly customCellIds?: Ids;
  /// SortedTableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// SortedTableViewProps.debugIds
  readonly debugIds?: boolean;
  /// SortedTableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.TablesViewProps
export type TablesViewProps = {
  /// TablesViewProps.store
  readonly store?: Store | Id;
  /// TablesViewProps.separator
  readonly separator?: Snippet<[]>;
  /// TablesViewProps.debugIds
  readonly debugIds?: boolean;
  /// TablesViewProps.table
  readonly table?: Snippet<[tableId: Id]>;
};

/// ui-svelte.ValuesViewProps
export type ValuesViewProps = {
  /// ValuesViewProps.store
  readonly store?: Store | Id;
  /// ValuesViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ValuesViewProps.debugIds
  readonly debugIds?: boolean;
  /// ValuesViewProps.value
  readonly value?: Snippet<[valueId: Id]>;
};

/// ui-svelte.IndexViewProps
export type IndexViewProps = {
  /// IndexViewProps.indexId
  readonly indexId: Id;
  /// IndexViewProps.indexes
  readonly indexes?: Indexes | Id;
  /// IndexViewProps.separator
  readonly separator?: Snippet<[]>;
  /// IndexViewProps.debugIds
  readonly debugIds?: boolean;
  /// IndexViewProps.slice
  readonly slice?: Snippet<[sliceId: Id]>;
};

/// ui-svelte.SliceViewProps
export type SliceViewProps = {
  /// SliceViewProps.indexId
  readonly indexId: Id;
  /// SliceViewProps.sliceId
  readonly sliceId: Id;
  /// SliceViewProps.indexes
  readonly indexes?: Indexes | Id;
  /// SliceViewProps.separator
  readonly separator?: Snippet<[]>;
  /// SliceViewProps.debugIds
  readonly debugIds?: boolean;
  /// SliceViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.RemoteRowViewProps
export type RemoteRowViewProps = {
  /// RemoteRowViewProps.relationshipId
  readonly relationshipId: Id;
  /// RemoteRowViewProps.localRowId
  readonly localRowId: Id;
  /// RemoteRowViewProps.relationships
  readonly relationships?: Relationships | Id;
  /// RemoteRowViewProps.debugIds
  readonly debugIds?: boolean;
  /// RemoteRowViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.LocalRowsViewProps
export type LocalRowsViewProps = {
  /// LocalRowsViewProps.relationshipId
  readonly relationshipId: Id;
  /// LocalRowsViewProps.remoteRowId
  readonly remoteRowId: Id;
  /// LocalRowsViewProps.relationships
  readonly relationships?: Relationships | Id;
  /// LocalRowsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// LocalRowsViewProps.debugIds
  readonly debugIds?: boolean;
  /// LocalRowsViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.LinkedRowsViewProps
export type LinkedRowsViewProps = {
  /// LinkedRowsViewProps.relationshipId
  readonly relationshipId: Id;
  /// LinkedRowsViewProps.firstRowId
  readonly firstRowId: Id;
  /// LinkedRowsViewProps.relationships
  readonly relationships?: Relationships | Id;
  /// LinkedRowsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// LinkedRowsViewProps.debugIds
  readonly debugIds?: boolean;
  /// LinkedRowsViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.ResultCellViewProps
export type ResultCellViewProps = {
  /// ResultCellViewProps.queryId
  readonly queryId: Id;
  /// ResultCellViewProps.rowId
  readonly rowId: Id;
  /// ResultCellViewProps.cellId
  readonly cellId: Id;
  /// ResultCellViewProps.queries
  readonly queries?: Queries | Id;
  /// ResultCellViewProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-svelte.ResultRowViewProps
export type ResultRowViewProps = {
  /// ResultRowViewProps.queryId
  readonly queryId: Id;
  /// ResultRowViewProps.rowId
  readonly rowId: Id;
  /// ResultRowViewProps.queries
  readonly queries?: Queries | Id;
  /// ResultRowViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ResultRowViewProps.debugIds
  readonly debugIds?: boolean;
  /// ResultRowViewProps.cell
  readonly cell?: Snippet<[cellId: Id]>;
};

/// ui-svelte.ResultTableViewProps
export type ResultTableViewProps = {
  /// ResultTableViewProps.queryId
  readonly queryId: Id;
  /// ResultTableViewProps.queries
  readonly queries?: Queries | Id;
  /// ResultTableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ResultTableViewProps.debugIds
  readonly debugIds?: boolean;
  /// ResultTableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.ResultSortedTableViewProps
export type ResultSortedTableViewProps = {
  /// ResultSortedTableViewProps.queryId
  readonly queryId: Id;
  /// ResultSortedTableViewProps.cellId
  readonly cellId?: Id;
  /// ResultSortedTableViewProps.descending
  readonly descending?: boolean;
  /// ResultSortedTableViewProps.offset
  readonly offset?: number;
  /// ResultSortedTableViewProps.limit
  readonly limit?: number;
  /// ResultSortedTableViewProps.queries
  readonly queries?: Queries | Id;
  /// ResultSortedTableViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ResultSortedTableViewProps.debugIds
  readonly debugIds?: boolean;
  /// ResultSortedTableViewProps.row
  readonly row?: Snippet<[rowId: Id]>;
};

/// ui-svelte.BackwardCheckpointsViewProps
export type BackwardCheckpointsViewProps = {
  /// BackwardCheckpointsViewProps.checkpoints
  readonly checkpoints?: Checkpoints | Id;
  /// BackwardCheckpointsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// BackwardCheckpointsViewProps.debugIds
  readonly debugIds?: boolean;
  /// BackwardCheckpointsViewProps.checkpoint
  readonly checkpoint?: Snippet<[checkpointId: Id]>;
};

/// ui-svelte.ForwardCheckpointsViewProps
export type ForwardCheckpointsViewProps = {
  /// ForwardCheckpointsViewProps.checkpoints
  readonly checkpoints?: Checkpoints | Id;
  /// ForwardCheckpointsViewProps.separator
  readonly separator?: Snippet<[]>;
  /// ForwardCheckpointsViewProps.debugIds
  readonly debugIds?: boolean;
  /// ForwardCheckpointsViewProps.checkpoint
  readonly checkpoint?: Snippet<[checkpointId: Id]>;
};

/// ui-svelte.CurrentCheckpointViewProps
export type CurrentCheckpointViewProps = {
  /// CurrentCheckpointViewProps.checkpoints
  readonly checkpoints?: Checkpoints | Id;
  /// CurrentCheckpointViewProps.debugIds
  readonly debugIds?: boolean;
  /// CurrentCheckpointViewProps.checkpoint
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
export function useHasTables(storeOrStoreId?: R<Store | Id | undefined>): {
  readonly current: boolean;
};

/// ui-svelte.useTables
export function useTables(storeOrStoreId?: R<Store | Id | undefined>): {
  readonly current: Tables;
};

/// ui-svelte.useTableIds
export function useTableIds(storeOrStoreId?: R<Store | Id | undefined>): {
  readonly current: Ids;
};

/// ui-svelte.useHasTable
export function useHasTable(
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useTable
export function useTable(
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Table};

/// ui-svelte.useTableCellIds
export function useTableCellIds(
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasTableCell
export function useHasTableCell(
  tableId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useRowCount
export function useRowCount(
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: number};

/// ui-svelte.useRowIds
export function useRowIds(
  tableId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useSortedRowIds
export function useSortedRowIds(
  tableId: R<Id>,
  cellId?: R<Id | undefined>,
  descending?: R<boolean>,
  offset?: R<number>,
  limit?: R<number | undefined>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasRow
export function useHasRow(
  tableId: R<Id>,
  rowId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useRow
export function useRow(
  tableId: R<Id>,
  rowId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Row};

/// ui-svelte.useCellIds
export function useCellIds(
  tableId: R<Id>,
  rowId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useHasCell
export function useHasCell(
  tableId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useCell
export function useCell(
  tableId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.useBindableCell
export function useBindableCell(
  tableId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {get current(): CellOrUndefined; set current(v: Cell)};

/// ui-svelte.useHasValues
export function useHasValues(storeOrStoreId?: R<Store | Id | undefined>): {
  readonly current: boolean;
};

/// ui-svelte.useValues
export function useValues(storeOrStoreId?: R<Store | Id | undefined>): {
  readonly current: Values;
};

/// ui-svelte.useValueIds
export function useValueIds(storeOrStoreId?: R<Store | Id | undefined>): {
  readonly current: Ids;
};

/// ui-svelte.useHasValue
export function useHasValue(
  valueId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: boolean};

/// ui-svelte.useValue
export function useValue(
  valueId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
): {readonly current: ValueOrUndefined};

/// ui-svelte.useBindableValue
export function useBindableValue(
  valueId: R<Id>,
  storeOrStoreId?: R<Store | Id | undefined>,
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
  metricsOrMetricsId?: R<Metrics | Id | undefined>,
): {
  readonly current: Ids;
};

/// ui-svelte.useMetric
export function useMetric(
  metricId: R<Id>,
  metricsOrMetricsId?: R<Metrics | Id | undefined>,
): {readonly current: number | undefined};

/// ui-svelte.useIndexes
export function useIndexes(id?: Id): Indexes | undefined;

/// ui-svelte.useIndexesIds
export function useIndexesIds(): {readonly current: Ids};

/// ui-svelte.useIndexIds
export function useIndexIds(indexesOrIndexesId?: R<Indexes | Id | undefined>): {
  readonly current: Ids;
};

/// ui-svelte.useSliceIds
export function useSliceIds(
  indexId: R<Id>,
  indexesOrIndexesId?: R<Indexes | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useSliceRowIds
export function useSliceRowIds(
  indexId: R<Id>,
  sliceId: R<Id>,
  indexesOrIndexesId?: R<Indexes | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useQueries
export function useQueries(id?: Id): Queries | undefined;

/// ui-svelte.useQueriesIds
export function useQueriesIds(): {readonly current: Ids};

/// ui-svelte.useQueryIds
export function useQueryIds(queriesOrQueriesId?: R<Queries | Id | undefined>): {
  readonly current: Ids;
};

/// ui-svelte.useResultTable
export function useResultTable(
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Table};

/// ui-svelte.useResultTableCellIds
export function useResultTableCellIds(
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultRowCount
export function useResultRowCount(
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: number};

/// ui-svelte.useResultRowIds
export function useResultRowIds(
  queryId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultSortedRowIds
export function useResultSortedRowIds(
  queryId: R<Id>,
  cellId?: R<Id | undefined>,
  descending?: R<boolean>,
  offset?: R<number>,
  limit?: R<number | undefined>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultRow
export function useResultRow(
  queryId: R<Id>,
  rowId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Row};

/// ui-svelte.useResultCellIds
export function useResultCellIds(
  queryId: R<Id>,
  rowId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useResultCell
export function useResultCell(
  queryId: R<Id>,
  rowId: R<Id>,
  cellId: R<Id>,
  queriesOrQueriesId?: R<Queries | Id | undefined>,
): {readonly current: CellOrUndefined};

/// ui-svelte.useRelationships
export function useRelationships(id?: Id): Relationships | undefined;

/// ui-svelte.useRelationshipsIds
export function useRelationshipsIds(): {readonly current: Ids};

/// ui-svelte.useRelationshipIds
export function useRelationshipIds(
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useRemoteRowId
export function useRemoteRowId(
  relationshipId: R<Id>,
  localRowId: R<Id>,
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Id | undefined};

/// ui-svelte.useLocalRowIds
export function useLocalRowIds(
  relationshipId: R<Id>,
  remoteRowId: R<Id>,
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useLinkedRowIds
export function useLinkedRowIds(
  relationshipId: R<Id>,
  firstRowId: R<Id>,
  relationshipsOrRelationshipsId?: R<Relationships | Id | undefined>,
): {readonly current: Ids};

/// ui-svelte.useCheckpoints
export function useCheckpoints(id?: Id): Checkpoints | undefined;

/// ui-svelte.useCheckpointsIds
export function useCheckpointsIds(): {readonly current: Ids};

/// ui-svelte.useCheckpointIds
export function useCheckpointIds(
  checkpointsOrCheckpointsId?: R<Checkpoints | Id | undefined>,
): {readonly current: CheckpointIds};

/// ui-svelte.useCheckpoint
export function useCheckpoint(
  checkpointId: R<Id>,
  checkpointsOrCheckpointsId?: R<Checkpoints | Id | undefined>,
): {readonly current: string | undefined};

/// ui-svelte.useGoBackwardCallback
export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: R<Checkpoints | Id | undefined>,
): () => void;

/// ui-svelte.useGoForwardCallback
export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: R<Checkpoints | Id | undefined>,
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
