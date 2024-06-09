import type {
  Cell,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Store,
  Value,
} from '../../../store/with-schemas/index.d.ts';
import type {Id} from '../../../common/with-schemas/index.d.ts';

export type TableIdFromSchema<Schema extends OptionalTablesSchema> = AsId<
  keyof Schema
>;

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
    [CellId in CellIdFromSchema<Schema, TableId>]: CellIsDefaultedFromSchema<
      Schema,
      TableId,
      CellId,
      IsDefaulted extends true ? CellId : never,
      IsDefaulted extends true ? never : CellId
    >;
  }[CellIdFromSchema<Schema, TableId>]
>;

export type AllCellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> =
  TableId extends TableIdFromSchema<Schema>
    ? CellIdFromSchema<Schema, TableId>
    : never;

export type CellIsDefaultedFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  Then,
  Else,
> = Schema[TableId][CellId] extends {
  default: string | number | boolean;
}
  ? Then
  : Else;

export type DefaultedCellFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
> =
  | Cell<Schema, TableId, CellId>
  | CellIsDefaultedFromSchema<Schema, TableId, CellId, never, undefined>;

export type ValueIdFromSchema<Schema extends OptionalValuesSchema> = AsId<
  keyof Schema
>;

export type DefaultValueIdFromSchema<
  Schema extends OptionalValuesSchema,
  IsDefaulted extends boolean = true,
> = {
  [ValueId in ValueIdFromSchema<Schema>]: ValueIsDefaultedFromSchema<
    Schema,
    ValueId,
    IsDefaulted extends true ? ValueId : never,
    IsDefaulted extends true ? never : ValueId
  >;
}[ValueIdFromSchema<Schema>];

export type ValueIsDefaultedFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  Then,
  Else,
> = Schema[ValueId] extends {
  default: string | number | boolean;
}
  ? Then
  : Else;

export type DefaultedValueFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
> =
  | Value<Schema, ValueId>
  | ValueIsDefaultedFromSchema<Schema, ValueId, never, undefined>;

export type AsId<Key> = Exclude<Key & Id, number>;

export type Truncate<Params> = Params extends [...infer ShorterParams, any]
  ? [...ShorterParams]
  : never;

export type NoInfer<Type> = [Type][Type extends any ? 0 : never];

export type StoreAlias<Schemas extends OptionalSchemas> = Store<Schemas>;
