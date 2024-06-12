/// ui-react

import type {
  AllCellIdFromSchema,
  CellIdFromSchema,
  DefaultedValueFromSchema,
  NoInfer,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  BackwardCheckpointsProps,
  CellProps,
  CheckpointProps,
  CheckpointsOrCheckpointsId,
  ComponentReturnType,
  CurrentCheckpointProps,
  ExtraProps,
  ForwardCheckpointsProps,
  GetId,
  IndexProps,
  IndexesOrIndexesId,
  LinkedRowsProps,
  LocalRowsProps,
  MetricProps,
  MetricsOrMetricsId,
  ProviderProps,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  RemoteRowProps,
  ResultCellProps,
  ResultRowProps,
  ResultSortedTableProps,
  ResultTableProps,
  RowProps,
  SliceProps,
  SortedTableProps,
  StoreOrStoreId,
  TableProps,
  TablesProps,
  UndoOrRedoInformation,
  ValueProps,
  ValuesProps,
} from '../../_internal/ui-react/with-schemas/index.d.ts';
import type {
  Callback,
  Id,
  IdOrNull,
  Ids,
  ParameterizedCallback,
} from '../../common/with-schemas/index.d.ts';
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
  MapCell,
  MapValue,
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
import type {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../../checkpoints/with-schemas/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../../indexes/with-schemas/index.d.ts';
import type {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../../relationships/with-schemas/index.d.ts';
import type {
  MetricListener,
  Metrics,
} from '../../metrics/with-schemas/index.d.ts';
import type {
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
import type {MergeableStore} from '../../mergeable-store/with-schemas/index.d.ts';
import type {Persister} from '../../persisters/with-schemas/index.d.ts';
import type {ReactElement} from 'react';
import type {Synchronizer} from '../../synchronizers/with-schemas/index.d.ts';

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// StoreOrStoreId
  StoreOrStoreId: StoreOrStoreId<Schemas>;

  /// MetricsOrMetricsId
  MetricsOrMetricsId: MetricsOrMetricsId<Schemas>;

  /// IndexesOrIndexesId
  IndexesOrIndexesId: IndexesOrIndexesId<Schemas>;

  /// RelationshipsOrRelationshipsId
  RelationshipsOrRelationshipsId: RelationshipsOrRelationshipsId<Schemas>;

  /// QueriesOrQueriesId
  QueriesOrQueriesId: QueriesOrQueriesId<Schemas>;

  /// CheckpointsOrCheckpointsId
  CheckpointsOrCheckpointsId: CheckpointsOrCheckpointsId<Schemas>;

  /// UndoOrRedoInformation
  UndoOrRedoInformation: UndoOrRedoInformation;

  /// useCreateStore
  useCreateStore: (
    create: () => Store<Schemas>,
    createDeps?: React.DependencyList,
  ) => Store<Schemas>;

  /// useCreateMergeableStore
  useCreateMergeableStore: (
    create: () => MergeableStore<Schemas>,
    createDeps?: React.DependencyList,
  ) => MergeableStore<Schemas>;

  /// useStoreIds
  useStoreIds: () => Ids;

  /// useStore
  useStore: (id?: Id) => Store<Schemas> | undefined;

  /// useStoreOrStoreById
  useStoreOrStoreById: (
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => Store<Schemas> | undefined;

  /// useProvideStore
  useProvideStore: (storeId: Id, store: Store<Schemas>) => void;

  /// useHasTables
  useHasTables: (storeOrStoreId?: StoreOrStoreId<Schemas>) => boolean;

  /// useTables
  useTables: (storeOrStoreId?: StoreOrStoreId<Schemas>) => Tables<Schemas[0]>;

  /// useTableIds
  useTableIds: (
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => TableIdFromSchema<Schemas[0]>[];

  /// useHasTable
  useHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => boolean;

  /// useTable
  useTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => Table<Schemas[0], TableId>;

  /// useTableCellIds
  useTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => CellIdFromSchema<Schemas[0], TableId>[];

  /// useHasTableCell
  useHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    cellId: CellIdFromSchema<Schemas[0], TableId>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => boolean;

  /// useRowCount
  useRowCount: (
    tableId: TableIdFromSchema<Schemas[0]>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => number;

  /// useRowIds
  useRowIds: (
    tableId: TableIdFromSchema<Schemas[0]>,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => Ids;

  /// useSortedRowIds
  useSortedRowIds: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    cellId?: CellId,
    descending?: boolean,
    offset?: number,
    limit?: number,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => Ids;

  /// useHasRow
  useHasRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => boolean;

  /// useRow
  useRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => Row<Schemas[0], TableId>;

  /// useCellIds
  useCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => CellIdFromSchema<Schemas[0], TableId>[];

  /// useHasCell
  useHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => boolean;

  /// useCell
  useCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>;

  /// useHasValues
  useHasValues: (storeOrStoreId?: StoreOrStoreId<Schemas>) => boolean;

  /// useValues
  useValues: (storeOrStoreId?: StoreOrStoreId<Schemas>) => Values<Schemas[1]>;

  /// useValueIds
  useValueIds: (
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => ValueIdFromSchema<Schemas[1]>[];

  /// useHasValue
  useHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => boolean;

  /// useValue
  useValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => DefaultedValueFromSchema<Schemas[1], ValueId>;

  /// useSetTablesCallback
  useSetTablesCallback: <Parameter, SetTables = Tables<Schemas[0], true>>(
    getTables: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetTables>,
    getTablesDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, tables: SetTables) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useSetTableCallback
  useSetTableCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    SetTable = Table<Schemas[0], TableId, true>,
  >(
    tableId: TableId | GetId<Schemas, Parameter, TableId>,
    getTable: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetTable>,
    getTableDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, table: SetTable) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useSetRowCallback
  useSetRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    SetRow = Row<Schemas[0], TableId, true>,
  >(
    tableId: TableId | GetId<Schemas, Parameter, TableId>,
    rowId: Id | GetId<Schemas, Parameter, Id>,
    getRow: (parameter: Parameter, store: Store<Schemas>) => NoInfer<SetRow>,
    getRowDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, row: SetRow) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useAddRowCallback
  useAddRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    AddRow = Row<Schemas[0], TableId, true>,
  >(
    tableId: TableId | GetId<Schemas, Parameter, TableId>,
    getRow: (parameter: Parameter, store: Store<Schemas>) => NoInfer<AddRow>,
    getRowDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (rowId: Id | undefined, store: Store<Schemas>, row: AddRow) => void,
    thenDeps?: React.DependencyList,
    reuseRowIds?: boolean,
  ) => ParameterizedCallback<Parameter>;

  /// useSetPartialRowCallback
  useSetPartialRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    SetPartialRow = Row<Schemas[0], TableId, true>,
  >(
    tableId: TableId | GetId<Schemas, Parameter, TableId>,
    rowId: Id | GetId<Schemas, Parameter, Id>,
    getPartialRow: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetPartialRow>,
    getPartialRowDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, partialRow: SetPartialRow) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useSetCellCallback
  useSetCellCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    SetOrMapCell =
      | Cell<Schemas[0], TableId, CellId>
      | MapCell<Schemas[0], TableId, CellId>,
  >(
    tableId: TableId | GetId<Schemas, Parameter, TableId>,
    rowId: Id | GetId<Schemas, Parameter, Id>,
    cellId: CellId | GetId<Schemas, Parameter, CellId>,
    getCell: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetOrMapCell>,
    getCellDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, cell: SetOrMapCell) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useSetValuesCallback
  useSetValuesCallback: <Parameter, SetValues = Values<Schemas[1], true>>(
    getValues: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetValues>,
    getValuesDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, values: SetValues) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useSetPartialValuesCallback
  useSetPartialValuesCallback: <
    Parameter,
    SetPartialValues = Values<Schemas[1], true>,
  >(
    getPartialValues: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetPartialValues>,
    getPartialValuesDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, partialValues: SetPartialValues) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useSetValueCallback
  useSetValueCallback: <
    Parameter,
    ValueId extends ValueIdFromSchema<Schemas[1]>,
    SetOrMapValue = Value<Schemas[1], ValueId> | MapValue<Schemas[1], ValueId>,
  >(
    valueId: ValueId | GetId<Schemas, Parameter, ValueId>,
    getValue: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetOrMapValue>,
    getValueDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, value: SetOrMapValue) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useDelTablesCallback
  useDelTablesCallback: (
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
    thenDeps?: React.DependencyList,
  ) => Callback;

  /// useDelTableCallback
  useDelTableCallback: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
    thenDeps?: React.DependencyList,
  ) => Callback;

  /// useDelRowCallback
  useDelRowCallback: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
    thenDeps?: React.DependencyList,
  ) => Callback;

  /// useDelCellCallback
  useDelCellCallback: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
    forceDel?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
    thenDeps?: React.DependencyList,
  ) => Callback;

  /// useDelValuesCallback
  useDelValuesCallback: (
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
    thenDeps?: React.DependencyList,
  ) => Callback;

  /// useDelValueCallback
  useDelValueCallback: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
    thenDeps?: React.DependencyList,
  ) => Callback;

  /// useHasTablesListener
  useHasTablesListener: (
    listener: HasTablesListener<Schemas>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useTablesListener
  useTablesListener: (
    listener: TablesListener<Schemas>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useTableIdsListener
  useTableIdsListener: (
    listener: TableIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useHasTableListener
  useHasTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull,
    listener: HasTableListener<Schemas, TableIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useTableListener
  useTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull,
    listener: TableListener<Schemas, TableIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useTableCellIdsListener
  useTableCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull,
    listener: TableCellIdsListener<Schemas, TableIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useHasTableCellListener
  useHasTableCellListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: TableIdOrNull,
    cellId: CellIdOrNull,
    listener: HasTableCellListener<Schemas, TableIdOrNull, CellIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useRowCountListener
  useRowCountListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull,
    listener: RowCountListener<Schemas, TableIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useRowIdsListener
  useRowIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useSortedRowIdsListener
  useSortedRowIdsListener: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellIdOrUndefined extends CellIdFromSchema<Schemas[0], TableId> | undefined,
    Descending extends boolean,
    Offset extends number,
    Limit extends number | undefined,
  >(
    tableId: TableId,
    cellId: CellIdOrUndefined,
    descending: Descending,
    offset: Offset,
    limit: Limit,
    listener: SortedRowIdsListener<
      Schemas,
      TableId,
      CellIdOrUndefined,
      Descending,
      Offset,
      Limit
    >,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useHasRowListener
  useHasRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: HasRowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useRowListener
  useRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useCellIdsListener
  useCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useHasCellListener
  useHasCellListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    cellId: CellIdOrNull,
    listener: HasCellListener<
      Schemas,
      TableIdOrNull,
      RowIdOrNull,
      CellIdOrNull
    >,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useCellListener
  useCellListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    cellId: CellIdOrNull,
    listener: CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useHasValuesListener
  useHasValuesListener: (
    listener: HasValuesListener<Schemas>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useValuesListener
  useValuesListener: (
    listener: ValuesListener<Schemas>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useValueIdsListener
  useValueIdsListener: (
    listener: ValueIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useHasValueListener
  useHasValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: ValueIdOrNull,
    listener: HasValueListener<Schemas, ValueIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useValueListener
  useValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: ValueIdOrNull,
    listener: ValueListener<Schemas, ValueIdOrNull>,
    listenerDeps?: React.DependencyList,
    mutator?: boolean,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useStartTransactionListener
  useStartTransactionListener: (
    listener: TransactionListener<Schemas>,
    listenerDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useWillFinishTransactionListener
  useWillFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    listenerDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useDidFinishTransactionListener
  useDidFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    listenerDeps?: React.DependencyList,
    storeOrStoreId?: StoreOrStoreId<Schemas>,
  ) => void;

  /// useCreateMetrics
  useCreateMetrics: (
    store: Store<Schemas> | undefined,
    create: (store: Store<Schemas>) => Metrics<Schemas>,
    createDeps?: React.DependencyList,
  ) => Metrics<Schemas> | undefined;

  /// useMetricsIds
  useMetricsIds: () => Ids;

  /// useMetrics
  useMetrics: (id?: Id) => Metrics<Schemas> | undefined;

  /// useMetricsOrMetricsById
  useMetricsOrMetricsById: (
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => Metrics<Schemas> | undefined;

  /// useMetricIds
  useMetricIds(metricsOrMetricsId?: MetricsOrMetricsId<Schemas>): Ids;

  /// useMetric
  useMetric: (
    metricId: Id,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => number | undefined;

  /// useMetricListener
  useMetricListener: (
    metricId: IdOrNull,
    listener: MetricListener<Schemas>,
    listenerDeps?: React.DependencyList,
    metricsOrMetricsId?: MetricsOrMetricsId<Schemas>,
  ) => void;

  /// useCreateIndexes
  useCreateIndexes: (
    store: Store<Schemas> | undefined,
    create: (store: Store<Schemas>) => Indexes<Schemas>,
    createDeps?: React.DependencyList,
  ) => Indexes<Schemas> | undefined;

  /// useIndexesIds
  useIndexesIds: () => Ids;

  /// useIndexes
  useIndexes: (id?: Id) => Indexes<Schemas> | undefined;

  /// useIndexesOrIndexesById
  useIndexesOrIndexesById: (
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => Indexes<Schemas> | undefined;

  /// useIndexIds
  useIndexIds(indexesOrIndexesId?: IndexesOrIndexesId<Schemas>): Ids;

  /// useSliceIds
  useSliceIds: (
    indexId: Id,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => Ids;

  /// useSliceRowIds
  useSliceRowIds: (
    indexId: Id,
    sliceId: Id,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => Ids;

  /// useSliceIdsListener
  useSliceIdsListener: (
    indexId: IdOrNull,
    listener: SliceIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// useSliceRowIdsListener
  useSliceRowIdsListener: (
    indexId: IdOrNull,
    sliceId: IdOrNull,
    listener: SliceRowIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    indexesOrIndexesId?: IndexesOrIndexesId<Schemas>,
  ) => void;

  /// useCreateRelationships
  useCreateRelationships: (
    store: Store<Schemas> | undefined,
    create: (store: Store<Schemas>) => Relationships<Schemas>,
    createDeps?: React.DependencyList,
  ) => Relationships<Schemas> | undefined;

  /// useRelationshipsIds
  useRelationshipsIds: () => Ids;

  /// useRelationships
  useRelationships: (id?: Id) => Relationships<Schemas> | undefined;

  /// useRelationshipsOrRelationshipsById
  useRelationshipsOrRelationshipsById: (
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => Relationships<Schemas> | undefined;

  /// useRelationshipIds
  useRelationshipIds(
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ): Ids;

  /// useRemoteRowId
  useRemoteRowId: (
    relationshipId: Id,
    localRowId: Id,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => Id | undefined;

  /// useLocalRowIds
  useLocalRowIds: (
    relationshipId: Id,
    remoteRowId: Id,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => Ids;

  /// useLinkedRowIds
  useLinkedRowIds: (
    relationshipId: Id,
    firstRowId: Id,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => Ids;

  /// useRemoteRowIdListener
  useRemoteRowIdListener: (
    relationshipId: IdOrNull,
    localRowId: IdOrNull,
    listener: RemoteRowIdListener<Schemas>,
    listenerDeps?: React.DependencyList,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// useLocalRowIdsListener
  useLocalRowIdsListener: (
    relationshipId: IdOrNull,
    remoteRowId: IdOrNull,
    listener: LocalRowIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// useLinkedRowIdsListener
  useLinkedRowIdsListener: (
    relationshipId: Id,
    firstRowId: Id,
    listener: LinkedRowIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// useCreateQueries
  useCreateQueries: (
    store: Store<Schemas> | undefined,
    create: (store: Store<Schemas>) => Queries<Schemas>,
    createDeps?: React.DependencyList,
  ) => Queries<Schemas> | undefined;

  /// useQueriesIds
  useQueriesIds: () => Ids;

  /// useQueries
  useQueries: (id?: Id) => Queries<Schemas> | undefined;

  /// useQueriesOrQueriesById
  useQueriesOrQueriesById: (
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => Queries<Schemas> | undefined;

  /// useQueryIds
  useQueryIds(queriesOrQueriesId?: QueriesOrQueriesId<Schemas>): Ids;

  /// useResultTable
  useResultTable: (
    queryId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => ResultTable;

  /// useResultTableCellIds
  useResultTableCellIds: (
    queryId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => Ids;

  /// useResultRowCount
  useResultRowCount: (
    queryId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => number;

  /// useResultRowIds
  useResultRowIds: (
    queryId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => Ids;

  /// useResultSortedRowIds
  useResultSortedRowIds: (
    queryId: Id,
    cellId?: Id,
    descending?: boolean,
    offset?: number,
    limit?: number,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => Ids;

  /// useResultRow
  useResultRow: (
    queryId: Id,
    rowId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => ResultRow;

  /// useResultCellIds
  useResultCellIds: (
    queryId: Id,
    rowId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => Ids;

  /// useResultCell
  useResultCell: (
    queryId: Id,
    rowId: Id,
    cellId: Id,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => ResultCell | undefined;

  /// useResultTableListener
  useResultTableListener: (
    queryId: IdOrNull,
    listener: ResultTableListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultTableCellIdsListener
  useResultTableCellIdsListener: (
    queryId: IdOrNull,
    listener: ResultTableCellIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultRowCountListener
  useResultRowCountListener: (
    queryId: IdOrNull,
    listener: ResultRowCountListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultRowIdsListener
  useResultRowIdsListener: (
    queryId: IdOrNull,
    listener: ResultRowIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultSortedRowIdsListener
  useResultSortedRowIdsListener: (
    queryId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: ResultSortedRowIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultRowListener
  useResultRowListener: (
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultRowListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultCellIdsListener
  useResultCellIdsListener: (
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultCellIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useResultCellListener
  useResultCellListener: (
    queryId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: ResultCellListener<Schemas>,
    listenerDeps?: React.DependencyList,
    queriesOrQueriesId?: QueriesOrQueriesId<Schemas>,
  ) => void;

  /// useCreateCheckpoints
  useCreateCheckpoints: (
    store: Store<Schemas> | undefined,
    create: (store: Store<Schemas>) => Checkpoints<Schemas>,
    createDeps?: React.DependencyList,
  ) => Checkpoints<Schemas> | undefined;

  /// useCheckpointsIds
  useCheckpointsIds: () => Ids;

  /// useCheckpoints
  useCheckpoints: (id?: Id) => Checkpoints<Schemas> | undefined;

  /// useCheckpointsOrCheckpointsById
  useCheckpointsOrCheckpointsById: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => Checkpoints<Schemas> | undefined;

  /// useCheckpointIds
  useCheckpointIds: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => CheckpointIds;

  /// useCheckpoint
  useCheckpoint: (
    checkpointId: Id,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => string | undefined;

  /// useSetCheckpointCallback
  useSetCheckpointCallback: <Parameter>(
    getCheckpoint?: (parameter: Parameter) => string,
    getCheckpointDeps?: React.DependencyList,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
    then?: (
      checkpointId: Id,
      checkpoints: Checkpoints<Schemas>,
      label?: string,
    ) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useGoBackwardCallback
  useGoBackwardCallback: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => Callback;

  /// useGoForwardCallback
  useGoForwardCallback: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => Callback;

  /// useGoToCallback
  useGoToCallback: <Parameter>(
    getCheckpointId: (parameter: Parameter) => Id,
    getCheckpointIdDeps?: React.DependencyList,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
    then?: (checkpoints: Checkpoints<Schemas>, checkpointId: Id) => void,
    thenDeps?: React.DependencyList,
  ) => ParameterizedCallback<Parameter>;

  /// useUndoInformation
  useUndoInformation: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => UndoOrRedoInformation;

  /// useRedoInformation
  useRedoInformation: (
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => UndoOrRedoInformation;

  /// useCheckpointIdsListener
  useCheckpointIdsListener: (
    listener: CheckpointIdsListener<Schemas>,
    listenerDeps?: React.DependencyList,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// useCheckpointListener
  useCheckpointListener: (
    checkpointId: IdOrNull,
    listener: CheckpointListener<Schemas>,
    listenerDeps?: React.DependencyList,
    checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// useCreatePersister
  useCreatePersister: <
    PersisterOrUndefined extends Persister<Schemas> | undefined,
  >(
    store: Store<Schemas> | undefined,
    create: (store: Store<Schemas>) => Persister<Schemas> | undefined,
    createDeps?: React.DependencyList,
    destroy?: (persister: Persister<Schemas>) => void,
    destroyDeps?: React.DependencyList,
  ) => PersisterOrUndefined;

  /// useCreateSynchronizer
  useCreateSynchronizer: <
    SynchronizerOrUndefined extends Synchronizer<Schemas> | undefined,
  >(
    store: MergeableStore<Schemas> | undefined,
    create: (
      store: MergeableStore<Schemas>,
    ) => Promise<SynchronizerOrUndefined>,
    createDeps?: React.DependencyList,
    destroy?: (synchronizer: Synchronizer<Schemas>) => void,
    destroyDeps?: React.DependencyList,
  ) => SynchronizerOrUndefined;

  /// ExtraProps
  ExtraProps: ExtraProps;

  /// TablesProps
  TablesProps: TablesProps<Schemas>;

  /// TableProps
  TableProps: TableProps<Schemas>;

  /// SortedTableProps
  SortedTableProps: SortedTableProps<Schemas>;

  /// RowProps
  RowProps: RowProps<Schemas>;

  /// CellProps
  CellProps: CellProps<Schemas>;

  /// ValuesProps
  ValuesProps: ValuesProps<Schemas>;

  /// ValueProps
  ValueProps: ValueProps<Schemas>;

  /// MetricProps
  MetricProps: MetricProps<Schemas>;

  /// IndexProps
  IndexProps: IndexProps<Schemas>;

  /// SliceProps
  SliceProps: SliceProps<Schemas>;

  /// RemoteRowProps
  RemoteRowProps: RemoteRowProps<Schemas>;

  /// LocalRowsProps
  LocalRowsProps: LocalRowsProps<Schemas>;

  /// LinkedRowsProps
  LinkedRowsProps: LinkedRowsProps<Schemas>;

  /// ResultTableProps
  ResultTableProps: ResultTableProps<Schemas>;

  /// ResultSortedTableProps
  ResultSortedTableProps: ResultSortedTableProps<Schemas>;

  /// ResultRowProps
  ResultRowProps: ResultRowProps<Schemas>;

  /// ResultCellProps
  ResultCellProps: ResultCellProps<Schemas>;

  /// CheckpointProps
  CheckpointProps: CheckpointProps<Schemas>;

  /// BackwardCheckpointsProps
  BackwardCheckpointsProps: BackwardCheckpointsProps<Schemas>;

  /// CurrentCheckpointProps
  CurrentCheckpointProps: CurrentCheckpointProps<Schemas>;

  /// ForwardCheckpointsProps
  ForwardCheckpointsProps: ForwardCheckpointsProps<Schemas>;

  /// ProviderProps
  ProviderProps: ProviderProps<Schemas>;

  /// ComponentReturnType
  ComponentReturnType: ReactElement<any, any> | null;

  /// Provider
  Provider: (
    props: ProviderProps<Schemas> & {children: React.ReactNode},
  ) => ComponentReturnType;

  /// CellView
  CellView: (props: CellProps<Schemas>) => ComponentReturnType;

  /// RowView
  RowView: (props: RowProps<Schemas>) => ComponentReturnType;

  /// SortedTableView
  SortedTableView: (props: SortedTableProps<Schemas>) => ComponentReturnType;

  /// TableView
  TableView: (props: TableProps<Schemas>) => ComponentReturnType;

  /// TablesView
  TablesView: (props: TablesProps<Schemas>) => ComponentReturnType;

  /// ValueView
  ValueView: (props: ValueProps<Schemas>) => ComponentReturnType;

  /// ValuesView
  ValuesView: (props: ValuesProps<Schemas>) => ComponentReturnType;

  /// MetricView
  MetricView: (props: MetricProps<Schemas>) => ComponentReturnType;

  /// SliceView
  SliceView: (props: SliceProps<Schemas>) => ComponentReturnType;

  /// IndexView
  IndexView: (props: IndexProps<Schemas>) => ComponentReturnType;

  /// RemoteRowView
  RemoteRowView: (props: RemoteRowProps<Schemas>) => ComponentReturnType;

  /// LocalRowsView
  LocalRowsView: (props: LocalRowsProps<Schemas>) => ComponentReturnType;

  /// LinkedRowsView
  LinkedRowsView: (props: LinkedRowsProps<Schemas>) => ComponentReturnType;

  /// ResultCellView
  ResultCellView: (props: ResultCellProps<Schemas>) => ComponentReturnType;

  /// ResultRowView
  ResultRowView: (props: ResultRowProps<Schemas>) => ComponentReturnType;

  /// ResultSortedTableView
  ResultSortedTableView: (
    props: ResultSortedTableProps<Schemas>,
  ) => ComponentReturnType;

  /// ResultTableView
  ResultTableView: (props: ResultTableProps<Schemas>) => ComponentReturnType;

  /// CheckpointView
  CheckpointView: (props: CheckpointProps<Schemas>) => ComponentReturnType;

  /// BackwardCheckpointsView
  BackwardCheckpointsView: (
    props: BackwardCheckpointsProps<Schemas>,
  ) => ComponentReturnType;

  /// CurrentCheckpointView
  CurrentCheckpointView: (
    props: CurrentCheckpointProps<Schemas>,
  ) => ComponentReturnType;

  /// ForwardCheckpointsView
  ForwardCheckpointsView: (
    props: ForwardCheckpointsProps<Schemas>,
  ) => ComponentReturnType;
};
