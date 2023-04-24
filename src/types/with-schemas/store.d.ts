/// store

import {
  AllCellIdFromSchema,
  CellFromSchema,
  CellIdFromSchema,
  DefaultedValueFromSchema,
  NoInfer,
  RowFromSchema,
  TableFromSchema,
  TableIdFromSchema,
  TablesFromSchema,
  Truncate,
  ValueFromSchema,
  ValueIdFromSchema,
  ValuesFromSchema,
} from './internal/store';
import {Id, IdOrNull, Ids, Json} from './common.d';

/// TablesSchema
export type TablesSchema = {[tableId: Id]: {[cellId: Id]: CellSchema}};

/// CellSchema
export type CellSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/// ValuesSchema
export type ValuesSchema = {[valueId: Id]: ValueSchema};

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
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
  WhenSet extends boolean = false,
> = TablesFromSchema<Schema, WhenSet>;

/// Table
export type Table<
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
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
  TableId = TableIdFromSchema<Schema>,
  Params2 extends any[] = TableId extends TableIdFromSchema<Schema>
    ?
        | [TableId, (rowCallback: RowCallback<Schema, TableId>) => void]
        | [never, never]
    : never,
  Params1 extends any[] = Truncate<Params2>,
> = ((...params: Params2) => void) | ((...params: Params1) => void);

/// RowCallback
export type RowCallback<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = RowCallbackImpl<Schema, TableId>;

export type RowCallbackImpl<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = Id,
  Params extends any[] = [
    rowId: Id,
    forEachCell: (cellCallback: CellCallback<Schema, TableId>) => void,
  ],
  P2 extends any[] = Params | [rowId: never, forEachCell: never],
  // P1 extends any[] = Truncate<P2>,
> = Params extends any[]
  ? (...params: P2) => void
  : // | ((...params: P1) => void)
    never;

export type RowCallbackParams<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = [
  rowId: Id,
  forEachCell: (cellCallback: CellCallback<Schema, TableId>) => void,
];

/// CellCallback
export type CellCallback<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = Id,
> = CellCallbackImpl<Schema, TableId>;

export type CellCallbackImpl<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = Id,
  Params extends any[] = CellCallbackParams<Schema, TableId>,
  P2 extends any[] = Params | [cellId: never, cell: never],
  P1 extends any[] = Truncate<P2>,
> = Params extends any[]
  ? ((...params: P2) => void) | ((...params: P1) => void)
  : never;

export type CellCallbackParams<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellIds = CellIdFromSchema<Schema, TableId>,
> = CellIds extends infer CellId
  ? CellId extends CellIdFromSchema<Schema, TableId>
    ? [cellId: CellId, cell: CellFromSchema<Schema, TableId, CellId>]
    : never
  : never;

/// ValueCallback
export type ValueCallback<
  Schema extends OptionalValuesSchema,
  ValueId = ValueIdFromSchema<Schema>,
  Params2 extends any[] = ValueId extends ValueIdFromSchema<Schema>
    ? [ValueId, ValueFromSchema<Schema, ValueId>]
    : never,
  Params1 extends any[] = Truncate<Params2>,
> =
  | ((...params: Params2) => void)
  | ((...params: Params1) => void)
  | (() => void);

/// MapCell
export type MapCell<
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
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
  in out Schema extends OptionalValuesSchema = NoValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
> = (value: ValueOrUndefined<Schema, ValueId>) => Value<Schema, ValueId>;

/// GetCell
export type GetCell<
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = <
  CellId extends CellIdFromSchema<Schema, TableId>,
  CellOrUndefined = Cell<Schema, TableId, CellId> | undefined,
>(
  cellId: CellId,
) => CellOrUndefined;

/// DoRollback
export type DoRollback<
  in out Schemas extends OptionalSchemas = NoSchemas,
  TablesSchema extends OptionalTablesSchema = Schemas[0],
  ValuesSchema extends OptionalValuesSchema = Schemas[1],
> = (
  changedCells: ChangedCells<TablesSchema>,
  invalidCells: InvalidCells,
  changedValues: ChangedValues<ValuesSchema>,
  invalidValues: InvalidValues,
) => boolean;

