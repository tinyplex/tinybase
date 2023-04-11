/// store

import {Id, IdOrNull, Ids, Json} from './common.d';

/// TablesSchema
export type TablesSchema = {[tableId: Id]: {[cellId: Id]: CellSchema}};
export type TablesSchemaAlias = TablesSchema;

/// CellSchema
export type CellSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/// ValuesSchema
export type ValuesSchema = {[valueId: Id]: ValueSchema};
export type ValuesSchemaAlias = ValuesSchema;

/// ValueSchema
export type ValueSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/// NoTablesSchema
export type NoTablesSchema = {[tableId: Id]: {[cellId: Id]: {type: 'any'}}};

/// NoValuesSchema
export type NoValuesSchema = {[valueId: Id]: {type: 'any'}};

/// OptionalTablesSchema
export type OptionalTablesSchema = TablesSchema | NoTablesSchema;

/// OptionalValuesSchema
export type OptionalValuesSchema = ValuesSchema | NoValuesSchema;

/// OptionalSchemas
export type OptionalSchemas = [OptionalTablesSchema, OptionalValuesSchema];

/// NoSchemas
export type NoSchemas = [NoTablesSchema, NoValuesSchema];

/// Tables
export type Tables<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  WhenSet extends boolean = false,
> = TablesFromSchema<Schema, WhenSet>;

/// Table
export type Table<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  WhenSet extends boolean = false,
> = TableFromSchema<Schema, TableId, WhenSet>;

/// Row
export type Row<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  WhenSet extends boolean = false,
> = RowFromSchema<Schema, TableId, WhenSet>;

/// Cell
export type Cell<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId> = CellIdFromSchema<
    Schema,
    TableId
  >,
> = CellFromSchema<Schema, TableId, CellId>;

/// CellOrUndefined
export type CellOrUndefined<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId> = CellIdFromSchema<
    Schema,
    TableId
  >,
  Cell = CellFromSchema<Schema, TableId, CellId>,
> = Cell | undefined;

/// Values
export type Values<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  WhenSet extends boolean = false,
> = ValuesFromSchema<Schema, WhenSet>;

/// Value
export type Value<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
> = ValueFromSchema<Schema, ValueId>;

/// ValueOrUndefined
export type ValueOrUndefined<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
  Value = ValueFromSchema<Schema, ValueId>,
> = Value | undefined;

/// TableCallback
export type TableCallback<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = (
  tableId: TableId,
  forEachRow: (rowCallback: RowCallback<Schema, TableId>) => void,
) => void;
export type TableCallbackAlias<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = TableCallback<Schema, TableId>;

/// RowCallback
export type RowCallback<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = (
  rowId: Id,
  forEachCell: (cellCallback: CellCallback<Schema, TableId>) => void,
) => void;
export type RowCallbackAlias<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = RowCallback<Schema, TableId>;

/// CellCallback
export type CellCallback<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId> = CellIdFromSchema<
    Schema,
    TableId
  >,
> = (cellId: CellId, cell: Cell<Schema, TableId, CellId>) => void;
export type CellCallbackAlias<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId> = CellIdFromSchema<
    Schema,
    TableId
  >,
> = CellCallback<Schema, TableId, CellId>;

/// ValueCallback
export type ValueCallback<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
> = (valueId: ValueId, value: Value<Schema, ValueId>) => void;
export type ValueCallbackAlias<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
> = ValueCallback<Schema, ValueId>;

/// MapCell
export type MapCell<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId> = CellIdFromSchema<
    Schema,
    TableId
  >,
> = (
  cell: CellOrUndefined<Schema, TableId, CellId>,
) => Cell<Schema, TableId, CellId>;

/// MapValue
export type MapValue<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
> = (value: ValueOrUndefined<Schema, ValueId>) => Value<Schema, ValueId>;

/// GetCell
export type GetCell<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = <
  CellId extends CellIdFromSchema<Schema, TableId>,
  CellOrUndefined = Cell<Schema, TableId, CellId> | undefined,
