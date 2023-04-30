/// store

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
export type Tables = {[tableId: Id]: Table};

/// Table
export type Table = {[rowId: Id]: Row};

/// Row
export type Row = {[cellId: Id]: Cell};

/// Cell
export type Cell = string | number | boolean;

/// CellOrUndefined
export type CellOrUndefined = Cell | undefined;

/// Values
export type Values = {[valueId: Id]: Value};

/// Value
export type Value = string | number | boolean;

/// ValueOrUndefined
export type ValueOrUndefined = Value | undefined;

/// TableCallback
export type TableCallback = (
  tableId: Id,
  forEachRow: (rowCallback: RowCallback) => void,
) => void;

/// RowCallback
export type RowCallback = (
  rowId: Id,
  forEachCell: (cellCallback: CellCallback) => void,
) => void;

/// CellCallback
export type CellCallback = (cellId: Id, cell: Cell) => void;

/// ValueCallback
export type ValueCallback = (valueId: Id, value: Value) => void;

/// MapCell
export type MapCell = (cell: CellOrUndefined) => Cell;

/// MapValue
export type MapValue = (value: ValueOrUndefined) => Value;

/// GetCell
export type GetCell = (cellId: Id) => CellOrUndefined;

/// DoRollback
export type DoRollback = (
  changedCells: ChangedCells,
  invalidCells: InvalidCells,
  changedValues: ChangedValues,
  invalidValues: InvalidValues,
) => boolean;

/// TransactionListener
export type TransactionListener = (
  store: Store,
  cellsTouched: boolean,
  valuesTouched: boolean,
) => void;

/// TablesListener
export type TablesListener = (
  store: Store,
  getCellChange: GetCellChange | undefined,
) => void;

/// TableIdsListener
export type TableIdsListener = (store: Store) => void;

/// TableListener
export type TableListener = (
  store: Store,
  tableId: Id,
  getCellChange: GetCellChange | undefined,
) => void;

/// RowIdsListener
export type RowIdsListener = (store: Store, tableId: Id) => void;

/// SortedRowIdsListener
export type SortedRowIdsListener = (
  store: Store,
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  sortedRowIds: Ids,
) => void;

/// RowListener
export type RowListener = (
  store: Store,
  tableId: Id,
  rowId: Id,
  getCellChange: GetCellChange | undefined,
) => void;

/// CellIdsListener
export type CellIdsListener = (store: Store, tableId: Id, rowId: Id) => void;

/// CellListener
export type CellListener = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  newCell: Cell,
  oldCell: Cell,
  getCellChange: GetCellChange | undefined,
) => void;

/// ValuesListener
export type ValuesListener = (
  store: Store,
  getValueChange: GetValueChange | undefined,
) => void;

/// ValueIdsListener
export type ValueIdsListener = (store: Store) => void;

/// ValueListener
export type ValueListener = (
  store: Store,
  valueId: Id,
  newValue: Value,
  oldValue: Value,
  getValueChange: GetValueChange | undefined,
) => void;

/// InvalidCellListener
export type InvalidCellListener = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  invalidCells: any[],
) => void;

/// InvalidValueListener
export type InvalidValueListener = (
  store: Store,
  valueId: Id,
  invalidValues: any[],
) => void;

/// GetCellChange
export type GetCellChange = (tableId: Id, rowId: Id, cellId: Id) => CellChange;

/// CellChange
export type CellChange = [
  changed: boolean,
  oldCell: CellOrUndefined,
  newCell: CellOrUndefined,
];

/// GetValueChange
export type GetValueChange = (valueId: Id) => ValueChange;

/// ValueChange
export type ValueChange = [
  changed: boolean,
  oldValue: ValueOrUndefined,
  newValue: ValueOrUndefined,
];

