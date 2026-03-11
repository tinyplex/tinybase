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

  /// ui-svelte.useHasTables
  useHasTables: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.useTables
  useTables: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: Tables<Schemas[0]>;
  };

  /// ui-svelte.useTableIds
  useTableIds: (storeOrStoreId?: StoreOrStoreId<Schemas>) => {
    readonly current: TableIdFromSchema<Schemas[0]>[];
  };

  /// ui-svelte.useHasTable
  useHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useTable
  useTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Table<Schemas[0], TableId>};

  /// ui-svelte.useTableCellIds
  useTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.useHasTableCell
  useHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    cellId: MaybeGetter<CellIdFromSchema<Schemas[0], TableId>>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useRowCount
  useRowCount: (
    tableId: MaybeGetter<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: number};

  /// ui-svelte.useRowIds
  useRowIds: (
    tableId: MaybeGetter<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useSortedRowIds
  useSortedRowIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    cellId?: MaybeGetter<CellIdFromSchema<Schemas[0], TableId> | undefined>,
    descending?: MaybeGetter<boolean>,
    offset?: MaybeGetter<number>,
    limit?: MaybeGetter<number | undefined>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useHasRow
  useHasRow: (
    tableId: MaybeGetter<TableIdFromSchema<Schemas[0]>>,
    rowId: MaybeGetter<Id>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useRow
  useRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Row<Schemas[0], TableId>};

  /// ui-svelte.useCellIds
  useCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.useHasCell
  useHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    cellId: MaybeGetter<CellId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useCell
  useCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeGetter<TableId>,
    rowId: MaybeGetter<Id>,
    cellId: MaybeGetter<CellId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    readonly current: NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>;
  };

  /// ui-svelte.useBindableCell
  useBindableCell: <
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

  /// ui-svelte.useHasValues
  useHasValues: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.useValues
  useValues: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => {
    readonly current: Values<Schemas[1]>;
  };

  /// ui-svelte.useValueIds
  useValueIds: (storeOrStoreId?: StoreOrStoreId<Schemas>) => {
    readonly current: ValueIdFromSchema<Schemas[1]>[];
  };

  /// ui-svelte.useHasValue
  useHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeGetter<ValueId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useValue
  useValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeGetter<ValueId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    readonly current: NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
  };

  /// ui-svelte.useBindableValue
  useBindableValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeGetter<ValueId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    get current(): NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
    set current(v: Value<Schemas[1], ValueId>);
  };

  /// ui-svelte.useStore
  useStore: (id?: Id) => Store<Schemas> | undefined;

  /// ui-svelte.useStoreOrStoreById
  useStoreOrStoreById: (
    storeOrStoreId?: MaybeGetter<StoreOrStoreId<Schemas> | undefined>,
  ) => () => Store<Schemas> | undefined;

  /// ui-svelte.useStoreIds
  useStoreIds: () => {readonly current: Ids};

  /// ui-svelte.useMetrics
  useMetrics: (id?: Id) => Metrics<Schemas> | undefined;

  /// ui-svelte.useMetricsOrMetricsById
  useMetricsOrMetricsById: (
    metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId<Schemas> | undefined>,
  ) => () => Metrics<Schemas> | undefined;

  /// ui-svelte.useMetricsIds
  useMetricsIds: () => {readonly current: Ids};

  /// ui-svelte.useMetricIds
  useMetricIds: (
    metricsOrMetricsId?: MaybeGetter<MetricsOrMetricsId<Schemas> | undefined>,
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useMetric
  useMetric: (
    metricId: MaybeGetter<Id>,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => {readonly current: number | undefined};

  /// ui-svelte.useIndexes
  useIndexes: (id?: Id) => Indexes<Schemas> | undefined;

  /// ui-svelte.useIndexesOrIndexesById
  useIndexesOrIndexesById: (
    indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId<Schemas> | undefined>,
  ) => () => Indexes<Schemas> | undefined;

  /// ui-svelte.useIndexStoreTableId
  useIndexStoreTableId: (
    indexesOrId: MaybeGetter<IndexesOrIndexesId<Schemas> | undefined>,
    indexId: MaybeGetter<Id>,
  ) => {
    readonly store: Store<Schemas> | undefined;
    readonly tableId: Id | undefined;
  };

  /// ui-svelte.useIndexesIds
  useIndexesIds: () => {readonly current: Ids};

  /// ui-svelte.useIndexIds
  useIndexIds: (
    indexesOrIndexesId?: MaybeGetter<IndexesOrIndexesId<Schemas> | undefined>,
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useSliceIds
  useSliceIds: (
    indexId: MaybeGetter<Id>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useSliceRowIds
  useSliceRowIds: (
    indexId: MaybeGetter<Id>,
    sliceId: MaybeGetter<Id>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useQueries
  useQueries: (id?: Id) => Queries<Schemas> | undefined;

  /// ui-svelte.useQueriesOrQueriesById
  useQueriesOrQueriesById: (
    queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId<Schemas> | undefined>,
  ) => () => Queries<Schemas> | undefined;

  /// ui-svelte.useQueriesIds
  useQueriesIds: () => {readonly current: Ids};

  /// ui-svelte.useQueryIds
  useQueryIds: (
    queriesOrQueriesId?: MaybeGetter<QueriesOrQueriesId<Schemas> | undefined>,
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useResultTable
  useResultTable: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultTable};

  /// ui-svelte.useResultTableCellIds
  useResultTableCellIds: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultRowCount
  useResultRowCount: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: number};

  /// ui-svelte.useResultRowIds
  useResultRowIds: (
    queryId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultSortedRowIds
  useResultSortedRowIds: (
    queryId: MaybeGetter<Id>,
    cellId?: MaybeGetter<Id | undefined>,
    descending?: MaybeGetter<boolean>,
    offset?: MaybeGetter<number>,
    limit?: MaybeGetter<number | undefined>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultRow
  useResultRow: (
    queryId: MaybeGetter<Id>,
    rowId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultRow};

  /// ui-svelte.useResultCellIds
  useResultCellIds: (
    queryId: MaybeGetter<Id>,
    rowId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultCell
  useResultCell: (
    queryId: MaybeGetter<Id>,
    rowId: MaybeGetter<Id>,
    cellId: MaybeGetter<Id>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultCell | undefined};

  /// ui-svelte.useRelationships
  useRelationships: (id?: Id) => Relationships<Schemas> | undefined;

  /// ui-svelte.useRelationshipsOrRelationshipsById
  useRelationshipsOrRelationshipsById: (
    relationshipsOrRelationshipsId?: MaybeGetter<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => () => Relationships<Schemas> | undefined;

  /// ui-svelte.useRelationshipsStoreTableIds
  useRelationshipsStoreTableIds: (
    relationshipsOrId: MaybeGetter<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
    relationshipId: MaybeGetter<Id>,
  ) => {
    readonly store: Store<Schemas> | undefined;
    readonly localTableId: Id | undefined;
    readonly remoteTableId: Id | undefined;
  };

  /// ui-svelte.useRelationshipsIds
  useRelationshipsIds: () => {readonly current: Ids};

  /// ui-svelte.useRelationshipIds
  useRelationshipIds: (
    relationshipsOrRelationshipsId?: MaybeGetter<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => {readonly current: Ids};

  /// ui-svelte.useRemoteRowId
  useRemoteRowId: (
    relationshipId: MaybeGetter<Id>,
    localRowId: MaybeGetter<Id>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Id | undefined};

  /// ui-svelte.useLocalRowIds
  useLocalRowIds: (
    relationshipId: MaybeGetter<Id>,
    remoteRowId: MaybeGetter<Id>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useLinkedRowIds
  useLinkedRowIds: (
    relationshipId: MaybeGetter<Id>,
    firstRowId: MaybeGetter<Id>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useCheckpoints
  useCheckpoints: (id?: Id) => Checkpoints<Schemas> | undefined;

  /// ui-svelte.useCheckpointsOrCheckpointsById
  useCheckpointsOrCheckpointsById: (
    checkpointsOrCheckpointsId?: MaybeGetter<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => () => Checkpoints<Schemas> | undefined;

  /// ui-svelte.useCheckpointsIds
  useCheckpointsIds: () => {readonly current: Ids};

  /// ui-svelte.useCheckpointIds
  useCheckpointIds: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => {readonly current: CheckpointIds};

  /// ui-svelte.useCheckpoint
  useCheckpoint: (
    checkpointId: MaybeGetter<Id>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => {readonly current: string | undefined};

  /// ui-svelte.useGoBackwardCallback
  useGoBackwardCallback: (
    checkpointsOrCheckpointsId?: MaybeGetter<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => () => void;

  /// ui-svelte.useGoForwardCallback
  useGoForwardCallback: (
    checkpointsOrCheckpointsId?: MaybeGetter<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => () => void;

  /// ui-svelte.usePersister
  usePersister: (id?: Id) => AnyPersister<Schemas> | undefined;

  /// ui-svelte.usePersisterOrPersisterById
  usePersisterOrPersisterById: (
    persisterOrPersisterId?: MaybeGetter<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => () => AnyPersister<Schemas> | undefined;

  /// ui-svelte.usePersisterIds
  usePersisterIds: () => {readonly current: Ids};

  /// ui-svelte.usePersisterStatus
  usePersisterStatus: (
    persisterOrPersisterId?: MaybeGetter<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => {
    readonly current: Status;
  };

  /// ui-svelte.useSynchronizer
  useSynchronizer: (id?: Id) => Synchronizer<Schemas> | undefined;

  /// ui-svelte.useSynchronizerOrSynchronizerById
  useSynchronizerOrSynchronizerById: (
    synchronizerOrSynchronizerId?: MaybeGetter<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => () => Synchronizer<Schemas> | undefined;

  /// ui-svelte.useSynchronizerIds
  useSynchronizerIds: () => {readonly current: Ids};

  /// ui-svelte.useSynchronizerStatus
  useSynchronizerStatus: (
    synchronizerOrSynchronizerId?: MaybeGetter<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => {readonly current: Status};

  /// ui-svelte.useHasTablesListener
  useHasTablesListener: (
    listener: HasTablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useTablesListener
  useTablesListener: (
    listener: TablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useTableIdsListener
  useTableIdsListener: (
    listener: TableIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useHasTableListener
  useHasTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: HasTableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useTableListener
  useTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useTableCellIdsListener
  useTableCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: TableCellIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useHasTableCellListener
  useHasTableCellListener: <
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

  /// ui-svelte.useRowCountListener
  useRowCountListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: RowCountListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useRowIdsListener
  useRowIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useSortedRowIdsListener
  useSortedRowIdsListener: <
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

  /// ui-svelte.useHasRowListener
  useHasRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    listener: HasRowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useRowListener
  useRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useCellIdsListener
  useCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeGetter<TableIdOrNull>,
    rowId: MaybeGetter<RowIdOrNull>,
    listener: CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useHasCellListener
  useHasCellListener: <
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

  /// ui-svelte.useCellListener
  useCellListener: <
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

  /// ui-svelte.useHasValuesListener
  useHasValuesListener: (
    listener: HasValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useValuesListener
  useValuesListener: (
    listener: ValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useValueIdsListener
  useValueIdsListener: (
    listener: ValueIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useHasValueListener
  useHasValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: MaybeGetter<ValueIdOrNull>,
    listener: HasValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useValueListener
  useValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: MaybeGetter<ValueIdOrNull>,
    listener: ValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useStartTransactionListener
  useStartTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useWillFinishTransactionListener
  useWillFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useDidFinishTransactionListener
  useDidFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useMetricListener
  useMetricListener: (
    metricId: MaybeGetter<IdOrNull>,
    listener: MetricListener<Schemas>,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => void;

  /// ui-svelte.useSliceIdsListener
  useSliceIdsListener: (
    indexId: MaybeGetter<IdOrNull>,
    listener: SliceIdsListener<Schemas>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-svelte.useSliceRowIdsListener
  useSliceRowIdsListener: (
    indexId: MaybeGetter<IdOrNull>,
    sliceId: MaybeGetter<IdOrNull>,
    listener: SliceRowIdsListener<Schemas>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-svelte.useRemoteRowIdListener
  useRemoteRowIdListener: (
    relationshipId: MaybeGetter<IdOrNull>,
    localRowId: MaybeGetter<IdOrNull>,
    listener: RemoteRowIdListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.useLocalRowIdsListener
  useLocalRowIdsListener: (
    relationshipId: MaybeGetter<IdOrNull>,
    remoteRowId: MaybeGetter<IdOrNull>,
    listener: LocalRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.useLinkedRowIdsListener
  useLinkedRowIdsListener: (
    relationshipId: MaybeGetter<Id>,
    firstRowId: MaybeGetter<Id>,
    listener: LinkedRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.useResultTableListener
  useResultTableListener: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultTableListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultTableCellIdsListener
  useResultTableCellIdsListener: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultTableCellIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultRowCountListener
  useResultRowCountListener: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultRowCountListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultRowIdsListener
  useResultRowIdsListener: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ResultRowIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultSortedRowIdsListener
  useResultSortedRowIdsListener: (
    queryId: MaybeGetter<Id>,
    cellId: MaybeGetter<Id | undefined>,
    descending: MaybeGetter<boolean>,
    offset: MaybeGetter<number>,
    limit: MaybeGetter<number | undefined>,
    listener: ResultSortedRowIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultRowListener
  useResultRowListener: (
    queryId: MaybeGetter<IdOrNull>,
    rowId: MaybeGetter<IdOrNull>,
    listener: ResultRowListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultCellIdsListener
  useResultCellIdsListener: (
    queryId: MaybeGetter<IdOrNull>,
    rowId: MaybeGetter<IdOrNull>,
    listener: ResultCellIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultCellListener
  useResultCellListener: (
    queryId: MaybeGetter<IdOrNull>,
    rowId: MaybeGetter<IdOrNull>,
    cellId: MaybeGetter<IdOrNull>,
    listener: ResultCellListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useParamValuesListener
  useParamValuesListener: (
    queryId: MaybeGetter<IdOrNull>,
    listener: ParamValuesListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useParamValueListener
  useParamValueListener: (
    queryId: MaybeGetter<IdOrNull>,
    paramId: MaybeGetter<IdOrNull>,
    listener: ParamValueListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useCheckpointIdsListener
  useCheckpointIdsListener: (
    listener: CheckpointIdsListener<Schemas>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// ui-svelte.useCheckpointListener
  useCheckpointListener: (
    checkpointId: MaybeGetter<IdOrNull>,
    listener: CheckpointListener<Schemas>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// ui-svelte.usePersisterStatusListener
  usePersisterStatusListener: (
    listener: StatusListener<Schemas>,
    persisterOrPersisterId?: MaybeGetter<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => void;

  /// ui-svelte.useSynchronizerStatusListener
  useSynchronizerStatusListener: (
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
