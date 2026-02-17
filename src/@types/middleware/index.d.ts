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

/// WillSetTablesCallback
export type WillSetTablesCallback = (tables: Tables) => Tables | undefined;

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

/// WillSetCellCallback
export type WillSetCellCallback = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: Cell,
) => CellOrUndefined;

/// WillSetValuesCallback
export type WillSetValuesCallback = (values: Values) => Values | undefined;

/// WillSetValueCallback
export type WillSetValueCallback = (
  valueId: Id,
  value: Value,
) => ValueOrUndefined;

/// WillDelTablesCallback
export type WillDelTablesCallback = () => boolean;

/// WillDelTableCallback
export type WillDelTableCallback = (tableId: Id) => boolean;

/// WillDelRowCallback
export type WillDelRowCallback = (tableId: Id, rowId: Id) => boolean;

/// WillDelCellCallback
export type WillDelCellCallback = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
) => boolean;

/// WillDelValuesCallback
export type WillDelValuesCallback = () => boolean;

/// WillDelValueCallback
export type WillDelValueCallback = (valueId: Id) => boolean;

/// Middleware
export interface Middleware {
  /// Middleware.getStore
  getStore(): Store;

  /// Middleware.addWillSetTablesCallback
  addWillSetTablesCallback(callback: WillSetTablesCallback): Middleware;

  /// Middleware.addWillSetTableCallback
  addWillSetTableCallback(callback: WillSetTableCallback): Middleware;

  /// Middleware.addWillSetRowCallback
  addWillSetRowCallback(callback: WillSetRowCallback): Middleware;

  /// Middleware.addWillSetCellCallback
  addWillSetCellCallback(callback: WillSetCellCallback): Middleware;

  /// Middleware.addWillSetValuesCallback
  addWillSetValuesCallback(callback: WillSetValuesCallback): Middleware;

  /// Middleware.addWillSetValueCallback
  addWillSetValueCallback(callback: WillSetValueCallback): Middleware;

  /// Middleware.addWillDelTablesCallback
  addWillDelTablesCallback(callback: WillDelTablesCallback): Middleware;

  /// Middleware.addWillDelTableCallback
  addWillDelTableCallback(callback: WillDelTableCallback): Middleware;

  /// Middleware.addWillDelRowCallback
  addWillDelRowCallback(callback: WillDelRowCallback): Middleware;

  /// Middleware.addWillDelCellCallback
  addWillDelCellCallback(callback: WillDelCellCallback): Middleware;

  /// Middleware.addWillDelValuesCallback
  addWillDelValuesCallback(callback: WillDelValuesCallback): Middleware;

  /// Middleware.addWillDelValueCallback
  addWillDelValueCallback(callback: WillDelValueCallback): Middleware;

  /// Middleware.destroy
  destroy(): void;
}

/// createMiddleware
export function createMiddleware(store: Store): Middleware;
