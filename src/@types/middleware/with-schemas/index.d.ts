/// middleware
import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {Id} from '../../common/with-schemas/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
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
  Params4 extends any[] =
    | Params
    | [tableId: never, rowId: never, cellId: never, cell: never],
> = Params extends any[]
  ? (...params: Params4) => CellOrUndefined<Schema, Params4[0], Params4[2]>
  : never;

/// WillSetValueCallback
export type WillSetValueCallback<
  Schema extends OptionalValuesSchema,
  Params extends any[] = ValueIdFromSchema<Schema> extends infer ValueId
    ? ValueId extends ValueIdFromSchema<Schema>
      ? [valueId: ValueId, value: Value<Schema, ValueId>]
      : never
    : never,
  Params2 extends any[] = Params | [valueId: never, value: never],
> = Params extends any[]
  ? (...params: Params2) => Value<Schema, Params2[0]> | undefined
  : never;

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
  Params3 extends any[] =
    | Params
    | [tableId: never, rowId: never, cellId: never],
> = Params extends any[] ? (...params: Params3) => boolean : never;

/// WillDelValueCallback
export type WillDelValueCallback<
  Schema extends OptionalValuesSchema,
  Params extends any[] = ValueIdFromSchema<Schema> extends infer ValueId
    ? ValueId extends ValueIdFromSchema<Schema>
      ? [valueId: ValueId]
      : never
    : never,
  Params1 extends any[] = Params | [valueId: never],
> = Params extends any[] ? (...params: Params1) => boolean : never;

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