>(
  cellId: CellId,
) => CellOrUndefined;
export type GetCellAlias<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = GetCell<Schema, TableId>;

/// DoRollback
export type DoRollback<
  Schemas extends OptionalSchemas = NoSchemas,
  TablesSchema extends OptionalTablesSchema = Schemas[0],
  ValuesSchema extends OptionalValuesSchema = Schemas[1],
> = (
  changedCells: ChangedCells<TablesSchema>,
  invalidCells: InvalidCells,
  changedValues: ChangedValues<ValuesSchema>,
  invalidValues: InvalidValues,
) => boolean;

/// TransactionListener
export type TransactionListener<Schemas extends OptionalSchemas = NoSchemas> = (
  store: Store<Schemas>,
  cellsTouched: boolean,
  valuesTouched: boolean,
) => void;

/// TablesListener
export type TablesListener<
  Schemas extends OptionalSchemas = NoSchemas,
  Schema extends OptionalTablesSchema = Schemas[0],
> = (
  store: Store<Schemas>,
  getCellChange: GetCellChange<Schema> | undefined,
) => void;

/// TableIdsListener
export type TableIdsListener<Schemas extends OptionalSchemas = NoSchemas> = (
  store: Store<Schemas>,
) => void;

/// TableListener
export type TableListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  TableId = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  Schema extends OptionalTablesSchema = Schemas[0],
> = (
  store: Store<Schemas>,
  tableId: TableId,
  getCellChange: GetCellChange<Schema> | undefined,
) => void;

/// RowIdsListener
export type RowIdsListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  TableId = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
> = (store: Store<Schemas>, tableId: TableId) => void;

/// SortedRowIdsListener
export type SortedRowIdsListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableId extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<Schemas[0]>,
  CellId extends CellIdFromSchema<Schemas[0], TableId> | undefined =
    | CellIdFromSchema<Schemas[0], TableId>
    | undefined,
  Descending extends boolean = boolean,
  Offset extends number = number,
  Limit extends number | undefined = number | undefined,
> = (
  store: Store<Schemas>,
  tableId: TableId,
  cellId: CellId,
  descending: Descending,
  offset: Offset,
  limit: Limit,
  sortedRowIds: Ids,
) => void;

/// RowListener
export type RowListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull = IdOrNull,
  TableId = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  RowId = RowIdOrNull extends null ? Id : RowIdOrNull,
  Schema extends OptionalTablesSchema = Schemas[0],
> = (
  store: Store<Schemas>,
  tableId: TableId,
  rowId: RowId,
  getCellChange: GetCellChange<Schema> | undefined,
) => void;

/// CellIdsListener
export type CellIdsListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull = null,
  TableId = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  RowId = RowIdOrNull extends null ? Id : RowIdOrNull,
> = (store: Store<Schemas>, tableId: TableId, rowId: RowId) => void;

/// CellListener
export type CellListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull = IdOrNull,
  CellIdOrNull extends
    | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
        ? CellIdFromSchema<Schemas[0], TableIdOrNull>
        : AllCellIdFromSchema<Schemas[0]>)
    | null =
    | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
        ? CellIdFromSchema<Schemas[0], TableIdOrNull>
        : AllCellIdFromSchema<Schemas[0]>)
    | null,
  TableId extends Id = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  RowId = RowIdOrNull extends null ? Id : RowIdOrNull,
  CellId extends Id = CellIdOrNull extends null
    ? TableIdOrNull extends TableIdFromSchema<Schemas[0]>
      ? CellIdFromSchema<Schemas[0], TableIdOrNull>
      : AllCellIdFromSchema<Schemas[0]>
    : CellIdOrNull,
  Cell = CellFromSchema<Schemas[0], TableId, CellId>,
  Schema extends OptionalTablesSchema = Schemas[0],
