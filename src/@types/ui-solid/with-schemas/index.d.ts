/// ui-solid
import type {Accessor, JSXElement} from 'solid-js';
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
  ComponentReturnType,
  CurrentCheckpointProps,
  ExtraProps,
  ForwardCheckpointsProps,
  GetId,
  IndexProps,
  LinkedRowsProps,
  LocalRowsProps,
  MetricProps,
  ProviderProps,
  RemoteRowProps,
  ResultCellProps,
  ResultRowProps,
  ResultSortedTableProps,
  ResultTableProps,
  RowProps,
  SliceProps,
  SortedTableProps,
  TableProps,
  TablesProps,
  UndoOrRedoInformation,
  ValueProps,
  ValuesProps,
} from '../../_internal/ui-solid/with-schemas/index.d.ts';
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
import type {
  Callback,
  Id,
  IdOrNull,
  Ids,
  ParameterizedCallback,
  Sorter,
} from '../../common/with-schemas/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../../indexes/with-schemas/index.d.ts';
import type {MergeableStore} from '../../mergeable-store/with-schemas/index.d.ts';
import type {
  MetricListener,
  Metrics,
} from '../../metrics/with-schemas/index.d.ts';
import type {
  AnyPersister,
  PersistedStore,
  Persister,
  Persists,
  Status,
  StatusListener,
} from '../../persisters/with-schemas/index.d.ts';
import type {
  ParamValue,
  ParamValueListener,
  ParamValues,
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
  MapCell,
  MapValue,
  OptionalSchemas,
  PartialRow,
  PartialValues,
  Row,
  RowCountListener,
  RowIdsListener,
  RowListener,
  SortedRowIdsArgs,
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
import type {MaybeAccessor} from '../index.d.ts';

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// ui-solid.MaybeAccessor
  MaybeAccessor: <Thing>(thing: Thing) => MaybeAccessor<Thing>;

  /// ui-solid.StoreOrStoreId
  StoreOrStoreId: StoreOrStoreId<Schemas>;

  /// ui-solid.MetricsOrMetricsId
  MetricsOrMetricsId: MetricsOrMetricsId<Schemas>;

  /// ui-solid.IndexesOrIndexesId
  IndexesOrIndexesId: IndexesOrIndexesId<Schemas>;

  /// ui-solid.RelationshipsOrRelationshipsId
  RelationshipsOrRelationshipsId: RelationshipsOrRelationshipsId<Schemas>;

  /// ui-solid.QueriesOrQueriesId
  QueriesOrQueriesId: QueriesOrQueriesId<Schemas>;

  /// ui-solid.CheckpointsOrCheckpointsId
  CheckpointsOrCheckpointsId: CheckpointsOrCheckpointsId<Schemas>;

  /// ui-solid.PersisterOrPersisterId
  PersisterOrPersisterId: PersisterOrPersisterId<Schemas>;

  /// ui-solid.SynchronizerOrSynchronizerId
  SynchronizerOrSynchronizerId: SynchronizerOrSynchronizerId<Schemas>;

  /// ui-solid.UndoOrRedoInformation
  UndoOrRedoInformation: UndoOrRedoInformation;

  /// ui-solid.useCreateStore
  useCreateStore: (create: () => Store<Schemas>) => Accessor<Store<Schemas>>;

  /// ui-solid.useCreateMergeableStore
  useCreateMergeableStore: (
    create: () => MergeableStore<Schemas>,
  ) => Accessor<MergeableStore<Schemas>>;

  /// ui-solid.useStoreIds
  useStoreIds: () => Accessor<Ids>;

  /// ui-solid.useStore
  useStore: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Store<Schemas> | undefined>;

  /// ui-solid.useStores
  useStores: () => Accessor<{[storeId: Id]: Store<OptionalSchemas>}>;

  /// ui-solid.useStoreOrStoreById
  useStoreOrStoreById: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<Store<Schemas> | undefined>;

  /// ui-solid.useProvideStore
  useProvideStore: (storeId: Id, store: Store<Schemas>) => void;

  /// ui-solid.useHasTables
  useHasTables: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useTables
  useTables: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<Tables<Schemas[0]>>;

  /// ui-solid.useTablesState
  useTablesState: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => [Accessor<Tables<Schemas[0]>>, (tables: Tables<Schemas[0]>) => void];

  /// ui-solid.useTableIds
  useTableIds: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<TableIdFromSchema<Schemas[0]>[]>;

  /// ui-solid.useHasTable
  useHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useTable
  useTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<Table<Schemas[0], TableId>>;

  /// ui-solid.useTableState
  useTableState: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => [
    Accessor<Table<Schemas[0], TableId>>,
    (table: Table<Schemas[0], TableId>) => void,
  ];

  /// ui-solid.useTableCellIds
  useTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<CellIdFromSchema<Schemas[0], TableId>[]>;

  /// ui-solid.useHasTableCell
  useHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    cellId: MaybeAccessor<CellIdFromSchema<Schemas[0], TableId>>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useRowCount
  useRowCount: (
    tableId: MaybeAccessor<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<number>;

  /// ui-solid.useRowIds
  useRowIds: (
    tableId: MaybeAccessor<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  useSortedRowIds: {
    /// ui-solid.useSortedRowIds
    <
      TableId extends TableIdFromSchema<Schemas[0]>,
      CellIdOrUndefined extends
        CellIdFromSchema<Schemas[0], TableId> | undefined,
    >(
      tableId: MaybeAccessor<TableId>,
      cellId?: MaybeAccessor<CellIdOrUndefined>,
      descending?: MaybeAccessor<boolean | undefined>,
      offset?: MaybeAccessor<number | undefined>,
      limit?: MaybeAccessor<number | undefined>,
      sorter?: Sorter,
      storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    ): Accessor<Ids>;

    /// ui-solid.useSortedRowIds.2
    <TableId extends TableIdFromSchema<Schemas[0]>>(
      args: SortedRowIdsArgs<Schemas[0], TableId>,
      storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    ): Accessor<Ids>;
  };

  /// ui-solid.useHasRow
  useHasRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useRow
  useRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<Row<Schemas[0], TableId>>;

  /// ui-solid.useRowState
  useRowState: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => [
    Accessor<Row<Schemas[0], TableId>>,
    (row: Row<Schemas[0], TableId>) => void,
  ];

  /// ui-solid.useCellIds
  useCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<CellIdFromSchema<Schemas[0], TableId>[]>;

  /// ui-solid.useHasCell
  useHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<CellId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useCell
  useCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<CellId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>>;

  /// ui-solid.useCellState
  useCellState: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<CellId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => [
    Accessor<CellOrUndefined<Schemas[0], TableId, CellId>>,
    (cell: Cell<Schemas[0], TableId, CellId>) => void,
  ];

  /// ui-solid.useHasValues
  useHasValues: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useValues
  useValues: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<Values<Schemas[1]>>;

  /// ui-solid.useValuesState
  useValuesState: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => [Accessor<Values<Schemas[1]>>, (values: Values<Schemas[1]>) => void];

  /// ui-solid.useValueIds
  useValueIds: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<ValueIdFromSchema<Schemas[1]>[]>;

  /// ui-solid.useHasValue
  useHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeAccessor<ValueId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useValue
  useValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeAccessor<ValueId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => Accessor<DefaultedValueFromSchema<Schemas[1], ValueId>>;

  /// ui-solid.useValueState
  useValueState: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeAccessor<ValueId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => [
    value: Accessor<DefaultedValueFromSchema<Schemas[1], ValueId>>,
    setValue: (value: Value<Schemas[1], ValueId>) => void,
  ];

  /// ui-solid.useSetTablesCallback
  useSetTablesCallback: <Parameter>(
    getTables: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => Tables<Schemas[0], true>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>, tables: Tables<Schemas[0], true>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetTableCallback
  useSetTableCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    getTable: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => Table<Schemas[0], TableId, true>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (
      store: Store<Schemas>,
      table: Table<Schemas[0], TableId, true>,
    ) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetRowCallback
  useSetRowCallback: <Parameter, TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getRow: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => Row<Schemas[0], TableId, true>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>, row: Row<Schemas[0], TableId, true>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useAddRowCallback
  useAddRowCallback: <Parameter, TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    getRow: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => Row<Schemas[0], TableId, true>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (
      rowId: Id | undefined,
      store: Store<Schemas>,
      row: Row<Schemas[0], TableId, true>,
    ) => void,
    reuseRowIds?: boolean,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetPartialRowCallback
  useSetPartialRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getPartialRow: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => PartialRow<Schemas[0], TableId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (
      store: Store<Schemas>,
      partialRow: PartialRow<Schemas[0], TableId>,
    ) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetCellCallback
  useSetCellCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    SetOrMapCell =
      Cell<Schemas[0], TableId, CellId> | MapCell<Schemas[0], TableId, CellId>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    cellId: MaybeAccessor<CellId> | GetId<Schemas, Parameter, CellId>,
    getCell: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetOrMapCell>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>, cell: SetOrMapCell) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetValuesCallback
  useSetValuesCallback: <Parameter>(
    getValues: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => Values<Schemas[1], true>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>, values: Values<Schemas[1], true>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetPartialValuesCallback
  useSetPartialValuesCallback: <Parameter>(
    getPartialValues: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => PartialValues<Schemas[1]>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (
      store: Store<Schemas>,
      partialValues: PartialValues<Schemas[1]>,
    ) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetValueCallback
  useSetValueCallback: <
    Parameter,
    ValueId extends ValueIdFromSchema<Schemas[1]>,
    SetOrMapValue = Value<Schemas[1], ValueId> | MapValue<Schemas[1], ValueId>,
  >(
    valueId: MaybeAccessor<ValueId> | GetId<Schemas, Parameter, ValueId>,
    getValue: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetOrMapValue>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>, value: SetOrMapValue) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelTablesCallback
  useDelTablesCallback: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>) => void,
  ) => Callback;

  /// ui-solid.useDelTableCallback
  useDelTableCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelRowCallback
  useDelRowCallback: <Parameter, TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelCellCallback
  useDelCellCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    cellId: MaybeAccessor<CellId> | GetId<Schemas, Parameter, CellId>,
    forceDel?: MaybeAccessor<boolean | undefined>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelValuesCallback
  useDelValuesCallback: (
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>) => void,
  ) => Callback;

  /// ui-solid.useDelValueCallback
  useDelValueCallback: <
    Parameter,
    ValueId extends ValueIdFromSchema<Schemas[1]>,
  >(
    valueId: MaybeAccessor<ValueId> | GetId<Schemas, Parameter, ValueId>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useHasTablesListener
  useHasTablesListener: (
    listener: HasTablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useTablesListener
  useTablesListener: (
    listener: TablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useTableIdsListener
  useTableIdsListener: (
    listener: TableIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useHasTableListener
  useHasTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: HasTableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useTableListener
  useTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useTableCellIdsListener
  useTableCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: TableCellIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useHasTableCellListener
  useHasTableCellListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    cellId: MaybeAccessor<CellIdOrNull>,
    listener: HasTableCellListener<Schemas, TableIdOrNull, CellIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useRowCountListener
  useRowCountListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: RowCountListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useRowIdsListener
  useRowIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  useSortedRowIdsListener: {
    /// ui-solid.useSortedRowIdsListener
    <
      TableId extends TableIdFromSchema<Schemas[0]>,
      CellIdOrUndefined extends
        CellIdFromSchema<Schemas[0], TableId> | undefined,
    >(
      tableId: MaybeAccessor<TableId>,
      cellId: MaybeAccessor<CellIdOrUndefined>,
      descending: MaybeAccessor<boolean>,
      offset: MaybeAccessor<number>,
      limit: MaybeAccessor<number | undefined>,
      listener: SortedRowIdsListener<Schemas, TableId, CellIdOrUndefined>,
      mutator?: boolean,
      storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    ): void;

    /// ui-solid.useSortedRowIdsListener.2
    <
      TableId extends TableIdFromSchema<Schemas[0]>,
      CellIdOrUndefined extends
        CellIdFromSchema<Schemas[0], TableId> | undefined,
    >(
      args: SortedRowIdsArgs<Schemas[0], TableId>,
      listener: SortedRowIdsListener<Schemas, TableId, CellIdOrUndefined>,
      mutator?: boolean,
      storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
    ): void;
  };

  /// ui-solid.useHasRowListener
  useHasRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    rowId: MaybeAccessor<RowIdOrNull>,
    listener: HasRowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useRowListener
  useRowListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    rowId: MaybeAccessor<RowIdOrNull>,
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useCellIdsListener
  useCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    rowId: MaybeAccessor<RowIdOrNull>,
    listener: CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useHasCellListener
  useHasCellListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    rowId: MaybeAccessor<RowIdOrNull>,
    cellId: MaybeAccessor<CellIdOrNull>,
    listener: HasCellListener<
      Schemas,
      TableIdOrNull,
      RowIdOrNull,
      CellIdOrNull
    >,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useCellListener
  useCellListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    rowId: MaybeAccessor<RowIdOrNull>,
    cellId: MaybeAccessor<CellIdOrNull>,
    listener: CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useHasValuesListener
  useHasValuesListener: (
    listener: HasValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useValuesListener
  useValuesListener: (
    listener: ValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useValueIdsListener
  useValueIdsListener: (
    listener: ValueIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useHasValueListener
  useHasValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: MaybeAccessor<ValueIdOrNull>,
    listener: HasValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useValueListener
  useValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: MaybeAccessor<ValueIdOrNull>,
    listener: ValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useStartTransactionListener
  useStartTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useWillFinishTransactionListener
  useWillFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useDidFinishTransactionListener
  useDidFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: MaybeAccessor<StoreOrStoreId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useCreateMetrics
  useCreateMetrics: (
    store: MaybeAccessor<Store<Schemas> | undefined>,
    create: (store: Store<Schemas>) => Metrics<Schemas>,
  ) => Accessor<Metrics<Schemas> | undefined>;

  /// ui-solid.useMetricsIds
  useMetricsIds: () => Accessor<Ids>;

  /// ui-solid.useMetrics
  useMetrics: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Metrics<Schemas> | undefined>;

  /// ui-solid.useMetricsOrMetricsById
  useMetricsOrMetricsById: (
    metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId<Schemas> | undefined>,
  ) => Accessor<Metrics<Schemas> | undefined>;

  // useProvideMetrics
  useProvideMetrics: (metricsId: Id, metrics: Metrics<Schemas>) => void;

  /// ui-solid.useMetricIds
  useMetricIds(
    metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId<Schemas> | undefined>,
  ): Accessor<Ids>;

  /// ui-solid.useMetric
  useMetric: (
    metricId: MaybeAccessor<Id>,
    metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId<Schemas> | undefined>,
  ) => Accessor<number | undefined>;

  /// ui-solid.useMetricListener
  useMetricListener: (
    metricId: MaybeAccessor<IdOrNull>,
    listener: MetricListener<Schemas>,
    metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useCreateIndexes
  useCreateIndexes: (
    store: MaybeAccessor<Store<Schemas> | undefined>,
    create: (store: Store<Schemas>) => Indexes<Schemas>,
  ) => Accessor<Indexes<Schemas> | undefined>;

  /// ui-solid.useIndexesIds
  useIndexesIds: () => Accessor<Ids>;

  /// ui-solid.useIndexes
  useIndexes: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Indexes<Schemas> | undefined>;

  /// ui-solid.useIndexesOrIndexesById
  useIndexesOrIndexesById: (
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => Accessor<Indexes<Schemas> | undefined>;

  // useProvideIndexes
  useProvideIndexes: (indexesId: Id, indexes: Indexes<Schemas>) => void;

  /// ui-solid.useIndexIds
  useIndexIds(
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ): Accessor<Ids>;

  /// ui-solid.useHasIndex
  useHasIndex: (
    indexId: MaybeAccessor<Id>,
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useSliceIds
  useSliceIds: (
    indexId: MaybeAccessor<Id>,
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  /// ui-solid.useHasSlice
  useHasSlice: (
    indexId: MaybeAccessor<Id>,
    sliceId: MaybeAccessor<Id>,
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => Accessor<boolean>;

  /// ui-solid.useSliceRowIds
  useSliceRowIds: (
    indexId: MaybeAccessor<Id>,
    sliceId: MaybeAccessor<Id>,
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  /// ui-solid.useSliceIdsListener
  useSliceIdsListener: (
    indexId: MaybeAccessor<IdOrNull>,
    listener: SliceIdsListener<Schemas>,
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useSliceRowIdsListener
  useSliceRowIdsListener: (
    indexId: MaybeAccessor<IdOrNull>,
    sliceId: MaybeAccessor<IdOrNull>,
    listener: SliceRowIdsListener<Schemas>,
    indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useCreateRelationships
  useCreateRelationships: (
    store: MaybeAccessor<Store<Schemas> | undefined>,
    create: (store: Store<Schemas>) => Relationships<Schemas>,
  ) => Accessor<Relationships<Schemas> | undefined>;

  /// ui-solid.useRelationshipsIds
  useRelationshipsIds: () => Accessor<Ids>;

  /// ui-solid.useRelationships
  useRelationships: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Relationships<Schemas> | undefined>;

  /// ui-solid.useRelationshipsOrRelationshipsById
  useRelationshipsOrRelationshipsById: (
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => Accessor<Relationships<Schemas> | undefined>;

  // useProvideRelationships
  useProvideRelationships: (
    relationshipsId: Id,
    relationships: Relationships<Schemas>,
  ) => void;

  /// ui-solid.useRelationshipIds
  useRelationshipIds(
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ): Accessor<Ids>;

  /// ui-solid.useRemoteRowId
  useRemoteRowId: (
    relationshipId: MaybeAccessor<Id>,
    localRowId: MaybeAccessor<Id>,
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => Accessor<Id | undefined>;

  /// ui-solid.useLocalRowIds
  useLocalRowIds: (
    relationshipId: MaybeAccessor<Id>,
    remoteRowId: MaybeAccessor<Id>,
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => Accessor<Ids>;

  /// ui-solid.useLinkedRowIds
  useLinkedRowIds: (
    relationshipId: MaybeAccessor<Id>,
    firstRowId: MaybeAccessor<Id>,
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => Accessor<Ids>;

  /// ui-solid.useRemoteRowIdListener
  useRemoteRowIdListener: (
    relationshipId: MaybeAccessor<IdOrNull>,
    localRowId: MaybeAccessor<IdOrNull>,
    listener: RemoteRowIdListener<Schemas>,
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.useLocalRowIdsListener
  useLocalRowIdsListener: (
    relationshipId: MaybeAccessor<IdOrNull>,
    remoteRowId: MaybeAccessor<IdOrNull>,
    listener: LocalRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.useLinkedRowIdsListener
  useLinkedRowIdsListener: (
    relationshipId: MaybeAccessor<Id>,
    firstRowId: MaybeAccessor<Id>,
    listener: LinkedRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: MaybeAccessor<
      RelationshipsOrRelationshipsId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.useCreateQueries
  useCreateQueries: (
    store: MaybeAccessor<Store<Schemas> | undefined>,
    create: (store: Store<Schemas>) => Queries<Schemas>,
  ) => Accessor<Queries<Schemas> | undefined>;

  /// ui-solid.useQueriesIds
  useQueriesIds: () => Accessor<Ids>;

  /// ui-solid.useQueries
  useQueries: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Queries<Schemas> | undefined>;

  /// ui-solid.useQueriesOrQueriesById
  useQueriesOrQueriesById: (
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<Queries<Schemas> | undefined>;

  // useProvideQueries
  useProvideQueries: (queriesId: Id, queries: Queries<Schemas>) => void;

  /// ui-solid.useQueryIds
  useQueryIds(
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ): Accessor<Ids>;

  /// ui-solid.useResultTable
  useResultTable: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<ResultTable>;

  /// ui-solid.useResultTableCellIds
  useResultTableCellIds: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultRowCount
  useResultRowCount: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<number>;

  /// ui-solid.useResultRowIds
  useResultRowIds: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultSortedRowIds
  useResultSortedRowIds: (
    queryId: MaybeAccessor<Id>,
    cellId?: MaybeAccessor<Id | undefined>,
    descending?: MaybeAccessor<boolean | undefined>,
    offset?: MaybeAccessor<number | undefined>,
    limit?: MaybeAccessor<number | undefined>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultRow
  useResultRow: (
    queryId: MaybeAccessor<Id>,
    rowId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<ResultRow>;

  /// ui-solid.useResultCellIds
  useResultCellIds: (
    queryId: MaybeAccessor<Id>,
    rowId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultCell
  useResultCell: (
    queryId: MaybeAccessor<Id>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<ResultCell | undefined>;

  /// ui-solid.useResultTableListener
  useResultTableListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultTableListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultTableCellIdsListener
  useResultTableCellIdsListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultTableCellIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultRowCountListener
  useResultRowCountListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultRowCountListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultRowIdsListener
  useResultRowIdsListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultRowIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultSortedRowIdsListener
  useResultSortedRowIdsListener: (
    queryId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<Id | undefined>,
    descending: MaybeAccessor<boolean>,
    offset: MaybeAccessor<number>,
    limit: MaybeAccessor<number | undefined>,
    listener: ResultSortedRowIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultRowListener
  useResultRowListener: (
    queryId: MaybeAccessor<IdOrNull>,
    rowId: MaybeAccessor<IdOrNull>,
    listener: ResultRowListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultCellIdsListener
  useResultCellIdsListener: (
    queryId: MaybeAccessor<IdOrNull>,
    rowId: MaybeAccessor<IdOrNull>,
    listener: ResultCellIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useResultCellListener
  useResultCellListener: (
    queryId: MaybeAccessor<IdOrNull>,
    rowId: MaybeAccessor<IdOrNull>,
    cellId: MaybeAccessor<IdOrNull>,
    listener: ResultCellListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useParamValues
  useParamValues: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<ParamValues>;

  /// ui-solid.useParamValuesState
  useParamValuesState: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => [Accessor<ParamValues>, (paramValues: ParamValues) => void];

  /// ui-solid.useParamValue
  useParamValue: (
    queryId: MaybeAccessor<Id>,
    paramId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => Accessor<ParamValue | undefined>;

  /// ui-solid.useParamValueState
  useParamValueState: (
    queryId: MaybeAccessor<Id>,
    paramId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => [Accessor<ParamValue | undefined>, (paramValue: ParamValue) => void];

  /// ui-solid.useParamValuesListener
  useParamValuesListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ParamValuesListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useParamValueListener
  useParamValueListener: (
    queryId: MaybeAccessor<IdOrNull>,
    paramId: MaybeAccessor<IdOrNull>,
    listener: ParamValueListener<Schemas>,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
  ) => void;

  /// ui-solid.useSetParamValueCallback
  useSetParamValueCallback: <Parameter>(
    queryId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    paramId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getParamValue: (
      parameter: Parameter,
      queries: Queries<Schemas>,
    ) => ParamValue,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
    then?: (queries: Queries<Schemas>, paramValue: ParamValue) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetParamValuesCallback
  useSetParamValuesCallback: <Parameter>(
    queryId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getParamValues: (
      parameter: Parameter,
      queries: Queries<Schemas>,
    ) => ParamValues,
    queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId<Schemas> | undefined>,
    then?: (queries: Queries<Schemas>, paramValues: ParamValues) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useCreateCheckpoints
  useCreateCheckpoints: (
    store: MaybeAccessor<Store<Schemas> | undefined>,
    create: (store: Store<Schemas>) => Checkpoints<Schemas>,
  ) => Accessor<Checkpoints<Schemas> | undefined>;

  /// ui-solid.useCheckpointsIds
  useCheckpointsIds: () => Accessor<Ids>;

  /// ui-solid.useCheckpoints
  useCheckpoints: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Checkpoints<Schemas> | undefined>;

  /// ui-solid.useCheckpointsOrCheckpointsById
  useCheckpointsOrCheckpointsById: (
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => Accessor<Checkpoints<Schemas> | undefined>;

  // useProvideCheckpoints
  useProvideCheckpoints: (
    checkpointsId: Id,
    checkpoints: Checkpoints<Schemas>,
  ) => void;

  /// ui-solid.useCheckpointIds
  useCheckpointIds: (
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => Accessor<CheckpointIds>;

  /// ui-solid.useCheckpoint
  useCheckpoint: (
    checkpointId: MaybeAccessor<Id>,
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => Accessor<string | undefined>;

  /// ui-solid.useSetCheckpointCallback
  useSetCheckpointCallback: <Parameter>(
    getCheckpoint?: (parameter: Parameter) => string,
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
    then?: (
      checkpointId: MaybeAccessor<Id>,
      checkpoints: Checkpoints<Schemas>,
      label?: string,
    ) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useGoBackwardCallback
  useGoBackwardCallback: (
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => Callback;

  /// ui-solid.useGoForwardCallback
  useGoForwardCallback: (
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => Callback;

  /// ui-solid.useGoToCallback
  useGoToCallback: <Parameter>(
    getCheckpointId: (parameter: Parameter) => Id,
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
    then?: (checkpoints: Checkpoints<Schemas>, checkpointId: Id) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useUndoInformation
  useUndoInformation: (
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => UndoOrRedoInformation;

  /// ui-solid.useRedoInformation
  useRedoInformation: (
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => UndoOrRedoInformation;

  /// ui-solid.useCheckpointIdsListener
  useCheckpointIdsListener: (
    listener: CheckpointIdsListener<Schemas>,
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.useCheckpointListener
  useCheckpointListener: (
    checkpointId: MaybeAccessor<IdOrNull>,
    listener: CheckpointListener<Schemas>,
    checkpointsOrCheckpointsId?: MaybeAccessor<
      CheckpointsOrCheckpointsId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.useCreatePersister
  useCreatePersister: <
    Persist extends Persists,
    PersisterOrUndefined extends Persister<Schemas, Persist> | undefined,
  >(
    store: MaybeAccessor<PersistedStore<Schemas, Persist> | undefined>,
    create: (
      store: PersistedStore<Schemas, Persist>,
    ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
    then?: (persister: Persister<Schemas, Persist>) => Promise<any>,
    destroy?: (persister: Persister<Schemas, Persist>) => void,
  ) => Accessor<PersisterOrUndefined | undefined>;

  /// ui-solid.usePersisterIds
  usePersisterIds: () => Accessor<Ids>;

  /// ui-solid.usePersister
  usePersister: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Persister<Schemas, Persists.StoreOrMergeableStore> | undefined>;

  /// ui-solid.usePersisterOrPersisterById
  usePersisterOrPersisterById: (
    persisterOrPersisterId?: MaybeAccessor<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => Accessor<Persister<Schemas, Persists.StoreOrMergeableStore> | undefined>;

  // useProvidePersister
  useProvidePersister: (
    persisterId: Id,
    persister: AnyPersister<Schemas> | undefined,
  ) => void;

  /// ui-solid.usePersisterStatus
  usePersisterStatus: (
    persisterOrPersisterId?: MaybeAccessor<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => Accessor<Status>;

  /// ui-solid.usePersisterStatusListener
  usePersisterStatusListener: (
    listener: StatusListener<Schemas>,
    persisterOrPersisterId?: MaybeAccessor<
      PersisterOrPersisterId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.useCreateSynchronizer
  useCreateSynchronizer: <
    SynchronizerOrUndefined extends Synchronizer<Schemas> | undefined,
  >(
    store: MaybeAccessor<MergeableStore<Schemas> | undefined>,
    create: (
      store: MergeableStore<Schemas>,
    ) => Promise<SynchronizerOrUndefined>,
    destroy?: (synchronizer: Synchronizer<Schemas>) => void,
  ) => Accessor<SynchronizerOrUndefined | undefined>;

  /// ui-solid.useSynchronizerIds
  useSynchronizerIds: () => Accessor<Ids>;

  /// ui-solid.useSynchronizer
  useSynchronizer: (
    id?: MaybeAccessor<Id | undefined>,
  ) => Accessor<Synchronizer<Schemas> | undefined>;

  /// ui-solid.useSynchronizerOrSynchronizerById
  useSynchronizerOrSynchronizerById: (
    synchronizerOrSynchronizerId?: MaybeAccessor<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => Accessor<Synchronizer<Schemas> | undefined>;

  // useProvideSynchronizer
  useProvideSynchronizer: (
    synchronizerId: Id,
    synchronizer: Synchronizer<Schemas> | undefined,
  ) => void;

  /// ui-solid.useSynchronizerStatus
  useSynchronizerStatus: (
    synchronizerOrSynchronizerId?: MaybeAccessor<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => Accessor<Status>;

  /// ui-solid.useSynchronizerStatusListener
  useSynchronizerStatusListener: (
    listener: StatusListener<Schemas>,
    synchronizerOrSynchronizerId?: MaybeAccessor<
      SynchronizerOrSynchronizerId<Schemas> | undefined
    >,
  ) => void;

  /// ui-solid.ExtraProps
  ExtraProps: ExtraProps;

  /// ui-solid.TablesProps
  TablesProps: TablesProps<Schemas>;

  /// ui-solid.TableProps
  TableProps: TableProps<Schemas>;

  /// ui-solid.SortedTableProps
  SortedTableProps: SortedTableProps<Schemas>;

  /// ui-solid.RowProps
  RowProps: RowProps<Schemas>;

  /// ui-solid.CellProps
  CellProps: CellProps<Schemas>;

  /// ui-solid.ValuesProps
  ValuesProps: ValuesProps<Schemas>;

  /// ui-solid.ValueProps
  ValueProps: ValueProps<Schemas>;

  /// ui-solid.MetricProps
  MetricProps: MetricProps<Schemas>;

  /// ui-solid.IndexProps
  IndexProps: IndexProps<Schemas>;

  /// ui-solid.SliceProps
  SliceProps: SliceProps<Schemas>;

  /// ui-solid.RemoteRowProps
  RemoteRowProps: RemoteRowProps<Schemas>;

  /// ui-solid.LocalRowsProps
  LocalRowsProps: LocalRowsProps<Schemas>;

  /// ui-solid.LinkedRowsProps
  LinkedRowsProps: LinkedRowsProps<Schemas>;

  /// ui-solid.ResultTableProps
  ResultTableProps: ResultTableProps<Schemas>;

  /// ui-solid.ResultSortedTableProps
  ResultSortedTableProps: ResultSortedTableProps<Schemas>;

  /// ui-solid.ResultRowProps
  ResultRowProps: ResultRowProps<Schemas>;

  /// ui-solid.ResultCellProps
  ResultCellProps: ResultCellProps<Schemas>;

  /// ui-solid.CheckpointProps
  CheckpointProps: CheckpointProps<Schemas>;

  /// ui-solid.BackwardCheckpointsProps
  BackwardCheckpointsProps: BackwardCheckpointsProps<Schemas>;

  /// ui-solid.CurrentCheckpointProps
  CurrentCheckpointProps: CurrentCheckpointProps<Schemas>;

  /// ui-solid.ForwardCheckpointsProps
  ForwardCheckpointsProps: ForwardCheckpointsProps<Schemas>;

  /// ui-solid.ProviderProps
  ProviderProps: ProviderProps<Schemas>;

  /// ui-solid.ComponentReturnType
  ComponentReturnType: ComponentReturnType;

  /// ui-solid.Provider
  Provider: (
    props: ProviderProps<Schemas> & {children: JSXElement},
  ) => ComponentReturnType;

  /// ui-solid.CellView
  CellView: (props: CellProps<Schemas>) => ComponentReturnType;

  /// ui-solid.RowView
  RowView: (props: RowProps<Schemas>) => ComponentReturnType;

  /// ui-solid.SortedTableView
  SortedTableView: (props: SortedTableProps<Schemas>) => ComponentReturnType;

  /// ui-solid.TableView
  TableView: (props: TableProps<Schemas>) => ComponentReturnType;

  /// ui-solid.TablesView
  TablesView: (props: TablesProps<Schemas>) => ComponentReturnType;

  /// ui-solid.ValueView
  ValueView: (props: ValueProps<Schemas>) => ComponentReturnType;

  /// ui-solid.ValuesView
  ValuesView: (props: ValuesProps<Schemas>) => ComponentReturnType;

  /// ui-solid.MetricView
  MetricView: (props: MetricProps<Schemas>) => ComponentReturnType;

  /// ui-solid.SliceView
  SliceView: (props: SliceProps<Schemas>) => ComponentReturnType;

  /// ui-solid.IndexView
  IndexView: (props: IndexProps<Schemas>) => ComponentReturnType;

  /// ui-solid.RemoteRowView
  RemoteRowView: (props: RemoteRowProps<Schemas>) => ComponentReturnType;

  /// ui-solid.LocalRowsView
  LocalRowsView: (props: LocalRowsProps<Schemas>) => ComponentReturnType;

  /// ui-solid.LinkedRowsView
  LinkedRowsView: (props: LinkedRowsProps<Schemas>) => ComponentReturnType;

  /// ui-solid.ResultCellView
  ResultCellView: (props: ResultCellProps<Schemas>) => ComponentReturnType;

  /// ui-solid.ResultRowView
  ResultRowView: (props: ResultRowProps<Schemas>) => ComponentReturnType;

  /// ui-solid.ResultSortedTableView
  ResultSortedTableView: (
    props: ResultSortedTableProps<Schemas>,
  ) => ComponentReturnType;

  /// ui-solid.ResultTableView
  ResultTableView: (props: ResultTableProps<Schemas>) => ComponentReturnType;

  /// ui-solid.CheckpointView
  CheckpointView: (props: CheckpointProps<Schemas>) => ComponentReturnType;

  /// ui-solid.BackwardCheckpointsView
  BackwardCheckpointsView: (
    props: BackwardCheckpointsProps<Schemas>,
  ) => ComponentReturnType;

  /// ui-solid.CurrentCheckpointView
  CurrentCheckpointView: (
    props: CurrentCheckpointProps<Schemas>,
  ) => ComponentReturnType;

  /// ui-solid.ForwardCheckpointsView
  ForwardCheckpointsView: (
    props: ForwardCheckpointsProps<Schemas>,
  ) => ComponentReturnType;
};
