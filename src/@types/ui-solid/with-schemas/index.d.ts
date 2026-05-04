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

type MaybeStoreOrStoreId<Schemas extends OptionalSchemas> = MaybeAccessor<
  StoreOrStoreId<Schemas> | undefined
>;
type MaybeMetricsOrMetricsId<Schemas extends OptionalSchemas> = MaybeAccessor<
  MetricsOrMetricsId<Schemas> | undefined
>;
type MaybeIndexesOrIndexesId<Schemas extends OptionalSchemas> = MaybeAccessor<
  IndexesOrIndexesId<Schemas> | undefined
>;
type MaybeRelationshipsOrRelationshipsId<Schemas extends OptionalSchemas> =
  MaybeAccessor<RelationshipsOrRelationshipsId<Schemas> | undefined>;
type MaybeQueriesOrQueriesId<Schemas extends OptionalSchemas> = MaybeAccessor<
  QueriesOrQueriesId<Schemas> | undefined
>;
type MaybeCheckpointsOrCheckpointsId<Schemas extends OptionalSchemas> =
  MaybeAccessor<CheckpointsOrCheckpointsId<Schemas> | undefined>;
type MaybePersisterOrPersisterId<Schemas extends OptionalSchemas> =
  MaybeAccessor<PersisterOrPersisterId<Schemas> | undefined>;