> = (
  store: Store<Schemas>,
  tableId: TableId,
  rowId: RowId,
  cellId: CellId,
  newCell: Cell,
  oldCell: Cell,
  getCellChange: GetCellChange<Schema> | undefined,
) => void;
export type CellListenerAlias<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull = IdOrNull,
  CellIdOrNull extends
    | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
        ? CellIdFromSchema<Schemas[0], TableIdOrNull>
        : AllCellIdFromSchema<Schemas[0]>)
    | null =
    | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
        ? CellIdFromSchema<Schemas[0], TableIdOrNull>
        : AllCellIdFromSchema<Schemas[0]>)
    | null,
> = CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>;

/// ValuesListener
export type ValuesListener<
  Schemas extends OptionalSchemas = NoSchemas,
  Schema extends OptionalValuesSchema = Schemas[1],
> = (
  store: Store<Schemas>,
  getValueChange: GetValueChange<Schema> | undefined,
) => void;

/// ValueIdsListener
export type ValueIdsListener<Schemas extends OptionalSchemas = NoSchemas> = (
  store: Store<Schemas>,
) => void;

/// ValueListener
export type ValueListener<
  Schemas extends OptionalSchemas = NoSchemas,
  ValueIdOrNull extends ValueIdFromSchema<
    Schemas[1]
  > | null = ValueIdFromSchema<Schemas[1]> | null,
  ValueId extends Id = ValueIdOrNull extends null
    ? ValueIdFromSchema<Schemas[1]>
    : ValueIdOrNull,
  Value = ValueFromSchema<Schemas[1], ValueId>,
  Schema extends OptionalValuesSchema = Schemas[1],
> = (
  store: Store<Schemas>,
  valueId: ValueId,
  newValue: Value,
  oldValue: Value,
  getValueChange: GetValueChange<Schema> | undefined,
) => void;
export type ValueListenerAlias<
  Schemas extends OptionalSchemas = NoSchemas,
  ValueIdOrNull extends ValueIdFromSchema<
    Schemas[1]
  > | null = ValueIdFromSchema<Schemas[1]> | null,
> = ValueListener<Schemas, ValueIdOrNull>;

/// InvalidCellListener
export type InvalidCellListener<Schemas extends OptionalSchemas = NoSchemas> = (
  store: Store<Schemas>,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  invalidCells: any[],
) => void;

/// InvalidValueListener
export type InvalidValueListener<Schemas extends OptionalSchemas = NoSchemas> =
  (store: Store<Schemas>, valueId: Id, invalidValues: any[]) => void;

/// GetCellChange
export type GetCellChange<
  Schema extends OptionalTablesSchema = NoTablesSchema,
> = <
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
>(
  tableId: TableId,
  rowId: Id,
  cellId: CellId,
) => CellChange<Schema, TableId, CellId>;

/// CellChange
export type CellChange<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId> = CellIdFromSchema<
    Schema,
    TableId
  >,
  CellOrUndefined = Cell<Schema, TableId, CellId> | undefined,
> = [changed: boolean, oldCell: CellOrUndefined, newCell: CellOrUndefined];

/// GetValueChange
export type GetValueChange<
  Schema extends OptionalValuesSchema = NoValuesSchema,
> = <ValueId extends ValueIdFromSchema<Schema>>(
  valueId: ValueId,
) => ValueChange<Schema, ValueId>;

/// ValueChange
export type ValueChange<
  Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
  ValueOrUndefined = Value<Schema, ValueId> | undefined,
> = [changed: boolean, oldValue: ValueOrUndefined, newValue: ValueOrUndefined];

/// ChangedCells
export type ChangedCells<Schema extends OptionalTablesSchema = NoTablesSchema> =
  {
    [TableId in TableIdFromSchema<Schema>]?: {
      [rowId: Id]: {
        [CellId in CellIdFromSchema<Schema, TableId>]?: [
          CellOrUndefined<Schema, TableId, CellId>,
          CellOrUndefined<Schema, TableId, CellId>,
        ];
      };
    };
  };

/// InvalidCells
export type InvalidCells = {
  [tableId: Id]: {
    [rowId: Id]: {
      [cellId: Id]: any[];
    };
  };
};

/// ChangedValues
export type ChangedValues<
  Schema extends OptionalValuesSchema = NoValuesSchema,