/// ChangedCells
export type ChangedCells = {
  [tableId: Id]: {
    [rowId: Id]: {
      [cellId: Id]: [CellOrUndefined, CellOrUndefined];
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
export type ChangedValues = {
  [valueId: Id]: [ValueOrUndefined, ValueOrUndefined];
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
export interface Store {
  //
  /// Store.getTables
  getTables(): Tables;

  /// Store.getTableIds
  getTableIds(): Ids;

  /// Store.getTable
  getTable(tableId: Id): Table;

  /// Store.getRowIds
  getRowIds(tableId: Id): Ids;

  /// Store.getSortedRowIds
  getSortedRowIds(
    tableId: Id,
    cellId?: Id,
    descending?: boolean,
    offset?: number,
    limit?: number,
  ): Ids;

  /// Store.getRow
  getRow(tableId: Id, rowId: Id): Row;

  /// Store.getCellIds
  getCellIds(tableId: Id, rowId: Id): Ids;

  /// Store.getCell
  getCell(tableId: Id, rowId: Id, cellId: Id): CellOrUndefined;

  /// Store.getValues
  getValues(): Values;

  /// Store.getValueIds
  getValueIds(): Ids;

  /// Store.getValue
  getValue(valueId: Id): ValueOrUndefined;

  /// Store.hasTables
  hasTables(): boolean;

  /// Store.hasTable
  hasTable(tableId: Id): boolean;

  /// Store.hasRow
  hasRow(tableId: Id, rowId: Id): boolean;

  /// Store.hasCell
  hasCell(tableId: Id, rowId: Id, cellId: Id): boolean;

  /// Store.hasValues
  hasValues(): boolean;

  /// Store.hasValue
  hasValue(valueId: Id): boolean;

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
  setTables(tables: Tables): Store;

  /// Store.setTable
  setTable(tableId: Id, table: Table): Store;

  /// Store.setRow
  setRow(tableId: Id, rowId: Id, row: Row): Store;

  /// Store.addRow
  addRow(tableId: Id, row: Row, reuseRowIds?: boolean): Id | undefined;

  /// Store.setPartialRow
  setPartialRow(tableId: Id, rowId: Id, partialRow: Row): Store;

  /// Store.setCell
  setCell(tableId: Id, rowId: Id, cellId: Id, cell: Cell | MapCell): Store;

  /// Store.setValues
  setValues(values: Values): Store;

  /// Store.setPartialValues
  setPartialValues(partialValues: Values): Store;

  /// Store.setValue
  setValue(valueId: Id, value: Value | MapValue): Store;

  /// Store.setTablesJson
  setTablesJson(tablesJson: Json): Store;

  /// Store.setValuesJson
  setValuesJson(valuesJson: Json): Store;

  /// Store.setJson
  setJson(tablesAndValuesJson: Json): Store;

  /// Store.setTablesSchema
  setTablesSchema(tablesSchema: TablesSchema): Store;

  /// Store.setValuesSchema
  setValuesSchema(valuesSchema: ValuesSchema): Store;

  /// Store.setSchema
  setSchema(tablesSchema: TablesSchema, valuesSchema?: ValuesSchema): Store;

  /// Store.delTables
  delTables(): Store;

  /// Store.delTable
  delTable(tableId: Id): Store;

  /// Store.delRow
  delRow(tableId: Id, rowId: Id): Store;

  /// Store.delCell
  delCell(tableId: Id, rowId: Id, cellId: Id, forceDel?: boolean): Store;

  /// Store.delValues
  delValues(): Store;

  /// Store.delValue
  delValue(valueId: Id): Store;

  /// Store.delTablesSchema
  delTablesSchema(): Store;

  /// Store.delValuesSchema
  delValuesSchema(): Store;

  /// Store.delSchema
  delSchema(): Store;

  /// Store.transaction
  transaction<Return>(actions: () => Return, doRollback?: DoRollback): Return;

  /// Store.startTransaction
  startTransaction(): Store;

  /// Store.finishTransaction
  finishTransaction(doRollback?: DoRollback): Store;

  /// Store.forEachTable
  forEachTable(tableCallback: TableCallback): void;

  /// Store.forEachRow
  forEachRow(tableId: Id, rowCallback: RowCallback): void;

  /// Store.forEachCell
  forEachCell(tableId: Id, rowId: Id, cellCallback: CellCallback): void;

  /// Store.forEachValue
  forEachValue(valueCallback: ValueCallback): void;

  /// Store.addTablesListener
  addTablesListener(listener: TablesListener, mutator?: boolean): Id;

  /// Store.addTableIdsListener
  addTableIdsListener(listener: TableIdsListener, mutator?: boolean): Id;

  /// Store.addTableListener
  addTableListener(
    tableId: IdOrNull,
    listener: TableListener,
    mutator?: boolean,
  ): Id;

  /// Store.addRowIdsListener
  addRowIdsListener(
    tableId: IdOrNull,
    listener: RowIdsListener,
    mutator?: boolean,
  ): Id;

  /// Store.addSortedRowIdsListener
  addSortedRowIdsListener(
    tableId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: SortedRowIdsListener,
    mutator?: boolean,
  ): Id;

  /// Store.addRowListener
  addRowListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    listener: RowListener,
    mutator?: boolean,
  ): Id;

  /// Store.addCellIdsListener
  addCellIdsListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    listener: CellIdsListener,
    mutator?: boolean,
  ): Id;

  /// Store.addCellListener
  addCellListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: CellListener,
    mutator?: boolean,
  ): Id;

  /// Store.addValuesListener
  addValuesListener(listener: ValuesListener, mutator?: boolean): Id;

  /// Store.addValueIdsListener
  addValueIdsListener(listener: ValueIdsListener, mutator?: boolean): Id;

  /// Store.addValueListener
  addValueListener(
    valueId: IdOrNull,
    listener: ValueListener,
    mutator?: boolean,
  ): Id;

  /// Store.addInvalidCellListener
  addInvalidCellListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: InvalidCellListener,
    mutator?: boolean,
  ): Id;

  /// Store.addInvalidValueListener
  addInvalidValueListener(
    valueId: IdOrNull,
    listener: InvalidValueListener,
    mutator?: boolean,
  ): Id;

  /// Store.addWillFinishTransactionListener
  addWillFinishTransactionListener(listener: TransactionListener): Id;

  /// Store.addDidFinishTransactionListener
  addDidFinishTransactionListener(listener: TransactionListener): Id;

  /// Store.callListener
  callListener(listenerId: Id): Store;

  /// Store.delListener
  delListener(listenerId: Id): Store;

  /// Store.getListenerStats
  getListenerStats(): StoreListenerStats;
  //
}

/// createStore
export function createStore(): Store;
