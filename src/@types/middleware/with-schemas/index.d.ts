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
  Store,
  Value,
} from '../../store/with-schemas/index.d.ts';

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

  /// Middleware.addWillSetCellCallback
  addWillSetCellCallback(
    callback: WillSetCellCallback<Schemas[0]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillSetValueCallback
  addWillSetValueCallback(
    callback: WillSetValueCallback<Schemas[1]>,
  ): Middleware<Schemas>;

  /// Middleware.addWillDelCellCallback
  addWillDelCellCallback(
    callback: WillDelCellCallback<Schemas[0]>,
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