> = {
  [ValueId in ValueIdFromSchema<Schema>]?: [
    ValueOrUndefined<Schema, ValueId>,
    ValueOrUndefined<Schema, ValueId>,
  ];
};

/// InvalidValues
export type InvalidValues = {
  [valueId: Id]: any[];
};

/// StoreListenerStats
export type StoreListenerStats = {
  /// StoreListenerStats.tables
  tables?: number;
  /// StoreListenerStats.tableIds
  tableIds?: number;
  /// StoreListenerStats.table
  table?: number;
  /// StoreListenerStats.rowIds
  rowIds?: number;
  /// StoreListenerStats.sortedRowIds
  sortedRowIds?: number;
  /// StoreListenerStats.row
  row?: number;
  /// StoreListenerStats.cellIds
  cellIds?: number;
  /// StoreListenerStats.cell
  cell?: number;
  /// StoreListenerStats.invalidCell
  invalidCell?: number;
  /// StoreListenerStats.values
  values?: number;
  /// StoreListenerStats.valueIds
  valueIds?: number;
  /// StoreListenerStats.value
  value?: number;
  /// StoreListenerStats.invalidValue
  invalidValue?: number;
  /// StoreListenerStats.transaction
  transaction?: number;
};

/// Store
export interface Store<Schemas extends OptionalSchemas = NoSchemas> {
  /// Store.getTables
  getTables<Tables = TablesFromSchema<Schemas[0]>>(): Tables;

  /// Store.getTableIds
  getTableIds<Ids = TableIdFromSchema<Schemas[0]>[]>(): Ids;

  /// Store.getTable
  getTable<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Table = TableFromSchema<Schemas[0]>,
  >(
    tableId: TableId,
  ): Table;