/// TransactionListener
export type TransactionListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (
  store: Store<Schemas>,
  cellsTouched: boolean,
  valuesTouched: boolean,
) => void;

/// TablesListener
export type TablesListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
  Schema extends OptionalTablesSchema = Schemas[0],
> = (
  store: Store<Schemas>,
  getCellChange: GetCellChange<Schema> | undefined,
) => void;

/// TableIdsListener
export type TableIdsListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (store: Store<Schemas>) => void;

/// TableListener
export type TableListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
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
  in out Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  TableId = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
> = (store: Store<Schemas>, tableId: TableId) => void;

/// SortedRowIdsListener
export type SortedRowIdsListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
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
  in out Schemas extends OptionalSchemas = NoSchemas,
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
  in out Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends TableIdFromSchema<
    Schemas[0]
  > | null = TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull = null,
  TableId = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  RowId = RowIdOrNull extends null ? Id : RowIdOrNull,
> = (store: Store<Schemas>, tableId: TableId, rowId: RowId) => void;

export type CellListenerParams2<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  RowIdOrNull extends IdOrNull,
  CellIdOrNull extends IdOrNull,
  CellIdOrIds = CellIdOrNull extends null
    ? CellIdFromSchema<Schemas[0], TableId>
    : CellIdOrNull,
> = CellIdOrIds extends infer CellId
  ? CellId extends CellIdFromSchema<Schemas[0], TableId>
    ? [
        store: Store<Schemas>,
        tableId: TableId,
        rowId: RowIdOrNull extends null ? Id : RowIdOrNull,
        cellId: CellId,
        newCell: CellFromSchema<Schemas[0], TableId, CellId>,
        oldCell: CellFromSchema<Schemas[0], TableId, CellId>,
        getCellChange: GetCellChange<Schemas[0]> | undefined,
      ]
    : never
  : never;

export type NeverParams = [
  store: never,
  tableId: never,
  rowId: never,
  cellId: never,
  newCell: never,
  oldCell: never,
  getCellChange: never,
];

export type CellListenerParams<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends IdOrNull,
  RowIdOrNull extends IdOrNull,
  CellIdOrNull extends IdOrNull,
  TableIdOrIds = TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
> = TableIdOrIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? CellListenerParams2<Schemas, TableId, RowIdOrNull, CellIdOrNull>
    : never
  : never;

export type CellListenerImpl<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends IdOrNull = IdOrNull,
  RowIdOrNull extends IdOrNull = IdOrNull,
  CellIdOrNull extends IdOrNull = IdOrNull,
  P7 extends any[] =
    | CellListenerParams<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>
    | NeverParams,
  P6 extends any[] = Truncate<P7>,
  P5 extends any[] = Truncate<P6>,
  P4 extends any[] = Truncate<P5>,
  // P3 extends any[] = Truncate<P4>,
  // P2 extends any[] = Truncate<P3>,
  // P1 extends any[] = Truncate<P2>,
> = CellListenerParams<
  Schemas,
  TableIdOrNull,
  RowIdOrNull,
  CellIdOrNull
> extends any
  ?
      | ((...params: P7) => void)
      | ((...params: P6) => void)
      | ((...params: P5) => void)
      | ((...params: P4) => void)
  : // The unions may no longer be discriminatory with fewer parameters, and
    // TypeScript fails to resolve callback signatures in some cases.
    // | ((...params: P3) => void)
    // | ((...params: P2) => void)
    // | ((...params: P1) => void)
    never;

/// CellListener
export type CellListener<
  Schemas extends OptionalSchemas = NoSchemas,
  TableIdOrNull extends IdOrNull = IdOrNull,
  RowIdOrNull extends IdOrNull = IdOrNull,
  CellIdOrNull extends IdOrNull = IdOrNull,
> = CellListenerImpl<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>;

/// ValuesListener
export type ValuesListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
  Schema extends OptionalValuesSchema = Schemas[1],
> = (
  store: Store<Schemas>,
  getValueChange: GetValueChange<Schema> | undefined,
) => void;