type MaybeSynchronizerOrSynchronizerId<Schemas extends OptionalSchemas> =
  MaybeAccessor<SynchronizerOrSynchronizerId<Schemas> | undefined>;

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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<Store<Schemas> | undefined>;

  /// ui-solid.useProvideStore
  useProvideStore: (storeId: Id, store: Store<Schemas>) => void;

  /// ui-solid.useHasTables
  useHasTables: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useTables
  useTables: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<Tables<Schemas[0]>>;

  /// ui-solid.useTablesState
  useTablesState: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => [Accessor<Tables<Schemas[0]>>, (tables: Tables<Schemas[0]>) => void];

  /// ui-solid.useTableIds
  useTableIds: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<TableIdFromSchema<Schemas[0]>[]>;

  /// ui-solid.useHasTable
  useHasTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useTable
  useTable: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<Table<Schemas[0], TableId>>;

  /// ui-solid.useTableState
  useTableState: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => [
    Accessor<Table<Schemas[0], TableId>>,
    (table: Table<Schemas[0], TableId>) => void,
  ];

  /// ui-solid.useTableCellIds
  useTableCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<CellIdFromSchema<Schemas[0], TableId>[]>;

  /// ui-solid.useHasTableCell
  useHasTableCell: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    cellId: MaybeAccessor<CellIdFromSchema<Schemas[0], TableId>>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useRowCount
  useRowCount: (
    tableId: MaybeAccessor<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<number>;

  /// ui-solid.useRowIds
  useRowIds: (
    tableId: MaybeAccessor<TableIdFromSchema<Schemas[0]>>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<Ids>;

  useSortedRowIds: {
    /// ui-solid.useSortedRowIds
    <
      TableId extends TableIdFromSchema<Schemas[0]>,
      CellId extends CellIdFromSchema<Schemas[0], TableId>,
    >(
      tableId: MaybeAccessor<TableId>,
      cellId?: CellId,
      descending?: MaybeAccessor<boolean | undefined>,
      offset?: MaybeAccessor<number | undefined>,
      limit?: MaybeAccessor<number | undefined>,
      storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    ): Accessor<Ids>;

    /// ui-solid.useSortedRowIds.2
    <TableId extends TableIdFromSchema<Schemas[0]>>(
      args: SortedRowIdsArgs<Schemas[0], TableId>,
      storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    ): Accessor<Ids>;
  };

  /// ui-solid.useHasRow
  useHasRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useRow
  useRow: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<Row<Schemas[0], TableId>>;

  /// ui-solid.useRowState
  useRowState: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => [
    Accessor<Row<Schemas[0], TableId>>,
    (row: Row<Schemas[0], TableId>) => void,
  ];

  /// ui-solid.useCellIds
  useCellIds: <TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<CellIdFromSchema<Schemas[0], TableId>[]>;

  /// ui-solid.useHasCell
  useHasCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<CellId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useCell
  useCell: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<CellId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<NoInfer<CellOrUndefined<Schemas[0], TableId, CellId>>>;

  /// ui-solid.useCellState
  useCellState: <
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: MaybeAccessor<TableId>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<CellId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => [
    Accessor<CellOrUndefined<Schemas[0], TableId, CellId>>,
    (cell: Cell<Schemas[0], TableId, CellId>) => void,
  ];

  /// ui-solid.useHasValues
  useHasValues: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useValues
  useValues: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<Values<Schemas[1]>>;

  /// ui-solid.useValuesState
  useValuesState: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => [Accessor<Values<Schemas[1]>>, (values: Values<Schemas[1]>) => void];

  /// ui-solid.useValueIds
  useValueIds: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<ValueIdFromSchema<Schemas[1]>[]>;

  /// ui-solid.useHasValue
  useHasValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeAccessor<ValueId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<boolean>;

  /// ui-solid.useValue
  useValue: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeAccessor<ValueId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => Accessor<DefaultedValueFromSchema<Schemas[1], ValueId>>;

  /// ui-solid.useValueState
  useValueState: <ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: MaybeAccessor<ValueId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => [
    value: Accessor<DefaultedValueFromSchema<Schemas[1], ValueId>>,
    setValue: (value: Value<Schemas[1], ValueId>) => void,
  ];

  /// ui-solid.useSetTablesCallback
  useSetTablesCallback: <Parameter, SetTables = Tables<Schemas[0], true>>(
    getTables: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetTables>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, tables: SetTables) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetTableCallback
  useSetTableCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    SetTable = Table<Schemas[0], TableId, true>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    getTable: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetTable>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, table: SetTable) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetRowCallback
  useSetRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    SetRow = Row<Schemas[0], TableId, true>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getRow: (parameter: Parameter, store: Store<Schemas>) => NoInfer<SetRow>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, row: SetRow) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useAddRowCallback
  useAddRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    AddRow = Row<Schemas[0], TableId, true>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    getRow: (parameter: Parameter, store: Store<Schemas>) => NoInfer<AddRow>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (rowId: Id | undefined, store: Store<Schemas>, row: AddRow) => void,
    reuseRowIds?: boolean,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetPartialRowCallback
  useSetPartialRowCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    SetPartialRow = Row<Schemas[0], TableId, true>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getPartialRow: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetPartialRow>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, partialRow: SetPartialRow) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetCellCallback
  useSetCellCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    SetOrMapCell =
      | Cell<Schemas[0], TableId, CellId>
      | MapCell<Schemas[0], TableId, CellId>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    cellId: MaybeAccessor<CellId> | GetId<Schemas, Parameter, CellId>,
    getCell: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetOrMapCell>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, cell: SetOrMapCell) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetValuesCallback
  useSetValuesCallback: <Parameter, SetValues = Values<Schemas[1], true>>(
    getValues: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetValues>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, values: SetValues) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetPartialValuesCallback
  useSetPartialValuesCallback: <
    Parameter,
    SetPartialValues = Values<Schemas[1], true>,
  >(
    getPartialValues: (
      parameter: Parameter,
      store: Store<Schemas>,
    ) => NoInfer<SetPartialValues>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, partialValues: SetPartialValues) => void,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>, value: SetOrMapValue) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelTablesCallback
  useDelTablesCallback: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
  ) => Callback;

  /// ui-solid.useDelTableCallback
  useDelTableCallback: <
    Parameter,
    TableId extends TableIdFromSchema<Schemas[0]>,
  >(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelRowCallback
  useDelRowCallback: <Parameter, TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: MaybeAccessor<TableId> | GetId<Schemas, Parameter, TableId>,
    rowId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useDelValuesCallback
  useDelValuesCallback: (
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
  ) => Callback;

  /// ui-solid.useDelValueCallback
  useDelValueCallback: <
    Parameter,
    ValueId extends ValueIdFromSchema<Schemas[1]>,
  >(
    valueId: MaybeAccessor<ValueId> | GetId<Schemas, Parameter, ValueId>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    then?: (store: Store<Schemas>) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useHasTablesListener
  useHasTablesListener: (
    listener: HasTablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useTablesListener
  useTablesListener: (
    listener: TablesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useTableIdsListener
  useTableIdsListener: (
    listener: TableIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useHasTableListener
  useHasTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: HasTableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useTableListener
  useTableListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useTableCellIdsListener
  useTableCellIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: TableCellIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useRowCountListener
  useRowCountListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: RowCountListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useRowIdsListener
  useRowIdsListener: <
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: MaybeAccessor<TableIdOrNull>,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  useSortedRowIdsListener: {
    /// ui-solid.useSortedRowIdsListener
    <
      TableId extends TableIdFromSchema<Schemas[0]>,
      CellIdOrUndefined extends
        | CellIdFromSchema<Schemas[0], TableId>
        | undefined,
    >(
      tableId: MaybeAccessor<TableId>,
      cellId: MaybeAccessor<CellIdOrUndefined>,
      descending: MaybeAccessor<boolean>,
      offset: MaybeAccessor<number>,
      limit: MaybeAccessor<number | undefined>,
      listener: SortedRowIdsListener<Schemas, TableId, CellIdOrUndefined>,
      mutator?: boolean,
      storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
    ): void;

    /// ui-solid.useSortedRowIdsListener.2
    <
      TableId extends TableIdFromSchema<Schemas[0]>,
      CellIdOrUndefined extends
        | CellIdFromSchema<Schemas[0], TableId>
        | undefined,
    >(
      args: SortedRowIdsArgs<Schemas[0], TableId>,
      listener: SortedRowIdsListener<Schemas, TableId, CellIdOrUndefined>,
      mutator?: boolean,
      storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useHasValuesListener
  useHasValuesListener: (
    listener: HasValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useValuesListener
  useValuesListener: (
    listener: ValuesListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useValueIdsListener
  useValueIdsListener: (
    listener: ValueIdsListener<Schemas>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useHasValueListener
  useHasValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: MaybeAccessor<ValueIdOrNull>,
    listener: HasValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useValueListener
  useValueListener: <
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  >(
    valueId: MaybeAccessor<ValueIdOrNull>,
    listener: ValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useStartTransactionListener
  useStartTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useWillFinishTransactionListener
  useWillFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
  ) => void;

  /// ui-solid.useDidFinishTransactionListener
  useDidFinishTransactionListener: (
    listener: TransactionListener<Schemas>,
    storeOrStoreId?: MaybeStoreOrStoreId<Schemas>,
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
    metricsOrMetricsId?: MaybeMetricsOrMetricsId<Schemas>,
  ) => Accessor<Metrics<Schemas> | undefined>;

  // useProvideMetrics
  useProvideMetrics: (metricsId: Id, metrics: Metrics<Schemas>) => void;

  /// ui-solid.useMetricIds
  useMetricIds(
    metricsOrMetricsId?: MaybeMetricsOrMetricsId<Schemas>,
  ): Accessor<Ids>;

  /// ui-solid.useMetric
  useMetric: (
    metricId: MaybeAccessor<Id>,
    metricsOrMetricsId?: MaybeMetricsOrMetricsId<Schemas>,
  ) => Accessor<number | undefined>;

  /// ui-solid.useMetricListener
  useMetricListener: (
    metricId: MaybeAccessor<IdOrNull>,
    listener: MetricListener<Schemas>,
    metricsOrMetricsId?: MaybeMetricsOrMetricsId<Schemas>,
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
    indexesOrIndexesId?: MaybeIndexesOrIndexesId<Schemas>,
  ) => Accessor<Indexes<Schemas> | undefined>;

  // useProvideIndexes
  useProvideIndexes: (indexesId: Id, indexes: Indexes<Schemas>) => void;

  /// ui-solid.useIndexIds
  useIndexIds(
    indexesOrIndexesId?: MaybeIndexesOrIndexesId<Schemas>,
  ): Accessor<Ids>;

  /// ui-solid.useSliceIds
  useSliceIds: (
    indexId: MaybeAccessor<Id>,
    indexesOrIndexesId?: MaybeIndexesOrIndexesId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useSliceRowIds
  useSliceRowIds: (
    indexId: MaybeAccessor<Id>,
    sliceId: MaybeAccessor<Id>,
    indexesOrIndexesId?: MaybeIndexesOrIndexesId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useSliceIdsListener
  useSliceIdsListener: (
    indexId: MaybeAccessor<IdOrNull>,
    listener: SliceIdsListener<Schemas>,
    indexesOrIndexesId?: MaybeIndexesOrIndexesId<Schemas>,
  ) => void;

  /// ui-solid.useSliceRowIdsListener
  useSliceRowIdsListener: (
    indexId: MaybeAccessor<IdOrNull>,
    sliceId: MaybeAccessor<IdOrNull>,
    listener: SliceRowIdsListener<Schemas>,
    indexesOrIndexesId?: MaybeIndexesOrIndexesId<Schemas>,
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
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ) => Accessor<Relationships<Schemas> | undefined>;

  // useProvideRelationships
  useProvideRelationships: (
    relationshipsId: Id,
    relationships: Relationships<Schemas>,
  ) => void;

  /// ui-solid.useRelationshipIds
  useRelationshipIds(
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ): Accessor<Ids>;

  /// ui-solid.useRemoteRowId
  useRemoteRowId: (
    relationshipId: MaybeAccessor<Id>,
    localRowId: MaybeAccessor<Id>,
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ) => Accessor<Id | undefined>;

  /// ui-solid.useLocalRowIds
  useLocalRowIds: (
    relationshipId: MaybeAccessor<Id>,
    remoteRowId: MaybeAccessor<Id>,
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useLinkedRowIds
  useLinkedRowIds: (
    relationshipId: MaybeAccessor<Id>,
    firstRowId: MaybeAccessor<Id>,
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useRemoteRowIdListener
  useRemoteRowIdListener: (
    relationshipId: MaybeAccessor<IdOrNull>,
    localRowId: MaybeAccessor<IdOrNull>,
    listener: RemoteRowIdListener<Schemas>,
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-solid.useLocalRowIdsListener
  useLocalRowIdsListener: (
    relationshipId: MaybeAccessor<IdOrNull>,
    remoteRowId: MaybeAccessor<IdOrNull>,
    listener: LocalRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
  ) => void;

  /// ui-solid.useLinkedRowIdsListener
  useLinkedRowIdsListener: (
    relationshipId: MaybeAccessor<Id>,
    firstRowId: MaybeAccessor<Id>,
    listener: LinkedRowIdsListener<Schemas>,
    relationshipsOrRelationshipsId?: MaybeRelationshipsOrRelationshipsId<Schemas>,
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
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<Queries<Schemas> | undefined>;

  // useProvideQueries
  useProvideQueries: (queriesId: Id, queries: Queries<Schemas>) => void;

  /// ui-solid.useQueryIds
  useQueryIds(
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ): Accessor<Ids>;

  /// ui-solid.useResultTable
  useResultTable: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<ResultTable>;

  /// ui-solid.useResultTableCellIds
  useResultTableCellIds: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultRowCount
  useResultRowCount: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<number>;

  /// ui-solid.useResultRowIds
  useResultRowIds: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultSortedRowIds
  useResultSortedRowIds: (
    queryId: MaybeAccessor<Id>,
    cellId?: MaybeAccessor<Id | undefined>,
    descending?: MaybeAccessor<boolean | undefined>,
    offset?: MaybeAccessor<number | undefined>,
    limit?: MaybeAccessor<number | undefined>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultRow
  useResultRow: (
    queryId: MaybeAccessor<Id>,
    rowId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<ResultRow>;

  /// ui-solid.useResultCellIds
  useResultCellIds: (
    queryId: MaybeAccessor<Id>,
    rowId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<Ids>;

  /// ui-solid.useResultCell
  useResultCell: (
    queryId: MaybeAccessor<Id>,
    rowId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<ResultCell | undefined>;

  /// ui-solid.useResultTableListener
  useResultTableListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultTableListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultTableCellIdsListener
  useResultTableCellIdsListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultTableCellIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultRowCountListener
  useResultRowCountListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultRowCountListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultRowIdsListener
  useResultRowIdsListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ResultRowIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultSortedRowIdsListener
  useResultSortedRowIdsListener: (
    queryId: MaybeAccessor<Id>,
    cellId: MaybeAccessor<Id | undefined>,
    descending: MaybeAccessor<boolean>,
    offset: MaybeAccessor<number>,
    limit: MaybeAccessor<number | undefined>,
    listener: ResultSortedRowIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultRowListener
  useResultRowListener: (
    queryId: MaybeAccessor<IdOrNull>,
    rowId: MaybeAccessor<IdOrNull>,
    listener: ResultRowListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultCellIdsListener
  useResultCellIdsListener: (
    queryId: MaybeAccessor<IdOrNull>,
    rowId: MaybeAccessor<IdOrNull>,
    listener: ResultCellIdsListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useResultCellListener
  useResultCellListener: (
    queryId: MaybeAccessor<IdOrNull>,
    rowId: MaybeAccessor<IdOrNull>,
    cellId: MaybeAccessor<IdOrNull>,
    listener: ResultCellListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useParamValues
  useParamValues: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<ParamValues>;

  /// ui-solid.useParamValuesState
  useParamValuesState: (
    queryId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => [Accessor<ParamValues>, (paramValues: ParamValues) => void];

  /// ui-solid.useParamValue
  useParamValue: (
    queryId: MaybeAccessor<Id>,
    paramId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => Accessor<ParamValue | undefined>;

  /// ui-solid.useParamValueState
  useParamValueState: (
    queryId: MaybeAccessor<Id>,
    paramId: MaybeAccessor<Id>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => [Accessor<ParamValue | undefined>, (paramValue: ParamValue) => void];

  /// ui-solid.useParamValuesListener
  useParamValuesListener: (
    queryId: MaybeAccessor<IdOrNull>,
    listener: ParamValuesListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useParamValueListener
  useParamValueListener: (
    queryId: MaybeAccessor<IdOrNull>,
    paramId: MaybeAccessor<IdOrNull>,
    listener: ParamValueListener<Schemas>,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
  ) => void;

  /// ui-solid.useSetParamValueCallback
  useSetParamValueCallback: <Parameter>(
    queryId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    paramId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getParamValue: (
      parameter: Parameter,
      queries: Queries<Schemas>,
    ) => ParamValue,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
    then?: (queries: Queries<Schemas>, paramValue: ParamValue) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useSetParamValuesCallback
  useSetParamValuesCallback: <Parameter>(
    queryId: MaybeAccessor<Id> | GetId<Schemas, Parameter, Id>,
    getParamValues: (
      parameter: Parameter,
      queries: Queries<Schemas>,
    ) => ParamValues,
    queriesOrQueriesId?: MaybeQueriesOrQueriesId<Schemas>,
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
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => Accessor<Checkpoints<Schemas> | undefined>;

  // useProvideCheckpoints
  useProvideCheckpoints: (
    checkpointsId: Id,
    checkpoints: Checkpoints<Schemas>,
  ) => void;

  /// ui-solid.useCheckpointIds
  useCheckpointIds: (
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => Accessor<CheckpointIds>;

  /// ui-solid.useCheckpoint
  useCheckpoint: (
    checkpointId: MaybeAccessor<Id>,
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => Accessor<string | undefined>;

  /// ui-solid.useSetCheckpointCallback
  useSetCheckpointCallback: <Parameter>(
    getCheckpoint?: (parameter: Parameter) => string,
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
    then?: (
      checkpointId: MaybeAccessor<Id>,
      checkpoints: Checkpoints<Schemas>,
      label?: string,
    ) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useGoBackwardCallback
  useGoBackwardCallback: (
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => Callback;

  /// ui-solid.useGoForwardCallback
  useGoForwardCallback: (
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => Callback;

  /// ui-solid.useGoToCallback
  useGoToCallback: <Parameter>(
    getCheckpointId: (parameter: Parameter) => Id,
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
    then?: (checkpoints: Checkpoints<Schemas>, checkpointId: Id) => void,
  ) => ParameterizedCallback<Parameter>;

  /// ui-solid.useUndoInformation
  useUndoInformation: (
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => UndoOrRedoInformation;

  /// ui-solid.useRedoInformation
  useRedoInformation: (
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => UndoOrRedoInformation;

  /// ui-solid.useCheckpointIdsListener
  useCheckpointIdsListener: (
    listener: CheckpointIdsListener<Schemas>,
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
  ) => void;

  /// ui-solid.useCheckpointListener
  useCheckpointListener: (
    checkpointId: MaybeAccessor<IdOrNull>,
    listener: CheckpointListener<Schemas>,
    checkpointsOrCheckpointsId?: MaybeCheckpointsOrCheckpointsId<Schemas>,
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
    persisterOrPersisterId?: MaybePersisterOrPersisterId<Schemas>,
  ) => Accessor<Persister<Schemas, Persists.StoreOrMergeableStore> | undefined>;

  // useProvidePersister
  useProvidePersister: (
    persisterId: Id,
    persister: AnyPersister<Schemas> | undefined,
  ) => void;

  /// ui-solid.usePersisterStatus
  usePersisterStatus: (
    persisterOrPersisterId?: MaybePersisterOrPersisterId<Schemas>,
  ) => Accessor<Status>;

  /// ui-solid.usePersisterStatusListener
  usePersisterStatusListener: (
    listener: StatusListener<Schemas>,
    persisterOrPersisterId?: MaybePersisterOrPersisterId<Schemas>,
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
    synchronizerOrSynchronizerId?: MaybeSynchronizerOrSynchronizerId<Schemas>,
  ) => Accessor<Synchronizer<Schemas> | undefined>;

  // useProvideSynchronizer
  useProvideSynchronizer: (
    synchronizerId: Id,
    synchronizer: Synchronizer<Schemas> | undefined,
  ) => void;

  /// ui-solid.useSynchronizerStatus
  useSynchronizerStatus: (
    synchronizerOrSynchronizerId?: MaybeSynchronizerOrSynchronizerId<Schemas>,
  ) => Accessor<Status>;

  /// ui-solid.useSynchronizerStatusListener
  useSynchronizerStatusListener: (
    listener: StatusListener<Schemas>,
    synchronizerOrSynchronizerId?: MaybeSynchronizerOrSynchronizerId<Schemas>,
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
