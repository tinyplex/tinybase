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
    readonly store?: Store<Schemas>;
    readonly storesById?: {readonly [id: Id]: Store<Schemas>};
    readonly metrics?: Metrics<Schemas>;
    readonly metricsById?: {readonly [id: Id]: Metrics<Schemas>};
    readonly indexes?: Indexes<Schemas>;
    readonly indexesById?: {readonly [id: Id]: Indexes<Schemas>};
    readonly relationships?: Relationships<Schemas>;
    readonly relationshipsById?: {readonly [id: Id]: Relationships<Schemas>};
    readonly queries?: Queries<Schemas>;
    readonly queriesById?: {readonly [id: Id]: Queries<Schemas>};
    readonly checkpoints?: Checkpoints<Schemas>;
    readonly checkpointsById?: {readonly [id: Id]: Checkpoints<Schemas>};
    readonly persister?: AnyPersister<Schemas>;
    readonly persistersById?: {readonly [id: Id]: AnyPersister<Schemas>};
    readonly synchronizer?: Synchronizer<Schemas>;
    readonly synchronizersById?: {readonly [id: Id]: Synchronizer<Schemas>};
    readonly children: Snippet;
  };

  /// ui-svelte.Provider
  Provider: Component<{
    readonly store?: Store<Schemas>;
    readonly storesById?: {readonly [id: Id]: Store<Schemas>};
    readonly metrics?: Metrics<Schemas>;
    readonly metricsById?: {readonly [id: Id]: Metrics<Schemas>};
    readonly indexes?: Indexes<Schemas>;
    readonly indexesById?: {readonly [id: Id]: Indexes<Schemas>};
    readonly relationships?: Relationships<Schemas>;
    readonly relationshipsById?: {readonly [id: Id]: Relationships<Schemas>};
    readonly queries?: Queries<Schemas>;
    readonly queriesById?: {readonly [id: Id]: Queries<Schemas>};
    readonly checkpoints?: Checkpoints<Schemas>;
    readonly checkpointsById?: {readonly [id: Id]: Checkpoints<Schemas>};
    readonly persister?: AnyPersister<Schemas>;
    readonly persistersById?: {readonly [id: Id]: AnyPersister<Schemas>};
    readonly synchronizer?: Synchronizer<Schemas>;
    readonly synchronizersById?: {readonly [id: Id]: Synchronizer<Schemas>};
    readonly children: Snippet;
  }>;

  /// ui-svelte.CellView
  CellView: Component<{
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    readonly rowId: Id;
    readonly cellId: AllCellIdFromSchema<Schemas[0]>;
    readonly store?: StoreOrStoreId<Schemas>;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.ValueView
  ValueView: Component<{
    readonly valueId: ValueIdFromSchema<Schemas[1]>;
    readonly store?: StoreOrStoreId<Schemas>;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.RowView
  RowView: Component<{
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    readonly rowId: Id;
    readonly store?: StoreOrStoreId<Schemas>;
    readonly customCellIds?: Ids;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly cell?: Snippet<[cellId: AllCellIdFromSchema<Schemas[0]>]>;
  }>;

  /// ui-svelte.TableView
  TableView: Component<{
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    readonly store?: StoreOrStoreId<Schemas>;
    readonly customCellIds?: Ids;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.SortedTableView
  SortedTableView: Component<{
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    readonly cellId?: AllCellIdFromSchema<Schemas[0]>;
    readonly descending?: boolean;
    readonly offset?: number;
    readonly limit?: number;
    readonly store?: StoreOrStoreId<Schemas>;
    readonly customCellIds?: Ids;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.TablesView
  TablesView: Component<{
    readonly store?: StoreOrStoreId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly table?: Snippet<[tableId: TableIdFromSchema<Schemas[0]>]>;
  }>;

  /// ui-svelte.ValuesView
  ValuesView: Component<{
    readonly store?: StoreOrStoreId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly value?: Snippet<[valueId: ValueIdFromSchema<Schemas[1]>]>;
  }>;

  /// ui-svelte.MetricView
  MetricView: Component<{
    readonly metricId: Id;
    readonly metrics?: MetricsOrMetricsId<Schemas>;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.IndexView
  IndexView: Component<{
    readonly indexId: Id;
    readonly indexes?: IndexesOrIndexesId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly slice?: Snippet<[sliceId: Id]>;
  }>;

  /// ui-svelte.SliceView
  SliceView: Component<{
    readonly indexId: Id;
    readonly sliceId: Id;
    readonly indexes?: IndexesOrIndexesId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.RemoteRowView
  RemoteRowView: Component<{
    readonly relationshipId: Id;
    readonly localRowId: Id;
    readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.LocalRowsView
  LocalRowsView: Component<{
    readonly relationshipId: Id;
    readonly remoteRowId: Id;
    readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.LinkedRowsView
  LinkedRowsView: Component<{
    readonly relationshipId: Id;
    readonly firstRowId: Id;
    readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.ResultCellView
  ResultCellView: Component<{
    readonly queryId: Id;
    readonly rowId: Id;
    readonly cellId: Id;
    readonly queries?: QueriesOrQueriesId<Schemas>;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.ResultRowView
  ResultRowView: Component<{
    readonly queryId: Id;
    readonly rowId: Id;
    readonly queries?: QueriesOrQueriesId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly cell?: Snippet<[cellId: Id]>;
  }>;

  /// ui-svelte.ResultTableView
  ResultTableView: Component<{
    readonly queryId: Id;
    readonly queries?: QueriesOrQueriesId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.ResultSortedTableView
  ResultSortedTableView: Component<{
    readonly queryId: Id;
    readonly cellId?: Id;
    readonly descending?: boolean;
    readonly offset?: number;
    readonly limit?: number;
    readonly queries?: QueriesOrQueriesId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.CheckpointView
  CheckpointView: Component<{
    readonly checkpointId: Id;
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.BackwardCheckpointsView
  BackwardCheckpointsView: Component<{
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  }>;

  /// ui-svelte.ForwardCheckpointsView
  ForwardCheckpointsView: Component<{
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  }>;

  /// ui-svelte.CurrentCheckpointView
  CurrentCheckpointView: Component<{
    readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
    readonly debugIds?: boolean;
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  }>;

  /// ui-svelte.useHasTables
  useHasTables: (
    storeOrStoreId?:
      | StoreOrStoreId<Schemas>
      | (() => StoreOrStoreId<Schemas> | undefined),
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.useTables
  useTables: (
    storeOrStoreId?:
      | StoreOrStoreId<Schemas>
      | (() => StoreOrStoreId<Schemas> | undefined),
  ) => {
    readonly current: Tables<Schemas[0]>;
  };

  /// ui-svelte.useTableIds
  useTableIds: (storeOrStoreId?: StoreOrStoreId<Schemas>) => {
    readonly current: TableIdFromSchema<Schemas[0]>[];
  };

  /// ui-svelte.useHasTable
  useHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useTable
  useTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Table<Schemas[0], TableId>};

  /// ui-svelte.useTableCellIds
  useTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.useHasTableCell
  useHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    cellId:
      | CellIdFromSchema<Schemas[0], TableId>
      | (() => CellIdFromSchema<Schemas[0], TableId>),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useRowCount
  useRowCount: (
    tableId:
      | TableIdFromSchema<Schemas[0]>
      | (() => TableIdFromSchema<Schemas[0]>),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: number};

  /// ui-svelte.useRowIds
  useRowIds: (
    tableId:
      | TableIdFromSchema<Schemas[0]>
      | (() => TableIdFromSchema<Schemas[0]>),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useSortedRowIds
  useSortedRowIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    cellId?:
      | CellIdFromSchema<Schemas[0], TableId>
      | (() => CellIdFromSchema<Schemas[0], TableId>)
      | undefined,
    descending?: boolean | (() => boolean),
    offset?: number | (() => number),
    limit?: number | (() => number) | undefined,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useHasRow
  useHasRow: (
    tableId:
      | TableIdFromSchema<Schemas[0]>
      | (() => TableIdFromSchema<Schemas[0]>),
    rowId: Id | (() => Id),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useRow
  useRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: Row<Schemas[0], TableId>};

  /// ui-svelte.useCellIds
  useCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.useHasCell
  useHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    cellId: CellId | (() => CellId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useCell
  useCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    cellId: CellId | (() => CellId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    readonly current: NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>;
  };

  /// ui-svelte.useBindableCell
  useBindableCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    cellId: CellId | (() => CellId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    get current(): NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>;
    set current(v: Cell<Schemas[0], TableId, CellId>);
  };

  /// ui-svelte.useHasValues
  useHasValues: (
    storeOrStoreId?:
      | StoreOrStoreId<Schemas>
      | (() => StoreOrStoreId<Schemas> | undefined),
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.useValues
  useValues: (
    storeOrStoreId?:
      | StoreOrStoreId<Schemas>
      | (() => StoreOrStoreId<Schemas> | undefined),
  ) => {
    readonly current: Values<Schemas[1]>;
  };

  /// ui-svelte.useValueIds
  useValueIds: (storeOrStoreId?: StoreOrStoreId<Schemas>) => {
    readonly current: ValueIdFromSchema<Schemas[1]>[];
  };

  /// ui-svelte.useHasValue
  useHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId | (() => ValueId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {readonly current: boolean};

  /// ui-svelte.useValue
  useValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId | (() => ValueId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    readonly current: NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
  };

  /// ui-svelte.useBindableValue
  useBindableValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId | (() => ValueId),
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => {
    get current(): NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
    set current(v: Value<Schemas[1], ValueId>);
  };

  /// ui-svelte.useStore
  useStore: (id?: Id) => Store<Schemas> | undefined;

  /// ui-svelte.useStoreOrStoreById
  useStoreOrStoreById: (
    storeOrStoreId?:
      | StoreOrStoreId<Schemas>
      | (() => StoreOrStoreId<Schemas> | undefined),
  ) => () => Store<Schemas> | undefined;

  /// ui-svelte.useStoreIds
  useStoreIds: () => {readonly current: Ids};

  /// ui-svelte.useMetrics
  useMetrics: (id?: Id) => Metrics<Schemas> | undefined;

  /// ui-svelte.useMetricsOrMetricsById
  useMetricsOrMetricsById: (
    metricsOrMetricsId?:
      | MetricsOrMetricsId<Schemas>
      | (() => MetricsOrMetricsId<Schemas> | undefined),
  ) => () => Metrics<Schemas> | undefined;

  /// ui-svelte.useMetricsIds
  useMetricsIds: () => {readonly current: Ids};

  /// ui-svelte.useMetricIds
  useMetricIds: (
    metricsOrMetricsId?:
      | MetricsOrMetricsId<Schemas>
      | (() => MetricsOrMetricsId<Schemas> | undefined),
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useMetric
  useMetric: (
    metricId: Id | (() => Id),
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => {readonly current: number | undefined};

  /// ui-svelte.useIndexes
  useIndexes: (id?: Id) => Indexes<Schemas> | undefined;

  /// ui-svelte.useIndexesOrIndexesById
  useIndexesOrIndexesById: (
    indexesOrIndexesId?:
      | IndexesOrIndexesId<Schemas>
      | (() => IndexesOrIndexesId<Schemas> | undefined),
  ) => () => Indexes<Schemas> | undefined;

  /// ui-svelte.useIndexStoreTableId
  useIndexStoreTableId: (
    indexesOrId:
      | IndexesOrIndexesId<Schemas>
      | (() => IndexesOrIndexesId<Schemas> | undefined),
    indexId: Id | (() => Id),
  ) => {
    readonly store: Store<Schemas> | undefined;
    readonly tableId: Id | undefined;
  };

  /// ui-svelte.useIndexesIds
  useIndexesIds: () => {readonly current: Ids};

  /// ui-svelte.useIndexIds
  useIndexIds: (
    indexesOrIndexesId?:
      | IndexesOrIndexesId<Schemas>
      | (() => IndexesOrIndexesId<Schemas> | undefined),
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useSliceIds
  useSliceIds: (
    indexId: Id | (() => Id),
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useSliceRowIds
  useSliceRowIds: (
    indexId: Id | (() => Id),
    sliceId: Id | (() => Id),
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useQueries
  useQueries: (id?: Id) => Queries<Schemas> | undefined;

  /// ui-svelte.useQueriesOrQueriesById
  useQueriesOrQueriesById: (
    queriesOrQueriesId?:
      | QueriesOrQueriesId<Schemas>
      | (() => QueriesOrQueriesId<Schemas> | undefined),
  ) => () => Queries<Schemas> | undefined;

  /// ui-svelte.useQueriesIds
  useQueriesIds: () => {readonly current: Ids};

  /// ui-svelte.useQueryIds
  useQueryIds: (
    queriesOrQueriesId?:
      | QueriesOrQueriesId<Schemas>
      | (() => QueriesOrQueriesId<Schemas> | undefined),
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useResultTable
  useResultTable: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultTable};

  /// ui-svelte.useResultTableCellIds
  useResultTableCellIds: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultRowCount
  useResultRowCount: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: number};

  /// ui-svelte.useResultRowIds
  useResultRowIds: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultSortedRowIds
  useResultSortedRowIds: (
    queryId: Id | (() => Id),
    cellId?: Id | (() => Id) | undefined,
    descending?: boolean | (() => boolean),
    offset?: number | (() => number),
    limit?: number | (() => number) | undefined,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultRow
  useResultRow: (
    queryId: Id | (() => Id),
    rowId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultRow};

  /// ui-svelte.useResultCellIds
  useResultCellIds: (
    queryId: Id | (() => Id),
    rowId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultCell
  useResultCell: (
    queryId: Id | (() => Id),
    rowId: Id | (() => Id),
    cellId: Id | (() => Id),
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => {readonly current: ResultCell | undefined};

  /// ui-svelte.useRelationships
  useRelationships: (id?: Id) => Relationships<Schemas> | undefined;

  /// ui-svelte.useRelationshipsOrRelationshipsById
  useRelationshipsOrRelationshipsById: (
    relationshipsOrRelationshipsId?:
      | RelationshipsOrRelationshipsId<Schemas>
      | (() => RelationshipsOrRelationshipsId<Schemas> | undefined),
  ) => () => Relationships<Schemas> | undefined;

  /// ui-svelte.useRelationshipsStoreTableIds
  useRelationshipsStoreTableIds: (
    relationshipsOrId:
      | RelationshipsOrRelationshipsId<Schemas>
      | (() => RelationshipsOrRelationshipsId<Schemas> | undefined),
    relationshipId: Id | (() => Id),
  ) => {
    readonly store: Store<Schemas> | undefined;
    readonly localTableId: Id | undefined;
    readonly remoteTableId: Id | undefined;
  };

  /// ui-svelte.useRelationshipsIds
  useRelationshipsIds: () => {readonly current: Ids};

  /// ui-svelte.useRelationshipIds
  useRelationshipIds: (
    relationshipsOrRelationshipsId?:
      | RelationshipsOrRelationshipsId<Schemas>
      | (() => RelationshipsOrRelationshipsId<Schemas> | undefined),
  ) => {readonly current: Ids};

  /// ui-svelte.useRemoteRowId
  useRemoteRowId: (
    relationshipId: Id | (() => Id),
    localRowId: Id | (() => Id),
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Id | undefined};

  /// ui-svelte.useLocalRowIds
  useLocalRowIds: (
    relationshipId: Id | (() => Id),
    remoteRowId: Id | (() => Id),
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useLinkedRowIds
  useLinkedRowIds: (
    relationshipId: Id | (() => Id),
    firstRowId: Id | (() => Id),
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => {readonly current: Ids};

  /// ui-svelte.useCheckpoints
  useCheckpoints: (id?: Id) => Checkpoints<Schemas> | undefined;

  /// ui-svelte.useCheckpointsOrCheckpointsById
  useCheckpointsOrCheckpointsById: (
    checkpointsOrCheckpointsId?:
      | CheckpointsOrCheckpointsId<Schemas>
      | (() => CheckpointsOrCheckpointsId<Schemas> | undefined),
  ) => () => Checkpoints<Schemas> | undefined;

  /// ui-svelte.useCheckpointsIds
  useCheckpointsIds: () => {readonly current: Ids};

  /// ui-svelte.useCheckpointIds
  useCheckpointIds: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => {readonly current: CheckpointIds};

  /// ui-svelte.useCheckpoint
  useCheckpoint: (
    checkpointId: Id | (() => Id),
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => {readonly current: string | undefined};

  /// ui-svelte.useGoBackwardCallback
  useGoBackwardCallback: (
    checkpointsOrCheckpointsId?:
      | CheckpointsOrCheckpointsId<Schemas>
      | (() => CheckpointsOrCheckpointsId<Schemas> | undefined),
  ) => () => void;

  /// ui-svelte.useGoForwardCallback
  useGoForwardCallback: (
    checkpointsOrCheckpointsId?:
      | CheckpointsOrCheckpointsId<Schemas>
      | (() => CheckpointsOrCheckpointsId<Schemas> | undefined),
  ) => () => void;

  /// ui-svelte.usePersister
  usePersister: (id?: Id) => AnyPersister<Schemas> | undefined;

  /// ui-svelte.usePersisterOrPersisterById
  usePersisterOrPersisterById: (
    persisterOrPersisterId?:
      | PersisterOrPersisterId<Schemas>
      | (() => PersisterOrPersisterId<Schemas> | undefined),
  ) => () => AnyPersister<Schemas> | undefined;

  /// ui-svelte.usePersisterIds
  usePersisterIds: () => {readonly current: Ids};

  /// ui-svelte.usePersisterStatus
  usePersisterStatus: (
    persisterOrPersisterId?: PersisterOrPersisterId<Schemas>,
  ) => {
    readonly current: Status;
  };

  /// ui-svelte.useSynchronizer
  useSynchronizer: (id?: Id) => Synchronizer<Schemas> | undefined;

  /// ui-svelte.useSynchronizerOrSynchronizerById
  useSynchronizerOrSynchronizerById: (
    synchronizerOrSynchronizerId?:
      | SynchronizerOrSynchronizerId<Schemas>
      | (() => SynchronizerOrSynchronizerId<Schemas> | undefined),
  ) => () => Synchronizer<Schemas> | undefined;

  /// ui-svelte.useSynchronizerIds
  useSynchronizerIds: () => {readonly current: Ids};

  /// ui-svelte.useSynchronizerStatus
  useSynchronizerStatus: (
    synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId<Schemas>,
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
    tableId: TableIdOrNull | (() => TableIdOrNull),
    listener: HasTableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useTableListener
  useTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useTableCellIdsListener
  useTableCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
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
    tableId: TableIdOrNull | (() => TableIdOrNull),
    cellId: CellIdOrNull | (() => CellIdOrNull),
    listener: HasTableCellListener<Schemas, TableIdOrNull, CellIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useRowCountListener
  useRowCountListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
    listener: RowCountListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useRowIdsListener
  useRowIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useSortedRowIdsListener
  useSortedRowIdsListener: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellIdOrUndefined extends CellIdFromSchema<Schemas[0], TableId> | undefined,
  >(
    tableId: TableId | (() => TableId),
    cellId: CellIdOrUndefined | (() => CellIdOrUndefined),
    descending: boolean | (() => boolean),
    offset: number | (() => number),
    limit: number | undefined | (() => number | undefined),
    listener: SortedRowIdsListener<Schemas, TableId, CellIdOrUndefined>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useHasRowListener
  useHasRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
    rowId: RowIdOrNull | (() => RowIdOrNull),
    listener: HasRowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useRowListener
  useRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
    rowId: RowIdOrNull | (() => RowIdOrNull),
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useCellIdsListener
  useCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull | (() => TableIdOrNull),
    rowId: RowIdOrNull | (() => RowIdOrNull),
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
    tableId: TableIdOrNull | (() => TableIdOrNull),
    rowId: RowIdOrNull | (() => RowIdOrNull),
    cellId: CellIdOrNull | (() => CellIdOrNull),
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
    tableId: TableIdOrNull | (() => TableIdOrNull),
    rowId: RowIdOrNull | (() => RowIdOrNull),
    cellId: CellIdOrNull | (() => CellIdOrNull),
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
    valueId: ValueIdOrNull | (() => ValueIdOrNull),
    listener: HasValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// ui-svelte.useValueListener
  useValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: ValueIdOrNull | (() => ValueIdOrNull),
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
    metricId: IdOrNull | (() => IdOrNull),
    listener: MetricListener<Schemas>,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => void;

  /// ui-svelte.useSliceIdsListener
  useSliceIdsListener: (
    indexId: IdOrNull | (() => IdOrNull),
    listener: SliceIdsListener<Schemas>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-svelte.useSliceRowIdsListener
  useSliceRowIdsListener: (
    indexId: IdOrNull | (() => IdOrNull),
    sliceId: IdOrNull | (() => IdOrNull),
    listener: SliceRowIdsListener<Schemas>,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-svelte.useRemoteRowIdListener
  useRemoteRowIdListener: (
    relationshipId: IdOrNull | (() => IdOrNull),
    localRowId: IdOrNull | (() => IdOrNull),
    listener: RemoteRowIdListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.useLocalRowIdsListener
  useLocalRowIdsListener: (
    relationshipId: IdOrNull | (() => IdOrNull),
    remoteRowId: IdOrNull | (() => IdOrNull),
    listener: LocalRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.useLinkedRowIdsListener
  useLinkedRowIdsListener: (
    relationshipId: Id | (() => Id),
    firstRowId: Id | (() => Id),
    listener: LinkedRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-svelte.useResultTableListener
  useResultTableListener: (
    queryId: IdOrNull | (() => IdOrNull),
    listener: ResultTableListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultTableCellIdsListener
  useResultTableCellIdsListener: (
    queryId: IdOrNull | (() => IdOrNull),
    listener: ResultTableCellIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultRowCountListener
  useResultRowCountListener: (
    queryId: IdOrNull | (() => IdOrNull),
    listener: ResultRowCountListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultRowIdsListener
  useResultRowIdsListener: (
    queryId: IdOrNull | (() => IdOrNull),
    listener: ResultRowIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultSortedRowIdsListener
  useResultSortedRowIdsListener: (
    queryId: Id | (() => Id),
    cellId: Id | undefined | (() => Id | undefined),
    descending: boolean | (() => boolean),
    offset: number | (() => number),
    limit: number | undefined | (() => number | undefined),
    listener: ResultSortedRowIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultRowListener
  useResultRowListener: (
    queryId: IdOrNull | (() => IdOrNull),
    rowId: IdOrNull | (() => IdOrNull),
    listener: ResultRowListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultCellIdsListener
  useResultCellIdsListener: (
    queryId: IdOrNull | (() => IdOrNull),
    rowId: IdOrNull | (() => IdOrNull),
    listener: ResultCellIdsListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useResultCellListener
  useResultCellListener: (
    queryId: IdOrNull | (() => IdOrNull),
    rowId: IdOrNull | (() => IdOrNull),
    cellId: IdOrNull | (() => IdOrNull),
    listener: ResultCellListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useParamValuesListener
  useParamValuesListener: (
    queryId: IdOrNull | (() => IdOrNull),
    listener: ParamValuesListener<Schemas>,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-svelte.useParamValueListener
  useParamValueListener: (
    queryId: IdOrNull | (() => IdOrNull),
    paramId: IdOrNull | (() => IdOrNull),
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
    checkpointId: IdOrNull | (() => IdOrNull),
    listener: CheckpointListener<Schemas>,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// ui-svelte.usePersisterStatusListener
  usePersisterStatusListener: (
    listener: StatusListener<Schemas>,
    persisterOrPersisterId?: PersisterOrPersisterId<Schemas>,
  ) => void;

  /// ui-svelte.useSynchronizerStatusListener
  useSynchronizerStatusListener: (
    listener: StatusListener<Schemas>,
    synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId<Schemas>,
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