  /// Store.getRowIds
  getRowIds<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
  ): Ids;

  /// Store.getSortedRowIds
  getSortedRowIds<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    cellId?: CellId,
    descending?: boolean,
    offset?: number,
    limit?: number,
  ): Ids;

  /// Store.getRow
  getRow<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Row = RowFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
  ): Row;

  /// Store.getCellIds
  getCellIds<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Ids extends CellIdFromSchema<Schemas[0], TableId>[],
  >(
    tableId: TableId,
    rowId: Id,
  ): Ids;

  /// Store.getCell
  getCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    CellOrUndefined = CellFromSchema<Schemas[0], TableId, CellId> | undefined,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
  ): CellOrUndefined;

  /// Store.getValues
  getValues<Values = ValuesFromSchema<Schemas[1]>>(): Values;

  /// Store.getValueIds
  getValueIds<Ids = ValueIdFromSchema<Schemas[1]>[]>(): Ids;

  /// Store.getValue
  getValue<
    ValueId extends ValueIdFromSchema<Schemas[1]>,
    ValueOrUndefined = ValueFromSchema<Schemas[1], ValueId> | undefined,
  >(
    valueId: ValueId,
  ): ValueOrUndefined;

  /// Store.hasTables
  hasTables(): boolean;

  /// Store.hasTable
  hasTable<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
  ): boolean;

  /// Store.hasRow
  hasRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
  ): boolean;

  /// Store.hasCell
  hasCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
  ): boolean;

  /// Store.hasValues
  hasValues(): boolean;

  /// Store.hasValue
  hasValue<ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
  ): boolean;

  /// Store.getTablesJson
  getTablesJson(): Json;

  /// Store.getValuesJson
  getValuesJson(): Json;

  /// Store.getJson
  getJson(): Json;

  /// Store.getTablesSchemaJson
  getTablesSchemaJson(): Json;

  /// Store.getValuesSchemaJson
  getValuesSchemaJson(): Json;

  /// Store.getSchemaJson
  getSchemaJson(): Json;

  /// Store.setTables
  setTables<
    Tables extends TablesFromSchema<Schemas[0], true> = TablesFromSchema<
      Schemas[0],
      true
    >,
  >(
    tables: Tables,
  ): Store<Schemas>;

  /// Store.setTable
  setTable<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Table extends TableFromSchema<Schemas[0], TableId, true> = TableFromSchema<
      Schemas[0],
      TableId,
      true
    >,
  >(
    tableId: TableId,
    table: Table,
  ): Store<Schemas>;

  /// Store.setRow
  setRow<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Row extends RowFromSchema<Schemas[0], TableId, true> = RowFromSchema<
      Schemas[0],
      TableId,
      true
    >,
  >(
    tableId: TableId,
    rowId: Id,
    row: Row,
  ): Store<Schemas>;

  /// Store.addRow
  addRow<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Row extends RowFromSchema<Schemas[0], TableId, true> = RowFromSchema<
      Schemas[0],
      TableId,
      true
    >,
  >(
    tableId: TableId,
    row: Row,
  ): Id | undefined;

  /// Store.setPartialRow
  setPartialRow<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Row extends RowFromSchema<Schemas[0], TableId, true> = RowFromSchema<
      Schemas[0],
      TableId,
      true
    >,
  >(
    tableId: TableId,
    rowId: Id,
    partialRow: Row,
  ): Store<Schemas>;

  /// Store.setCell
  setCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    Cell extends CellFromSchema<Schemas[0], TableId, CellId> = CellFromSchema<
      Schemas[0],
      TableId,
      CellId
    >,
    MapCell extends (cell: Cell | undefined) => Cell = (
      cell: Cell | undefined,
    ) => Cell,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
    cell: Cell | MapCell,
  ): Store<Schemas>;

  /// Store.setValues
  setValues<
    Values extends ValuesFromSchema<Schemas[1], true> = ValuesFromSchema<
      Schemas[1],
      true
    >,
  >(
    values: Values,
  ): Store<Schemas>;

  /// Store.setPartialValues
  setPartialValues<
    Values extends ValuesFromSchema<Schemas[1], true> = ValuesFromSchema<
      Schemas[1],
      true
    >,
  >(
    partialValues: Values,
  ): Store<Schemas>;

  /// Store.setValue
  setValue<
    ValueId extends ValueIdFromSchema<Schemas[1]>,
    Value extends ValueFromSchema<Schemas[1], ValueId> = ValueFromSchema<
      Schemas[1],
      ValueId
    >,
    MapValue extends (value: Value | undefined) => Value = (
      value: Value | undefined,
    ) => Value,
  >(
    valueId: ValueId,
    value: Value | MapValue,
  ): Store<Schemas>;

  /// Store.setTablesJson
  setTablesJson(tablesJson: Json): Store<Schemas>;

  /// Store.setValuesJson
  setValuesJson(valuesJson: Json): Store<Schemas>;

  /// Store.setJson
  setJson(tablesAndValuesJson: Json): Store<Schemas>;

  /// Store.setTablesSchema
  setTablesSchema<
    TablesSchema extends TablesSchemaAlias,
    ValuesSchema extends OptionalValuesSchema = Schemas[1],
  >(
    tablesSchema: TablesSchema,
  ): Store<[typeof tablesSchema, ValuesSchema]>;

  /// Store.setValuesSchema
  setValuesSchema<
    ValuesSchema extends ValuesSchemaAlias,
    TablesSchema extends OptionalTablesSchema = Schemas[0],
  >(
    valuesSchema: ValuesSchema,
  ): Store<[TablesSchema, typeof valuesSchema]>;

  /// Store.setSchema
  setSchema<
    TablesSchema extends TablesSchemaAlias,
    ValuesSchema extends ValuesSchemaAlias,
  >(
    tablesSchema: TablesSchema,
    valuesSchema?: ValuesSchema,
  ): Store<
    [
      typeof tablesSchema,
      Exclude<ValuesSchemaAlias, typeof valuesSchema> extends never
        ? NoValuesSchema
        : NonNullable<typeof valuesSchema>,
    ]
  >;

  /// Store.delTables
  delTables(): Store<Schemas>;

  /// Store.delTable
  delTable<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
  ): Store<Schemas>;

  /// Store.delRow
  delRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
  ): Store<Schemas>;

  /// Store.delCell
  delCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
    forceDel?: boolean,
  ): Store<Schemas>;

  /// Store.delValues
  delValues(): Store<Schemas>;

  /// Store.delValue
  delValue<ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
  ): Store<Schemas>;

  /// Store.delTablesSchema
  delTablesSchema<
    ValuesSchema extends OptionalValuesSchema = Schemas[1],
  >(): Store<[NoTablesSchema, ValuesSchema]>;

  /// Store.delValuesSchema
  delValuesSchema<
    TablesSchema extends OptionalTablesSchema = Schemas[0],
  >(): Store<[TablesSchema, NoValuesSchema]>;

  /// Store.delSchema
  delSchema(): Store<NoSchemas>;

  /// Store.transaction
  transaction<Return>(
    actions: () => Return,
    doRollback?: DoRollback<Schemas>,
  ): Return;

  /// Store.startTransaction
  startTransaction(): Store<Schemas>;

  /// Store.finishTransaction
  finishTransaction(doRollback?: DoRollback<Schemas>): Store<Schemas>;

  /// Store.forEachTable
  forEachTable<
    TableCallback extends TableCallbackAlias<Schemas[0]> = TableCallbackAlias<
      Schemas[0]
    >,
  >(
    tableCallback: TableCallback,
  ): void;

  /// Store.forEachRow
  forEachRow<
    TableId extends TableIdFromSchema<Schemas[0]>,
    RowCallback extends RowCallbackAlias<
      Schemas[0],
      TableId
    > = RowCallbackAlias<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowCallback: RowCallback,
  ): void;

  /// Store.forEachCell
  forEachCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellCallback extends CellCallbackAlias<
      Schemas[0],
      TableId
    > = CellCallbackAlias<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellCallback: CellCallback,
  ): void;

  /// Store.forEachValue
  forEachValue<
    ValueCallback extends ValueCallbackAlias<Schemas[1]> = ValueCallbackAlias<
      Schemas[1]
    >,
  >(
    valueCallback: ValueCallback,
  ): void;

  /// Store.addTablesListener
  addTablesListener(listener: TablesListener<Schemas>, mutator?: boolean): Id;

  /// Store.addTableIdsListener
  addTableIdsListener(
    listener: TableIdsListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addTableListener
  addTableListener<TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: TableIdOrNull,
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addRowIdsListener
  addRowIdsListener<TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: TableIdOrNull,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addSortedRowIdsListener
  addSortedRowIdsListener<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId> | undefined,
    Descending extends boolean,
    Offset extends number,
    Limit extends number | undefined,
  >(
    tableId: TableId,
    cellId: CellId,
    descending: Descending,
    offset: Offset,
    limit: Limit,
    listener: SortedRowIdsListener<
      Schemas,
      TableId,
      CellId,
      Descending,
      Offset,
      Limit
    >,
    mutator?: boolean,
  ): Id;

  /// Store.addRowListener
  addRowListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addCellIdsListener
  addCellIdsListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addCellListener
  addCellListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
    CellListener extends CellListenerAlias<
      Schemas,
      TableIdOrNull,
      RowIdOrNull,
      CellIdOrNull
    >,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    cellId: CellIdOrNull,
    listener: CellListener,
    mutator?: boolean,
  ): Id;

  /// Store.addValuesListener
  addValuesListener(listener: ValuesListener<Schemas>, mutator?: boolean): Id;

  /// Store.addValueIdsListener
  addValueIdsListener(
    listener: ValueIdsListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addValueListener
  addValueListener<
    ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
    ValueListener extends ValueListenerAlias<Schemas, ValueIdOrNull>,
  >(
    valueId: ValueIdOrNull,
    listener: ValueListener,
    mutator?: boolean,
  ): Id;

  /// Store.addInvalidCellListener
  addInvalidCellListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: InvalidCellListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addInvalidValueListener
  addInvalidValueListener(
    valueId: IdOrNull,
    listener: InvalidValueListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addWillFinishTransactionListener
  addWillFinishTransactionListener(listener: TransactionListener<Schemas>): Id;

  /// Store.addDidFinishTransactionListener
  addDidFinishTransactionListener(listener: TransactionListener<Schemas>): Id;

  /// Store.callListener
  callListener(listenerId: Id): Store<Schemas>;

  /// Store.delListener
  delListener(listenerId: Id): Store<Schemas>;

  /// Store.getListenerStats
  getListenerStats(): StoreListenerStats;
}

/// createStore
export function createStore(): Store;

export type TablesFromSchema<
  Schema extends OptionalTablesSchema,
  WhenSet extends boolean = false,
> = {
  -readonly [TableId in TableIdFromSchema<Schema>]?: TableFromSchema<
    Schema,
    TableId,
    WhenSet
  >;
};

export type TableIdFromSchema<Schema extends OptionalTablesSchema> = AsId<
  keyof Schema
>;

export type TableFromSchema<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  WhenSet extends boolean = false,
> = {[rowId: Id]: RowFromSchema<Schema, TableId, WhenSet>};

export type RowFromSchema<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
  WhenSet extends boolean = false,
> = (WhenSet extends true
  ? {
      -readonly [CellId in DefaultCellIdFromSchema<
        Schema,
        TableId
      >]?: CellFromSchema<Schema, TableId, CellId>;
    }
  : {
      -readonly [CellId in DefaultCellIdFromSchema<
        Schema,
        TableId
      >]: CellFromSchema<Schema, TableId, CellId>;
    }) & {
  -readonly [CellId in DefaultCellIdFromSchema<
    Schema,
    TableId,
    false
  >]?: CellFromSchema<Schema, TableId, CellId>;
};

export type CellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = AsId<keyof Schema[TableId]>;

export type DefaultCellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  IsDefaulted extends boolean = true,
> = AsId<
  {
    [CellId in CellIdFromSchema<
      Schema,
      TableId
    >]: Schema[TableId][CellId] extends {
      default: string | number | boolean;
    }
      ? IsDefaulted extends true
        ? CellId
        : never
      : IsDefaulted extends true
      ? never
      : CellId;
  }[CellIdFromSchema<Schema, TableId>]
>;

export type AllCellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = TableId extends TableIdFromSchema<Schema>
  ? CellIdFromSchema<Schema, TableId>
  : never;

export type CellFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  CellType = Schema[TableId][CellId]['type'],
> = CellType extends 'string'
  ? string
  : CellType extends 'number'
  ? number
  : CellType extends 'boolean'
  ? boolean
  : string | number | boolean;

export type ValuesFromSchema<
  Schema extends OptionalValuesSchema,
  WhenSet extends boolean = false,
> = (WhenSet extends true
  ? {
      -readonly [ValueId in DefaultValueIdFromSchema<Schema>]?: ValueFromSchema<
        Schema,
        ValueId
      >;
    }
  : {
      -readonly [ValueId in DefaultValueIdFromSchema<Schema>]: ValueFromSchema<
        Schema,
        ValueId
      >;
    }) & {
  -readonly [ValueId in DefaultValueIdFromSchema<
    Schema,
    false
  >]?: ValueFromSchema<Schema, ValueId>;
};

export type ValueIdFromSchema<Schema extends OptionalValuesSchema> = AsId<
  keyof Schema
>;

export type DefaultValueIdFromSchema<
  Schema extends OptionalValuesSchema,
  IsDefaulted extends boolean = true,
> = {
  [ValueId in ValueIdFromSchema<Schema>]: Schema[ValueId] extends {
    default: string | number | boolean;
  }
    ? IsDefaulted extends true
      ? ValueId
      : never
    : IsDefaulted extends true
    ? never
    : ValueId;
}[ValueIdFromSchema<Schema>];

export type ValueFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  ValueType = Schema[ValueId]['type'],
> = ValueType extends 'string'
  ? string
  : ValueType extends 'number'
  ? number
  : ValueType extends 'boolean'
  ? boolean
  : string | number | boolean;

export type AsId<Key> = Exclude<Key & Id, number>;
