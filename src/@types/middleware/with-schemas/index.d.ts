/// middleware
import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {Id} from '../../common/with-schemas/index.d.ts';
import type {
  Cell,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Row,
  Store,
  Table,
  Tables,
  Value,
  Values,
} from '../../store/with-schemas/index.d.ts';

/// WillSetTablesCallback
export type WillSetTablesCallback<Schema extends OptionalTablesSchema> = (
  tables: Tables<Schema>,
) => Tables<Schema> | undefined;

/// WillSetTableCallback
export type WillSetTableCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? [tableId: TableId, table: Table<Schema, TableId>]
      : never
    : never,
> = (
  ...params: Params | [tableId: never, table: never]
) => Params[1] | undefined;

/// WillSetRowCallback
export type WillSetRowCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? [tableId: TableId, rowId: Id, row: Row<Schema, TableId>]
      : never
    : never,
> = (
  ...params: Params | [tableId: never, rowId: never, row: never]
) => Params[2] | undefined;

/// WillSetCellCallback
export type WillSetCellCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? CellIdFromSchema<Schema, TableId> extends infer CellId
        ? CellId extends CellIdFromSchema<Schema, TableId>
          ? [
              tableId: TableId,
              rowId: Id,
              cellId: CellId,
              cell: Cell<Schema, TableId, CellId>,
            ]
          : never
        : never
      : never
    : never,
> = (
  ...params: Params | [tableId: never, rowId: never, cellId: never, cell: never]
) => Params[3] | undefined;

/// WillSetValuesCallback
export type WillSetValuesCallback<Schema extends OptionalValuesSchema> = (
  values: Values<Schema>,
) => Values<Schema> | undefined;

/// WillSetValueCallback
export type WillSetValueCallback<
  Schema extends OptionalValuesSchema,
  Params extends any[] = ValueIdFromSchema<Schema> extends infer ValueId
    ? ValueId extends ValueIdFromSchema<Schema>
      ? [valueId: ValueId, value: Value<Schema, ValueId>]
      : never
    : never,
> = (
  ...params: Params | [valueId: never, value: never]
) => Params[1] | undefined;

/// WillDelTablesCallback
export type WillDelTablesCallback = () => boolean;

/// WillDelTableCallback
export type WillDelTableCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? [tableId: TableId]
      : never
    : never,
> = (...params: Params | [tableId: never]) => boolean;

/// WillDelRowCallback
export type WillDelRowCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? [tableId: TableId, rowId: Id]
      : never
    : never,
> = (...params: Params | [tableId: never, rowId: never]) => boolean;

/// WillDelCellCallback
export type WillDelCellCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? CellIdFromSchema<Schema, TableId> extends infer CellId
        ? CellId extends CellIdFromSchema<Schema, TableId>
          ? [tableId: TableId, rowId: Id, cellId: CellId]
          : never
        : never
      : never
    : never,
> = (
  ...params: Params | [tableId: never, rowId: never, cellId: never]
) => boolean;

/// WillDelValuesCallback
export type WillDelValuesCallback = () => boolean;

/// WillDelValueCallback
export type WillDelValueCallback<
  Schema extends OptionalValuesSchema,
  Params extends any[] = ValueIdFromSchema<Schema> extends infer ValueId
    ? ValueId extends ValueIdFromSchema<Schema>
      ? [valueId: ValueId]
      : never
    : never,
> = (...params: Params | [valueId: never]) => boolean;

/// Middleware
export interface Middleware<in out Schemas extends OptionalSchemas> {
  /// Middleware.getStore
  getStore(): Store<Schemas>;

  /// Middleware.addWillSetTablesCallback
  addWillSetTablesCallback(
    callback: WillSetTablesCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillSetTableCallback
  addWillSetTableCallback(
    callback: WillSetTableCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillSetRowCallback
  addWillSetRowCallback(
    callback: WillSetRowCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillSetCellCallback
  addWillSetCellCallback(
    callback: WillSetCellCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillSetValuesCallback
  addWillSetValuesCallback(
    callback: WillSetValuesCallback<Schemas[1]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillSetValueCallback
  addWillSetValueCallback(
    callback: WillSetValueCallback<Schemas[1]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelTablesCallback
  addWillDelTablesCallback(
    callback: WillDelTablesCallback,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelTableCallback
  addWillDelTableCallback(
    callback: WillDelTableCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelRowCallback
  addWillDelRowCallback(
    callback: WillDelRowCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelCellCallback
  addWillDelCellCallback(
    callback: WillDelCellCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelValuesCallback
  addWillDelValuesCallback(
    callback: WillDelValuesCallback,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelValueCallback
  addWillDelValueCallback(
    callback: WillDelValueCallback<Schemas[1]>,
  ): Middleware<Schemas>;

  /// Middleware.destroy
  destroy(): void;
}

/// createMiddleware
export function createMiddleware<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Middleware<Schemas>;
