import type {Component, Snippet} from 'svelte';
import type {
  AllCellIdFromSchema,
  CellIdFromSchema,
  DefaultedValueFromSchema,
  NoInfer,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  CheckpointsOrCheckpointsId,
  IndexesOrIndexesId,
  MetricsOrMetricsId,
  PersisterOrPersisterId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
  SynchronizerOrSynchronizerId,
} from '../../_internal/ui/with-schemas/index.d.ts';
import type {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../../checkpoints/with-schemas/index.d.ts';
import type {Id, IdOrNull, Ids} from '../../common/with-schemas/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../../indexes/with-schemas/index.d.ts';
import type {
  MetricListener,
  Metrics,
} from '../../metrics/with-schemas/index.d.ts';
import type {
  AnyPersister,
  Status,
  StatusListener,
} from '../../persisters/with-schemas/index.d.ts';
import type {
  ParamValueListener,
  ParamValuesListener,
  Queries,
  ResultCell,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRow,
  ResultRowCountListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultSortedRowIdsListener,
  ResultTable,
  ResultTableCellIdsListener,
  ResultTableListener,
} from '../../queries/with-schemas/index.d.ts';
import type {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../../relationships/with-schemas/index.d.ts';
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
  OptionalSchemas,
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
  Values,
  ValuesListener,
} from '../../store/with-schemas/index.d.ts';
import type {Synchronizer} from '../../synchronizers/with-schemas/index.d.ts';
import type {MaybeGetter} from '../index.d.ts';

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// ui-svelte.MaybeGetter
  MaybeGetter: <T>(t: T) => T | (() => T);

  /// ui-svelte.StoreOrStoreId
  StoreOrStoreId: StoreOrStoreId<Schemas>;

  /// ui-svelte.MetricsOrMetricsId
  MetricsOrMetricsId: MetricsOrMetricsId<Schemas>;

  /// ui-svelte.IndexesOrIndexesId
  IndexesOrIndexesId: IndexesOrIndexesId<Schemas>;

  /// ui-svelte.RelationshipsOrRelationshipsId
  RelationshipsOrRelationshipsId: RelationshipsOrRelationshipsId<Schemas>;

  /// ui-svelte.QueriesOrQueriesId
  QueriesOrQueriesId: QueriesOrQueriesId<Schemas>;

  /// ui-svelte.CheckpointsOrCheckpointsId
  CheckpointsOrCheckpointsId: CheckpointsOrCheckpointsId<Schemas>;

  /// ui-svelte.PersisterOrPersisterId
  PersisterOrPersisterId: PersisterOrPersisterId<Schemas>;

  /// ui-svelte.SynchronizerOrSynchronizerId
  SynchronizerOrSynchronizerId: SynchronizerOrSynchronizerId<Schemas>;

  /// ui-svelte.ProviderProps
  ProviderProps: {
    /// ui-svelte.ProviderProps.store
    readonly store?: Store<Schemas>;
    /// ui-svelte.ProviderProps.storesById
    readonly storesById?: {readonly [id: Id]: Store<Schemas>};
    /// ui-svelte.ProviderProps.metrics
    readonly metrics?: Metrics<Schemas>;
    /// ui-svelte.ProviderProps.metricsById
    readonly metricsById?: {readonly [id: Id]: Metrics<Schemas>};
    /// ui-svelte.ProviderProps.indexes
    readonly indexes?: Indexes<Schemas>;
    /// ui-svelte.ProviderProps.indexesById
    readonly indexesById?: {readonly [id: Id]: Indexes<Schemas>};
    /// ui-svelte.ProviderProps.relationships
    readonly relationships?: Relationships<Schemas>;
    /// ui-svelte.ProviderProps.relationshipsById
    readonly relationshipsById?: {readonly [id: Id]: Relationships<Schemas>};
    /// ui-svelte.ProviderProps.queries
    readonly queries?: Queries<Schemas>;
    /// ui-svelte.ProviderProps.queriesById
    readonly queriesById?: {readonly [id: Id]: Queries<Schemas>};
    /// ui-svelte.ProviderProps.checkpoints
    readonly checkpoints?: Checkpoints<Schemas>;
    /// ui-svelte.ProviderProps.checkpointsById
    readonly checkpointsById?: {readonly [id: Id]: Checkpoints<Schemas>};
    /// ui-svelte.ProviderProps.persister
    readonly persister?: AnyPersister<Schemas>;
    /// ui-svelte.ProviderProps.persistersById
    readonly persistersById?: {readonly [id: Id]: AnyPersister<Schemas>};
    /// ui-svelte.ProviderProps.synchronizer
    readonly synchronizer?: Synchronizer<Schemas>;
    /// ui-svelte.ProviderProps.synchronizersById
    readonly synchronizersById?: {readonly [id: Id]: Synchronizer<Schemas>};
    /// ui-svelte.ProviderProps.children
    readonly children: Snippet;
  };

  /// ui-svelte.CellViewProps
  CellViewProps: {
    /// ui-svelte.CellViewProps.tableId
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    /// ui-svelte.CellViewProps.rowId
    readonly rowId: Id;
    /// ui-svelte.CellViewProps.cellId
    readonly cellId: AllCellIdFromSchema<Schemas[0]>;
    /// ui-svelte.CellViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
    /// ui-svelte.CellViewProps.debugIds
    readonly debugIds?: boolean;
  };

  /// ui-svelte.ValueViewProps
  ValueViewProps: {
    /// ui-svelte.ValueViewProps.valueId
    readonly valueId: ValueIdFromSchema<Schemas[1]>;
    /// ui-svelte.ValueViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
    /// ui-svelte.ValueViewProps.debugIds
    readonly debugIds?: boolean;
  };

  /// ui-svelte.MetricViewProps
  MetricViewProps: {
    /// ui-svelte.MetricViewProps.metricId
    readonly metricId: Id;
    /// ui-svelte.MetricViewProps.metrics
    readonly metrics?: MetricsOrMetricsId<Schemas>;
    /// ui-svelte.MetricViewProps.debugIds
    readonly debugIds?: boolean;
  };

  /// ui-svelte.CheckpointViewProps
  CheckpointViewProps: {
    /// ui-svelte.CheckpointViewProps.checkpointId
    readonly checkpointId: Id;
    /// ui-svelte.CheckpointViewProps.checkpoints
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    /// ui-svelte.CheckpointViewProps.debugIds
    readonly debugIds?: boolean;
  };

  /// ui-svelte.RowViewProps
  RowViewProps: {
    /// ui-svelte.RowViewProps.tableId
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    /// ui-svelte.RowViewProps.rowId
    readonly rowId: Id;
    /// ui-svelte.RowViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
    /// ui-svelte.RowViewProps.customCellIds
    readonly customCellIds?: Ids;
    /// ui-svelte.RowViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.RowViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.RowViewProps.cell
    readonly cell?: Snippet<[cellId: AllCellIdFromSchema<Schemas[0]>]>;
  };

  /// ui-svelte.TableViewProps
  TableViewProps: {
    /// ui-svelte.TableViewProps.tableId
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    /// ui-svelte.TableViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
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
  SortedTableViewProps: {
    /// ui-svelte.SortedTableViewProps.tableId
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    /// ui-svelte.SortedTableViewProps.cellId
    readonly cellId?: AllCellIdFromSchema<Schemas[0]>;
    /// ui-svelte.SortedTableViewProps.descending
    readonly descending?: boolean;
    /// ui-svelte.SortedTableViewProps.offset
    readonly offset?: number;
    /// ui-svelte.SortedTableViewProps.limit
    readonly limit?: number;
    /// ui-svelte.SortedTableViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
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
  TablesViewProps: {
    /// ui-svelte.TablesViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
    /// ui-svelte.TablesViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.TablesViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.TablesViewProps.table
    readonly table?: Snippet<[tableId: TableIdFromSchema<Schemas[0]>]>;
  };

  /// ui-svelte.ValuesViewProps
  ValuesViewProps: {
    /// ui-svelte.ValuesViewProps.store
    readonly store?: StoreOrStoreId<Schemas>;
    /// ui-svelte.ValuesViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.ValuesViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.ValuesViewProps.value
    readonly value?: Snippet<[valueId: ValueIdFromSchema<Schemas[1]>]>;
  };

  /// ui-svelte.IndexViewProps
  IndexViewProps: {
    /// ui-svelte.IndexViewProps.indexId
    readonly indexId: Id;
    /// ui-svelte.IndexViewProps.indexes
    readonly indexes?: IndexesOrIndexesId<Schemas>;
    /// ui-svelte.IndexViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.IndexViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.IndexViewProps.slice
    readonly slice?: Snippet<[sliceId: Id]>;
  };

  /// ui-svelte.SliceViewProps
  SliceViewProps: {
    /// ui-svelte.SliceViewProps.indexId
    readonly indexId: Id;
    /// ui-svelte.SliceViewProps.sliceId
    readonly sliceId: Id;
    /// ui-svelte.SliceViewProps.indexes
    readonly indexes?: IndexesOrIndexesId<Schemas>;
    /// ui-svelte.SliceViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.SliceViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.SliceViewProps.row
    readonly row?: Snippet<[rowId: Id]>;
  };

  /// ui-svelte.RemoteRowViewProps
  RemoteRowViewProps: {
    /// ui-svelte.RemoteRowViewProps.relationshipId
    readonly relationshipId: Id;
    /// ui-svelte.RemoteRowViewProps.localRowId
    readonly localRowId: Id;
    /// ui-svelte.RemoteRowViewProps.relationships
    readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
    /// ui-svelte.RemoteRowViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.RemoteRowViewProps.row
    readonly row?: Snippet<[rowId: Id]>;
  };

  /// ui-svelte.LocalRowsViewProps
  LocalRowsViewProps: {
    /// ui-svelte.LocalRowsViewProps.relationshipId
    readonly relationshipId: Id;
    /// ui-svelte.LocalRowsViewProps.remoteRowId
    readonly remoteRowId: Id;
    /// ui-svelte.LocalRowsViewProps.relationships
    readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
    /// ui-svelte.LocalRowsViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.LocalRowsViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.LocalRowsViewProps.row
    readonly row?: Snippet<[rowId: Id]>;
  };

  /// ui-svelte.LinkedRowsViewProps
  LinkedRowsViewProps: {
    /// ui-svelte.LinkedRowsViewProps.relationshipId
    readonly relationshipId: Id;
    /// ui-svelte.LinkedRowsViewProps.firstRowId
    readonly firstRowId: Id;
    /// ui-svelte.LinkedRowsViewProps.relationships
    readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
    /// ui-svelte.LinkedRowsViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.LinkedRowsViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.LinkedRowsViewProps.row
    readonly row?: Snippet<[rowId: Id]>;
  };

  /// ui-svelte.ResultCellViewProps
  ResultCellViewProps: {
    /// ui-svelte.ResultCellViewProps.queryId
    readonly queryId: Id;
    /// ui-svelte.ResultCellViewProps.rowId
    readonly rowId: Id;
    /// ui-svelte.ResultCellViewProps.cellId
    readonly cellId: Id;
    /// ui-svelte.ResultCellViewProps.queries
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ui-svelte.ResultCellViewProps.debugIds
    readonly debugIds?: boolean;
  };

  /// ui-svelte.ResultRowViewProps
  ResultRowViewProps: {
    /// ui-svelte.ResultRowViewProps.queryId
    readonly queryId: Id;
    /// ui-svelte.ResultRowViewProps.rowId
    readonly rowId: Id;
    /// ui-svelte.ResultRowViewProps.queries
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ui-svelte.ResultRowViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.ResultRowViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.ResultRowViewProps.cell
    readonly cell?: Snippet<[cellId: Id]>;
  };

  /// ui-svelte.ResultTableViewProps
  ResultTableViewProps: {
    /// ui-svelte.ResultTableViewProps.queryId
    readonly queryId: Id;
    /// ui-svelte.ResultTableViewProps.queries
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ui-svelte.ResultTableViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.ResultTableViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.ResultTableViewProps.row
    readonly row?: Snippet<[rowId: Id]>;
  };

  /// ui-svelte.ResultSortedTableViewProps
  ResultSortedTableViewProps: {
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
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ui-svelte.ResultSortedTableViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.ResultSortedTableViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.ResultSortedTableViewProps.row
    readonly row?: Snippet<[rowId: Id]>;
  };

  /// ui-svelte.BackwardCheckpointsViewProps
  BackwardCheckpointsViewProps: {
    /// ui-svelte.BackwardCheckpointsViewProps.checkpoints
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    /// ui-svelte.BackwardCheckpointsViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.BackwardCheckpointsViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.BackwardCheckpointsViewProps.checkpoint
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  };

  /// ui-svelte.ForwardCheckpointsViewProps
  ForwardCheckpointsViewProps: {
    /// ui-svelte.ForwardCheckpointsViewProps.checkpoints
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    /// ui-svelte.ForwardCheckpointsViewProps.separator
    readonly separator?: Snippet<[]>;
    /// ui-svelte.ForwardCheckpointsViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.ForwardCheckpointsViewProps.checkpoint
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  };

  /// ui-svelte.CurrentCheckpointViewProps
  CurrentCheckpointViewProps: {
    /// ui-svelte.CurrentCheckpointViewProps.checkpoints
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    /// ui-svelte.CurrentCheckpointViewProps.debugIds
    readonly debugIds?: boolean;
    /// ui-svelte.CurrentCheckpointViewProps.checkpoint
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  };

  /// ui-svelte.Provider
  Provider: Component<WithSchemas<Schemas>['ProviderProps']>;

  /// ui-svelte.CellView
  CellView: Component<WithSchemas<Schemas>['CellViewProps']>;

  /// ui-svelte.ValueView
  ValueView: Component<WithSchemas<Schemas>['ValueViewProps']>;

  /// ui-svelte.RowView
  RowView: Component<WithSchemas<Schemas>['RowViewProps']>;

  /// ui-svelte.TableView
  TableView: Component<WithSchemas<Schemas>['TableViewProps']>;

  /// ui-svelte.SortedTableView
  SortedTableView: Component<WithSchemas<Schemas>['SortedTableViewProps']>;

  /// ui-svelte.TablesView
  TablesView: Component<WithSchemas<Schemas>['TablesViewProps']>;

  /// ui-svelte.ValuesView
  ValuesView: Component<WithSchemas<Schemas>['ValuesViewProps']>;

  /// ui-svelte.MetricView
  MetricView: Component<WithSchemas<Schemas>['MetricViewProps']>;

  /// ui-svelte.IndexView
  IndexView: Component<WithSchemas<Schemas>['IndexViewProps']>;

  /// ui-svelte.SliceView
  SliceView: Component<WithSchemas<Schemas>['SliceViewProps']>;

  /// ui-svelte.RemoteRowView
  RemoteRowView: Component<WithSchemas<Schemas>['RemoteRowViewProps']>;

  /// ui-svelte.LocalRowsView
  LocalRowsView: Component<WithSchemas<Schemas>['LocalRowsViewProps']>;

  /// ui-svelte.LinkedRowsView
  LinkedRowsView: Component<WithSchemas<Schemas>['LinkedRowsViewProps']>;

  /// ui-svelte.ResultCellView
  ResultCellView: Component<WithSchemas<Schemas>['ResultCellViewProps']>;

  /// ui-svelte.ResultRowView
  ResultRowView: Component<WithSchemas<Schemas>['ResultRowViewProps']>;

  /// ui-svelte.ResultTableView
  ResultTableView: Component<WithSchemas<Schemas>['ResultTableViewProps']>;

  /// ui-svelte.ResultSortedTableView
  ResultSortedTableView: Component<
    WithSchemas<Schemas>['ResultSortedTableViewProps']
  >;

  /// ui-svelte.CheckpointView
  CheckpointView: Component<WithSchemas<Schemas>['CheckpointViewProps']>;

  /// ui-svelte.BackwardCheckpointsView
  BackwardCheckpointsView: Component<
    WithSchemas<Schemas>['BackwardCheckpointsViewProps']
  >;

  /// ui-svelte.ForwardCheckpointsView
  ForwardCheckpointsView: Component<
    WithSchemas<Schemas>['ForwardCheckpointsViewProps']
  >;

  /// ui-svelte.CurrentCheckpointView
  CurrentCheckpointView: Component<
    WithSchemas<Schemas>['CurrentCheckpointViewProps']
  >;

  /// ui-svelte.createHasTables
  createHasTables: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.createTables
  createTables: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: Tables<Schemas[0]>;
  };

  /// ui-svelte.createTableIds
  createTableIds: (storeOrStoreId?: StoreOrStoreId<Schemas>) => {
    readonly current: TableIdFromSchema<Schemas[0]>[];
  };

  /// ui-svelte.createHasTable
  createHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.createTable
  createTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Table<Schemas[0], TableId>};

  /// ui-svelte.createTableCellIds
  createTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.createHasTableCell
  createHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    cellId: MaybeGetter<CellIdFromSchema<Schemas[0], TableId>>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.createRowCount
  createRowCount: (
    tableId: MaybeGetter<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: number};

  /// ui-svelte.createRowIds
  createRowIds: (
    tableId: MaybeGetter<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createSortedRowIds
  createSortedRowIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    cellId?: MaybeGetter<CellIdFromSchema<Schemas[0], TableId> | undefined>,
    descending?: MaybeGetter<boolean>,
    offset?: MaybeGetter<number>,
    limit?: MaybeGetter<number | undefined>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createHasRow
  createHasRow: (
    tableId: MaybeGetter<TableIdFromSchema<Schemas[0]>>,
    rowId: MaybeGetter<Id>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.createRow
  createRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Row<Schemas[0], TableId>};

  /// ui-svelte.createCellIds
  createCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.createHasCell
  createHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    cellId: MaybeGetter<CellId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.createCell
  createCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    cellId: MaybeGetter<CellId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    get current(): NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>;
    set current(v: Cell<Schemas[0], TableId, CellId>);
  };

  /// ui-svelte.createHasValues
  createHasValues: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.createValues
  createValues: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: Values<Schemas[1]>;
  };

  /// ui-svelte.createValueIds
  createValueIds: (storeOrStoreId?: StoreOrStoreId<Schemas>) => {
    readonly current: ValueIdFromSchema<Schemas[1]>[];
  };

  /// ui-svelte.createHasValue
  createHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeGetter<ValueId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.createValue
  createValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeGetter<ValueId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    get current(): NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
    set current(v: Value<Schemas[1], ValueId>);
  };

  /// ui-svelte.getStore
  getStore: (id?: Id) => Store<Schemas> | undefined;

  /// ui-svelte.resolveStore
  resolveStore: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => () => Store<Schemas> | undefined;

  /// ui-svelte.createStoreIds
  createStoreIds: () => {readonly current: Ids};

  /// ui-svelte.getMetrics
  getMetrics: (id?: Id) => Metrics<Schemas> | undefined;

  /// ui-svelte.resolveMetrics
  resolveMetrics: (
    metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId<Schemas> | undefined>,
  ) => () => Metrics<Schemas> | undefined;

  /// ui-svelte.createMetricsIds
  createMetricsIds: () => {readonly current: Ids};

  /// ui-svelte.createMetricIds
  createMetricIds: (
    metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId<Schemas> | undefined>,
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.createMetric
  createMetric: (
    metricId: MaybeGetter<Id>,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => {readonly current: number | undefined};

  /// ui-svelte.getIndexes
  getIndexes: (id?: Id) => Indexes<Schemas> | undefined;

  /// ui-svelte.resolveIndexes
  resolveIndexes: (
    indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId<Schemas> | undefined>,
  ) => () => Indexes<Schemas> | undefined;

  /// ui-svelte.getIndexStoreTableId
  getIndexStoreTableId: (
    indexesOrId: MaybeGetter<IndexesOrIndexesId<Schemas> | undefined>,
    indexId: MaybeGetter<Id>,
  ) => {
    readonly store: Store<Schemas> | undefined;
    readonly tableId: Id | undefined;
  };

  /// ui-svelte.createIndexesIds
  createIndexesIds: () => {readonly current: Ids};

  /// ui-svelte.createIndexIds
  createIndexIds: (
    indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId<Schemas> | undefined>,
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.createSliceIds
  createSliceIds: (
    indexId: MaybeGetter<Id>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createSliceRowIds
  createSliceRowIds: (
    indexId: MaybeGetter<Id>,
    sliceId: MaybeGetter<Id>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.getQueries
  getQueries: (id?: Id) => Queries<Schemas> | undefined;

  /// ui-svelte.resolveQueries
  resolveQueries: (
    queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId<Schemas> | undefined>,
  ) => () => Queries<Schemas> | undefined;

  /// ui-svelte.createQueriesIds
  createQueriesIds: () => {readonly current: Ids};

  /// ui-svelte.createQueryIds
  createQueryIds: (
    queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId<Schemas> | undefined>,
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.createResultTable
  createResultTable: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultTable};

  /// ui-svelte.createResultTableCellIds
  createResultTableCellIds: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createResultRowCount
  createResultRowCount: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: number};

  /// ui-svelte.createResultRowIds
  createResultRowIds: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createResultSortedRowIds
  createResultSortedRowIds: (
    queryId: MaybeGetter<Id>,
    cellId?: MaybeGetter<Id | undefined>,
    descending?: MaybeGetter<boolean>,
    offset?: MaybeGetter<number>,
    limit?: MaybeGetter<number | undefined>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createResultRow
  createResultRow: (
    queryId: MaybeGetter<Id>,
    rowId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultRow};

  /// ui-svelte.createResultCellIds
  createResultCellIds: (
    queryId: MaybeGetter<Id>,
    rowId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createResultCell
  createResultCell: (
    queryId: MaybeGetter<Id>,
    rowId: MaybeGetter<Id>,
    cellId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultCell | undefined};

  /// ui-svelte.getRelationships
  getRelationships: (id?: Id) => Relationships<Schemas> | undefined;

  /// ui-svelte.resolveRelationships
  resolveRelationships: (
    relationshipsOrRelationshipsId?: MaybeGetter<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => () => Relationships<Schemas> | undefined;

  /// ui-svelte.getRelationshipsStoreTableIds
  getRelationshipsStoreTableIds: (
    relationshipsOrId: MaybeGetter<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
    relationshipId: MaybeGetter<Id>,
  ) => {
    readonly store: Store<Schemas> | undefined;
    readonly localTableId: Id | undefined;
    readonly remoteTableId: Id | undefined;
  };

  /// ui-svelte.createRelationshipsIds
  createRelationshipsIds: () => {readonly current: Ids};

  /// ui-svelte.createRelationshipIds
  createRelationshipIds: (
    relationshipsOrRelationshipsId?: MaybeGetter<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => {readonly current: Ids};

  /// ui-svelte.createRemoteRowId
  createRemoteRowId: (
    relationshipId: MaybeGetter<Id>,
    localRowId: MaybeGetter<Id>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Id | undefined};

  /// ui-svelte.createLocalRowIds
  createLocalRowIds: (
    relationshipId: MaybeGetter<Id>,
    remoteRowId: MaybeGetter<Id>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.createLinkedRowIds
  createLinkedRowIds: (
    relationshipId: MaybeGetter<Id>,
    firstRowId: MaybeGetter<Id>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.getCheckpoints
  getCheckpoints: (id?: Id) => Checkpoints<Schemas> | undefined;

  /// ui-svelte.resolveCheckpoints
  resolveCheckpoints: (
    checkpointsOrCheckpointsId?: MaybeGetter<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => () => Checkpoints<Schemas> | undefined;

  /// ui-svelte.createCheckpointsIds
  createCheckpointsIds: () => {readonly current: Ids};

  /// ui-svelte.createCheckpointIds
  createCheckpointIds: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => {readonly current: CheckpointIds};

  /// ui-svelte.createCheckpoint
  createCheckpoint: (
    checkpointId: MaybeGetter<Id>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => {readonly current: string | undefined};

  /// ui-svelte.createGoBackwardCallback
  createGoBackwardCallback: (
    checkpointsOrCheckpointsId?: MaybeGetter<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => () => void;

  /// ui-svelte.createGoForwardCallback
  createGoForwardCallback: (
    checkpointsOrCheckpointsId?: MaybeGetter<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => () => void;

  /// ui-svelte.getPersister
  getPersister: (id?: Id) => AnyPersister<Schemas> | undefined;

  /// ui-svelte.resolvePersister
  resolvePersister: (
    persisterOrPersisterId?: MaybeGetter<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => () => AnyPersister<Schemas> | undefined;

  /// ui-svelte.createPersisterIds
  createPersisterIds: () => {readonly current: Ids};

  /// ui-svelte.createPersisterStatus
  createPersisterStatus: (
    persisterOrPersisterId?: MaybeGetter<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => {
    readonly current: Status;
  };

  /// ui-svelte.getSynchronizer
  getSynchronizer: (id?: Id) => Synchronizer<Schemas> | undefined;

  /// ui-svelte.resolveSynchronizer
  resolveSynchronizer: (
    synchronizerOrSynchronizerId?: MaybeGetter<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => () => Synchronizer<Schemas> | undefined;

  /// ui-svelte.createSynchronizerIds
  createSynchronizerIds: () => {readonly current: Ids};

  /// ui-svelte.createSynchronizerStatus
  createSynchronizerStatus: (
    synchronizerOrSynchronizerId?: MaybeGetter<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => {readonly current: Status};

  /// ui-svelte.onHasTables
  onHasTables: (
    listener: HasTablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onTables
  onTables: (
    listener: TablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onTableIds
  onTableIds: (
    listener: TableIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onHasTable
  onHasTable: <TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: HasTableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onTable
  onTable: <TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onTableCellIds
  onTableCellIds: <TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: TableCellIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onHasTableCell
  onHasTableCell: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    cellId: MaybeGetter<CellIdOrNull>,
    listener: HasTableCellListener<Schemas, TableIdOrNull, CellIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onRowCount
  onRowCount: <TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: RowCountListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onRowIds
  onRowIds: <TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onSortedRowIds
  onSortedRowIds: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellIdOrUndefined extends CellIdFromSchema<Schemas[0], TableId> | undefined,
  >(
    tableId: MaybeGetter<TableId>,
    cellId: MaybeGetter<CellIdOrUndefined>,
    descending: MaybeGetter<boolean>,
    offset: MaybeGetter<number>,
    limit: MaybeGetter<number | undefined>,
    listener: SortedRowIdsListener<Schemas, TableId, CellIdOrUndefined>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onHasRow
  onHasRow: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    listener: HasRowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onRow
  onRow: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onCellIds
  onCellIds: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    listener: CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onHasCell
  onHasCell: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    cellId: MaybeGetter<CellIdOrNull>,
    listener: HasCellListener<
      Schemas,
      TableIdOrNull,
      RowIdOrNull,
      CellIdOrNull
    >,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onCell
  onCell: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    cellId: MaybeGetter<CellIdOrNull>,
    listener: CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onHasValues
  onHasValues: (
    listener: HasValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onValues
  onValues: (
    listener: ValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onValueIds
  onValueIds: (
    listener: ValueIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onHasValue
  onHasValue: <ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null>(
    valueId: MaybeGetter<ValueIdOrNull>,
    listener: HasValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onValue
  onValue: <ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null>(
    valueId: MaybeGetter<ValueIdOrNull>,
    listener: ValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onStartTransaction
  onStartTransaction: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onWillFinishTransaction
  onWillFinishTransaction: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onDidFinishTransaction
  onDidFinishTransaction: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.onMetric
  onMetric: (
    metricId: MaybeGetter<IdOrNull>,
    listener: MetricListener<Schemas>,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => void;

  /// ui-svelte.onSliceIds
  onSliceIds: (
    indexId: MaybeGetter<IdOrNull>,
    listener: SliceIdsListener<Schemas>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-svelte.onSliceRowIds
  onSliceRowIds: (
    indexId: MaybeGetter<IdOrNull>,
    sliceId: MaybeGetter<IdOrNull>,
    listener: SliceRowIdsListener<Schemas>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-svelte.onRemoteRowId
  onRemoteRowId: (
    relationshipId: MaybeGetter<IdOrNull>,
    localRowId: MaybeGetter<IdOrNull>,
    listener: RemoteRowIdListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.onLocalRowIds
  onLocalRowIds: (
    relationshipId: MaybeGetter<IdOrNull>,
    remoteRowId: MaybeGetter<IdOrNull>,
    listener: LocalRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.onLinkedRowIds
  onLinkedRowIds: (
    relationshipId: MaybeGetter<Id>,
    firstRowId: MaybeGetter<Id>,
    listener: LinkedRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.onResultTable
  onResultTable: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultTableListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultTableCellIds
  onResultTableCellIds: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultTableCellIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultRowCount
  onResultRowCount: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultRowCountListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultRowIds
  onResultRowIds: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultRowIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultSortedRowIds
  onResultSortedRowIds: (
    queryId: MaybeGetter<Id>,
    cellId: MaybeGetter<Id | undefined>,
    descending: MaybeGetter<boolean>,
    offset: MaybeGetter<number>,
    limit: MaybeGetter<number | undefined>,
    listener: ResultSortedRowIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultRow
  onResultRow: (
    queryId: MaybeGetter<IdOrNull>,
    rowId: MaybeGetter<IdOrNull>,
    listener: ResultRowListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultCellIds
  onResultCellIds: (
    queryId: MaybeGetter<IdOrNull>,
    rowId: MaybeGetter<IdOrNull>,
    listener: ResultCellIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onResultCell
  onResultCell: (
    queryId: MaybeGetter<IdOrNull>,
    rowId: MaybeGetter<IdOrNull>,
    cellId: MaybeGetter<IdOrNull>,
    listener: ResultCellListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onParamValues
  onParamValues: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ParamValuesListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onParamValue
  onParamValue: (
    queryId: MaybeGetter<IdOrNull>,
    paramId: MaybeGetter<IdOrNull>,
    listener: ParamValueListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.onCheckpointIds
  onCheckpointIds: (
    listener: CheckpointIdsListener<Schemas>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// ui-svelte.onCheckpoint
  onCheckpoint: (
    checkpointId: MaybeGetter<IdOrNull>,
    listener: CheckpointListener<Schemas>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// ui-svelte.onPersisterStatus
  onPersisterStatus: (
    listener: StatusListener<Schemas>,
    persisterOrPersisterId?: MaybeGetter<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => void;

  /// ui-svelte.onSynchronizerStatus
  onSynchronizerStatus: (
    listener: StatusListener<Schemas>,
    synchronizerOrSynchronizerId?: MaybeGetter<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => void;

  /// ui-svelte.provideStore
  provideStore: (storeId: Id, store: Store<Schemas>) => void;

  /// ui-svelte.provideMetrics
  provideMetrics: (metricsId: Id, metrics: Metrics<Schemas>) => void;

  /// ui-svelte.provideIndexes
  provideIndexes: (indexesId: Id, indexes: Indexes<Schemas>) => void;

  /// ui-svelte.provideRelationships
  provideRelationships: (
    relationshipsId: Id,
    relationships: Relationships<Schemas>,
  ) => void;

  /// ui-svelte.provideQueries
  provideQueries: (queriesId: Id, queries: Queries<Schemas>) => void;

  /// ui-svelte.provideCheckpoints
  provideCheckpoints: (
    checkpointsId: Id,
    checkpoints: Checkpoints<Schemas>,
  ) => void;

  /// ui-svelte.providePersister
  providePersister: (persisterId: Id, persister: AnyPersister<Schemas>) => void;

  /// ui-svelte.provideSynchronizer
  provideSynchronizer: (
    synchronizerId: Id,
    synchronizer: Synchronizer<Schemas>,
  ) => void;
};