/// ValueIdsListener
export type ValueIdsListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (store: Store<Schemas>) => void;

/// ValueListener
export type ValueListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
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

/// InvalidCellListener
export type InvalidCellListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (
  store: Store<Schemas>,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  invalidCells: any[],
) => void;

/// InvalidValueListener
export type InvalidValueListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (store: Store<Schemas>, valueId: Id, invalidValues: any[]) => void;

/// GetCellChange
export type GetCellChange<
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
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
  in out Schema extends OptionalValuesSchema = NoValuesSchema,
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
export type ChangedCells<
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
> = {
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
  in out Schema extends OptionalValuesSchema = NoValuesSchema,
> = {
  [ValueId in ValueIdFromSchema<Schema>]?: [
    DefaultedValueFromSchema<Schema, ValueId>,
    DefaultedValueFromSchema<Schema, ValueId>,
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
export interface Store<in out Schemas extends OptionalSchemas = NoSchemas> {
  /// Store.getTables
  getTables<Tables = TablesFromSchema<Schemas[0]>>(): Tables;

  /// Store.getTableIds
  getTableIds<Ids = TableIdFromSchema<Schemas[0]>[]>(): Ids;

  /// Store.getTable
  getTable<
    TableId extends TableIdFromSchema<Schemas[0]>,
    Table = TableFromSchema<Schemas[0], TableId>,
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
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
  ): CellOrUndefined<Schemas[0], TableId, CellId>;

  /// Store.getValues
  getValues<Values = ValuesFromSchema<Schemas[1]>>(): Values;

  /// Store.getValueIds
  getValueIds<Ids = ValueIdFromSchema<Schemas[1]>[]>(): Ids;

  /// Store.getValue
  getValue<ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
  ): DefaultedValueFromSchema<Schemas[1], ValueId>;

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
  setTables(tables: TablesFromSchema<Schemas[0], true>): Store<Schemas>;

  /// Store.setTable
  setTable<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    table: TableFromSchema<Schemas[0], TableId, true>,
  ): Store<Schemas>;

  /// Store.setRow
  setRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    row: RowFromSchema<Schemas[0], TableId, true>,
  ): Store<Schemas>;

  /// Store.addRow
  addRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    row: RowFromSchema<Schemas[0], TableId, true>,
  ): Id | undefined;

  /// Store.setPartialRow
  setPartialRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    partialRow: RowFromSchema<Schemas[0], TableId, true>,
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
  setValues(values: ValuesFromSchema<Schemas[1], true>): Store<Schemas>;

  /// Store.setPartialValues
  setPartialValues(
    partialValues: ValuesFromSchema<Schemas[1], true>,
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
  setTablesSchema<ValuesSchema extends OptionalValuesSchema = Schemas[1]>(
    tablesSchema: TablesSchema,
  ): Store<[typeof tablesSchema, ValuesSchema]>;

  /// Store.setValuesSchema
  setValuesSchema<TablesSchema extends OptionalTablesSchema = Schemas[0]>(
    valuesSchema: ValuesSchema,
  ): Store<[TablesSchema, typeof valuesSchema]>;

  /// Store.setSchema
  setSchema<TS extends TablesSchema, VS extends ValuesSchema>(
    tablesSchema: TS,
    valuesSchema?: VS,
  ): Store<
    [
      typeof tablesSchema,
      Exclude<ValuesSchema, typeof valuesSchema> extends never
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
  forEachTable(tableCallback: NoInfer<TableCallback<Schemas[0]>>): void;

  /// Store.forEachRow
  forEachRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowCallback: RowCallback<Schemas[0], TableId>,
  ): void;

  /// Store.forEachCell
  forEachCell<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    cellCallback: CellCallback<Schemas[0], TableId>,
  ): void;

  /// Store.forEachValue
  forEachValue(valueCallback: ValueCallback<Schemas[1]>): void;

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
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    cellId: CellIdOrNull,
    listener: CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>,
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
  addValueListener<ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null>(
    valueId: ValueIdOrNull,
    listener: ValueListener<Schemas, ValueIdOrNull>,
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
