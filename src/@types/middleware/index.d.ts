/// middleware
import type {Id} from '../common/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  Row,
  Store,
  Table,
  Tables,
  Value,
  ValueOrUndefined,
  Values,
} from '../store/index.d.ts';

/// WillSetCellCallback
export type WillSetCellCallback = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: Cell,
) => CellOrUndefined;

/// WillSetTableCallback
export type WillSetTableCallback = (
  tableId: Id,
  table: Table,
) => Table | undefined;

/// WillSetRowCallback
export type WillSetRowCallback = (
  tableId: Id,
  rowId: Id,
  row: Row,
) => Row | undefined;

/// WillSetValueCallback
export type WillSetValueCallback = (
  valueId: Id,
  value: Value,
) => ValueOrUndefined;

/// WillSetTablesCallback
export type WillSetTablesCallback = (tables: Tables) => Tables | undefined;

/// WillSetValuesCallback
export type WillSetValuesCallback = (values: Values) => Values | undefined;

/// WillDelCellCallback
export type WillDelCellCallback = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
) => boolean;

/// WillDelTableCallback
export type WillDelTableCallback = (tableId: Id) => boolean;

/// WillDelRowCallback
export type WillDelRowCallback = (tableId: Id, rowId: Id) => boolean;

/// WillDelValueCallback
export type WillDelValueCallback = (valueId: Id) => boolean;

/// WillDelTablesCallback
export type WillDelTablesCallback = () => boolean;

/// WillDelValuesCallback
export type WillDelValuesCallback = () => boolean;

/// Middleware
export interface Middleware {
  /// Middleware.getStore
  getStore(): Store;

  /// Middleware.addWillSetCellCallback
  addWillSetCellCallback(callback: WillSetCellCallback): Middleware;

  /// Middleware.addWillSetTableCallback
  addWillSetTableCallback(callback: WillSetTableCallback): Middleware;

  /// Middleware.addWillSetRowCallback
  addWillSetRowCallback(callback: WillSetRowCallback): Middleware;

  /// Middleware.addWillSetValueCallback
  addWillSetValueCallback(callback: WillSetValueCallback): Middleware;

  /// Middleware.addWillSetTablesCallback
  addWillSetTablesCallback(callback: WillSetTablesCallback): Middleware;

  /// Middleware.addWillSetValuesCallback
  addWillSetValuesCallback(callback: WillSetValuesCallback): Middleware;

  /// Middleware.addWillDelCellCallback
  addWillDelCellCallback(callback: WillDelCellCallback): Middleware;

  /// Middleware.addWillDelTableCallback
  addWillDelTableCallback(callback: WillDelTableCallback): Middleware;

  /// Middleware.addWillDelRowCallback
  addWillDelRowCallback(callback: WillDelRowCallback): Middleware;

  /// Middleware.addWillDelValueCallback
  addWillDelValueCallback(callback: WillDelValueCallback): Middleware;

  /// Middleware.addWillDelTablesCallback
  addWillDelTablesCallback(callback: WillDelTablesCallback): Middleware;

  /// Middleware.addWillDelValuesCallback
  addWillDelValuesCallback(callback: WillDelValuesCallback): Middleware;

  /// Middleware.destroy
  destroy(): void;
}

/// createMiddleware
export function createMiddleware(store: Store): Middleware;
