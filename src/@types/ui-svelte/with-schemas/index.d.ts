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
  CheckpointIds,
  Checkpoints,
} from '../../checkpoints/with-schemas/index.d.ts';
import type {Id, Ids} from '../../common/with-schemas/index.d.ts';
import type {Indexes} from '../../indexes/with-schemas/index.d.ts';
import type {Metrics} from '../../metrics/with-schemas/index.d.ts';
import type {
  AnyPersister,
  Status,
} from '../../persisters/with-schemas/index.d.ts';
import type {
  Queries,
  ResultCell,
  ResultRow,
  ResultTable,
} from '../../queries/with-schemas/index.d.ts';
import type {Relationships} from '../../relationships/with-schemas/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  OptionalSchemas,
  Row,
  Store,
  Table,
  Tables,
  Value,
  Values,
} from '../../store/with-schemas/index.d.ts';
import type {Synchronizer} from '../../synchronizers/with-schemas/index.d.ts';

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// ui-svelte.R
  R: <T>(t: T) => T | (() => T);

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
    readonly store?: Store<Schemas> | Id;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.ValueView
  ValueView: Component<{
    readonly valueId: ValueIdFromSchema<Schemas[1]>;
    readonly store?: Store<Schemas> | Id;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.RowView
  RowView: Component<{
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    readonly rowId: Id;
    readonly store?: Store<Schemas> | Id;
    readonly customCellIds?: Ids;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly cell?: Snippet<[cellId: AllCellIdFromSchema<Schemas[0]>]>;
  }>;

  /// ui-svelte.TableView
  TableView: Component<{
    readonly tableId: TableIdFromSchema<Schemas[0]>;
    readonly store?: Store<Schemas> | Id;
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
    readonly store?: Store<Schemas> | Id;
    readonly customCellIds?: Ids;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.TablesView
  TablesView: Component<{
    readonly store?: Store<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly table?: Snippet<[tableId: TableIdFromSchema<Schemas[0]>]>;
  }>;

  /// ui-svelte.ValuesView
  ValuesView: Component<{
    readonly store?: Store<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly value?: Snippet<[valueId: ValueIdFromSchema<Schemas[1]>]>;
  }>;

  /// ui-svelte.MetricView
  MetricView: Component<{
    readonly metricId: Id;
    readonly metrics?: Metrics<Schemas> | Id;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.IndexView
  IndexView: Component<{
    readonly indexId: Id;
    readonly indexes?: Indexes<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly slice?: Snippet<[sliceId: Id]>;
  }>;

  /// ui-svelte.SliceView
  SliceView: Component<{
    readonly indexId: Id;
    readonly sliceId: Id;
    readonly indexes?: Indexes<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.RemoteRowView
  RemoteRowView: Component<{
    readonly relationshipId: Id;
    readonly localRowId: Id;
    readonly relationships?: Relationships<Schemas> | Id;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.LocalRowsView
  LocalRowsView: Component<{
    readonly relationshipId: Id;
    readonly remoteRowId: Id;
    readonly relationships?: Relationships<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.LinkedRowsView
  LinkedRowsView: Component<{
    readonly relationshipId: Id;
    readonly firstRowId: Id;
    readonly relationships?: Relationships<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.ResultCellView
  ResultCellView: Component<{
    readonly queryId: Id;
    readonly rowId: Id;
    readonly cellId: Id;
    readonly queries?: Queries<Schemas> | Id;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.ResultRowView
  ResultRowView: Component<{
    readonly queryId: Id;
    readonly rowId: Id;
    readonly queries?: Queries<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly cell?: Snippet<[cellId: Id]>;
  }>;

  /// ui-svelte.ResultTableView
  ResultTableView: Component<{
    readonly queryId: Id;
    readonly queries?: Queries<Schemas> | Id;
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
    readonly queries?: Queries<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly row?: Snippet<[rowId: Id]>;
  }>;

  /// ui-svelte.CheckpointView
  CheckpointView: Component<{
    readonly checkpointId: Id;
    readonly checkpoints?: Checkpoints<Schemas> | Id;
    readonly debugIds?: boolean;
  }>;

  /// ui-svelte.BackwardCheckpointsView
  BackwardCheckpointsView: Component<{
    readonly checkpoints?: Checkpoints<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  }>;

  /// ui-svelte.ForwardCheckpointsView
  ForwardCheckpointsView: Component<{
    readonly checkpoints?: Checkpoints<Schemas> | Id;
    readonly separator?: Snippet<[]>;
    readonly debugIds?: boolean;
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  }>;

  /// ui-svelte.CurrentCheckpointView
  CurrentCheckpointView: Component<{
    readonly checkpoints?: Checkpoints<Schemas> | Id;
    readonly debugIds?: boolean;
    readonly checkpoint?: Snippet<[checkpointId: Id]>;
  }>;

  /// ui-svelte.useHasTables
  useHasTables: (
    storeOrStoreId?:
      | Store<Schemas>
      | Id
      | (() => Store<Schemas> | Id | undefined),
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.useTables
  useTables: (
    storeOrStoreId?:
      | Store<Schemas>
      | Id
      | (() => Store<Schemas> | Id | undefined),
  ) => {
    readonly current: Tables<Schemas[0]>;
  };

  /// ui-svelte.useTableIds
  useTableIds: (storeOrStoreId?: Store<Schemas> | Id) => {
    readonly current: TableIdFromSchema<Schemas[0]>[];
  };

  /// ui-svelte.useHasTable
  useHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: boolean};

  /// ui-svelte.useTable
  useTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: Table<Schemas[0], TableId>};

  /// ui-svelte.useTableCellIds
  useTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.useHasTableCell
  useHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    cellId:
      | CellIdFromSchema<Schemas[0], TableId>
      | (() => CellIdFromSchema<Schemas[0], TableId>),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: boolean};

  /// ui-svelte.useRowCount
  useRowCount: (
    tableId:
      | TableIdFromSchema<Schemas[0]>
      | (() => TableIdFromSchema<Schemas[0]>),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: number};

  /// ui-svelte.useRowIds
  useRowIds: (
    tableId:
      | TableIdFromSchema<Schemas[0]>
      | (() => TableIdFromSchema<Schemas[0]>),
    storeOrStoreId?: Store<Schemas> | Id,
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
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useHasRow
  useHasRow: (
    tableId:
      | TableIdFromSchema<Schemas[0]>
      | (() => TableIdFromSchema<Schemas[0]>),
    rowId: Id | (() => Id),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: boolean};

  /// ui-svelte.useRow
  useRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: Row<Schemas[0], TableId>};

  /// ui-svelte.useCellIds
  useCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: CellIdFromSchema<Schemas[0], TableId>[]};

  /// ui-svelte.useHasCell
  useHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    cellId: CellId | (() => CellId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: boolean};

  /// ui-svelte.useCell
  useCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId | (() => TableId),
    rowId: Id | (() => Id),
    cellId: CellId | (() => CellId),
    storeOrStoreId?: Store<Schemas> | Id,
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
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {
    get current(): NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>;
    set current(v: Cell<Schemas[0], TableId, CellId>);
  };

  /// ui-svelte.useHasValues
  useHasValues: (
    storeOrStoreId?:
      | Store<Schemas>
      | Id
      | (() => Store<Schemas> | Id | undefined),
  ) => {
    readonly current: boolean;
  };

  /// ui-svelte.useValues
  useValues: (
    storeOrStoreId?:
      | Store<Schemas>
      | Id
      | (() => Store<Schemas> | Id | undefined),
  ) => {
    readonly current: Values<Schemas[1]>;
  };

  /// ui-svelte.useValueIds
  useValueIds: (storeOrStoreId?: Store<Schemas> | Id) => {
    readonly current: ValueIdFromSchema<Schemas[1]>[];
  };

  /// ui-svelte.useHasValue
  useHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId | (() => ValueId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {readonly current: boolean};

  /// ui-svelte.useValue
  useValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId | (() => ValueId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {
    readonly current: NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
  };

  /// ui-svelte.useBindableValue
  useBindableValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId | (() => ValueId),
    storeOrStoreId?: Store<Schemas> | Id,
  ) => {
    get current(): NoInfer<DefaultedValueFromSchema<Schemas[1], ValueId>>;
    set current(v: Value<Schemas[1], ValueId>);
  };

  /// ui-svelte.useStore
  useStore: (id?: Id) => Store<Schemas> | undefined;

  /// ui-svelte.useStoreIds
  useStoreIds: () => {readonly current: Ids};

  /// ui-svelte.useMetrics
  useMetrics: (id?: Id) => Metrics<Schemas> | undefined;

  /// ui-svelte.useMetricsIds
  useMetricsIds: () => {readonly current: Ids};

  /// ui-svelte.useMetricIds
  useMetricIds: (
    metricsOrMetricsId?:
      | Metrics<Schemas>
      | Id
      | (() => Metrics<Schemas> | Id | undefined),
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useMetric
  useMetric: (
    metricId: Id | (() => Id),
    metricsOrMetricsId?: Metrics<Schemas> | Id,
  ) => {readonly current: number | undefined};

  /// ui-svelte.useIndexes
  useIndexes: (id?: Id) => Indexes<Schemas> | undefined;

  /// ui-svelte.useIndexesIds
  useIndexesIds: () => {readonly current: Ids};

  /// ui-svelte.useIndexIds
  useIndexIds: (
    indexesOrIndexesId?:
      | Indexes<Schemas>
      | Id
      | (() => Indexes<Schemas> | Id | undefined),
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useSliceIds
  useSliceIds: (
    indexId: Id | (() => Id),
    indexesOrIndexesId?: Indexes<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useSliceRowIds
  useSliceRowIds: (
    indexId: Id | (() => Id),
    sliceId: Id | (() => Id),
    indexesOrIndexesId?: Indexes<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useQueries
  useQueries: (id?: Id) => Queries<Schemas> | undefined;

  /// ui-svelte.useQueriesIds
  useQueriesIds: () => {readonly current: Ids};

  /// ui-svelte.useQueryIds
  useQueryIds: (
    queriesOrQueriesId?:
      | Queries<Schemas>
      | Id
      | (() => Queries<Schemas> | Id | undefined),
  ) => {
    readonly current: Ids;
  };

  /// ui-svelte.useResultTable
  useResultTable: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: ResultTable};

  /// ui-svelte.useResultTableCellIds
  useResultTableCellIds: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultRowCount
  useResultRowCount: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: number};

  /// ui-svelte.useResultRowIds
  useResultRowIds: (
    queryId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultSortedRowIds
  useResultSortedRowIds: (
    queryId: Id | (() => Id),
    cellId?: Id | (() => Id) | undefined,
    descending?: boolean | (() => boolean),
    offset?: number | (() => number),
    limit?: number | (() => number) | undefined,
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultRow
  useResultRow: (
    queryId: Id | (() => Id),
    rowId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: ResultRow};

  /// ui-svelte.useResultCellIds
  useResultCellIds: (
    queryId: Id | (() => Id),
    rowId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useResultCell
  useResultCell: (
    queryId: Id | (() => Id),
    rowId: Id | (() => Id),
    cellId: Id | (() => Id),
    queriesOrQueriesId?: Queries<Schemas> | Id,
  ) => {readonly current: ResultCell | undefined};

  /// ui-svelte.useRelationships
  useRelationships: (id?: Id) => Relationships<Schemas> | undefined;

  /// ui-svelte.useRelationshipsIds
  useRelationshipsIds: () => {readonly current: Ids};

  /// ui-svelte.useRelationshipIds
  useRelationshipIds: (
    relationshipsOrRelationshipsId?:
      | Relationships<Schemas>
      | Id
      | (() => Relationships<Schemas> | Id | undefined),
  ) => {readonly current: Ids};

  /// ui-svelte.useRemoteRowId
  useRemoteRowId: (
    relationshipId: Id | (() => Id),
    localRowId: Id | (() => Id),
    relationshipsOrRelationshipsId?: Relationships<Schemas> | Id,
  ) => {readonly current: Id | undefined};

  /// ui-svelte.useLocalRowIds
  useLocalRowIds: (
    relationshipId: Id | (() => Id),
    remoteRowId: Id | (() => Id),
    relationshipsOrRelationshipsId?: Relationships<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useLinkedRowIds
  useLinkedRowIds: (
    relationshipId: Id | (() => Id),
    firstRowId: Id | (() => Id),
    relationshipsOrRelationshipsId?: Relationships<Schemas> | Id,
  ) => {readonly current: Ids};

  /// ui-svelte.useCheckpoints
  useCheckpoints: (id?: Id) => Checkpoints<Schemas> | undefined;

  /// ui-svelte.useCheckpointsIds
  useCheckpointsIds: () => {readonly current: Ids};

  /// ui-svelte.useCheckpointIds
  useCheckpointIds: (
    checkpointsOrCheckpointsId?: Checkpoints<Schemas> | Id,
  ) => {readonly current: CheckpointIds};

  /// ui-svelte.useCheckpoint
  useCheckpoint: (
    checkpointId: Id | (() => Id),
    checkpointsOrCheckpointsId?: Checkpoints<Schemas> | Id,
  ) => {readonly current: string | undefined};

  /// ui-svelte.useGoBackwardCallback
  useGoBackwardCallback: (
    checkpointsOrCheckpointsId?:
      | Checkpoints<Schemas>
      | Id
      | (() => Checkpoints<Schemas> | Id | undefined),
  ) => () => void;

  /// ui-svelte.useGoForwardCallback
  useGoForwardCallback: (
    checkpointsOrCheckpointsId?:
      | Checkpoints<Schemas>
      | Id
      | (() => Checkpoints<Schemas> | Id | undefined),
  ) => () => void;

  /// ui-svelte.usePersister
  usePersister: (id?: Id) => AnyPersister<Schemas> | undefined;

  /// ui-svelte.usePersisterIds
  usePersisterIds: () => {readonly current: Ids};

  /// ui-svelte.usePersisterStatus
  usePersisterStatus: (persisterOrPersisterId?: AnyPersister<Schemas> | Id) => {
    readonly current: Status;
  };

  /// ui-svelte.useSynchronizer
  useSynchronizer: (id?: Id) => Synchronizer<Schemas> | undefined;

  /// ui-svelte.useSynchronizerIds
  useSynchronizerIds: () => {readonly current: Ids};

  /// ui-svelte.useSynchronizerStatus
  useSynchronizerStatus: (
    synchronizerOrSynchronizerId?: Synchronizer<Schemas> | Id,
  ) => {readonly current: Status};

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
