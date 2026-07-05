import type {Id} from '../../../common/with-schemas/index.d.ts';
import type {
  Cell,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Store,
  Value,
} from '../../../store/with-schemas/index.d.ts';

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

export type RequiredCellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  IsRequired extends boolean = true,
> = AsId<
  {
    [CellId in CellIdFromSchema<Schema, TableId>]: CellIsRequiredFromSchema<
      Schema,
      TableId,
      CellId,
      IsRequired extends true ? CellId : never,
      IsRequired extends true ? never : CellId
    >;
  }[CellIdFromSchema<Schema, TableId>]
>;

export type PresentCellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  IsPresent extends boolean = true,
> = AsId<
  {
    [CellId in CellIdFromSchema<Schema, TableId>]: CellIsPresentFromSchema<
      Schema,
      TableId,
      CellId,
      IsPresent extends true ? CellId : never,
      IsPresent extends true ? never : CellId
    >;
  }[CellIdFromSchema<Schema, TableId>]
>;

export type RequiredNonDefaultCellIdFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = AsId<
  {
    [CellId in CellIdFromSchema<Schema, TableId>]: CellIsRequiredFromSchema<
      Schema,
      TableId,
      CellId,
      CellIsDefaultedFromSchema<Schema, TableId, CellId, never, CellId>,
      never
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
  default: infer _;
}
  ? Then
  : Else;

export type CellIsRequiredFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  Then,
  Else,
> = Schema[TableId][CellId] extends {
  required: true;
}
  ? Then
  : Else;

export type CellIsPresentFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  Then,
  Else,
> = CellIsDefaultedFromSchema<
  Schema,
  TableId,
  CellId,
  Then,
  CellIsRequiredFromSchema<Schema, TableId, CellId, Then, Else>
>;

export type DefaultedCellFromSchema<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
> =
  | Cell<Schema, TableId, CellId>
  | CellIsPresentFromSchema<Schema, TableId, CellId, never, undefined>;

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

export type RequiredValueIdFromSchema<
  Schema extends OptionalValuesSchema,
  IsRequired extends boolean = true,
> = {
  [ValueId in ValueIdFromSchema<Schema>]: ValueIsRequiredFromSchema<
    Schema,
    ValueId,
    IsRequired extends true ? ValueId : never,
    IsRequired extends true ? never : ValueId
  >;
}[ValueIdFromSchema<Schema>];

export type PresentValueIdFromSchema<
  Schema extends OptionalValuesSchema,
  IsPresent extends boolean = true,
> = {
  [ValueId in ValueIdFromSchema<Schema>]: ValueIsPresentFromSchema<
    Schema,
    ValueId,
    IsPresent extends true ? ValueId : never,
    IsPresent extends true ? never : ValueId
  >;
}[ValueIdFromSchema<Schema>];

export type RequiredNonDefaultValueIdFromSchema<
  Schema extends OptionalValuesSchema,
> = {
  [ValueId in ValueIdFromSchema<Schema>]: ValueIsRequiredFromSchema<
    Schema,
    ValueId,
    ValueIsDefaultedFromSchema<Schema, ValueId, never, ValueId>,
    never
  >;
}[ValueIdFromSchema<Schema>];

export type ValueIsDefaultedFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  Then,
  Else,
> = Schema[ValueId] extends {
  default: infer _;
}
  ? Then
  : Else;

export type ValueIsRequiredFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  Then,
  Else,
> = Schema[ValueId] extends {
  required: true;
}
  ? Then
  : Else;

export type ValueIsPresentFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  Then,
  Else,
> = ValueIsDefaultedFromSchema<
  Schema,
  ValueId,
  Then,
  ValueIsRequiredFromSchema<Schema, ValueId, Then, Else>
>;

export type DefaultedValueFromSchema<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
> =
  | Value<Schema, ValueId>
  | ValueIsPresentFromSchema<Schema, ValueId, never, undefined>;

export type AsId<Key> = Exclude<Key & Id, number>;

export type Truncate<Params> = Params extends [...infer ShorterParams, any]
  ? [...ShorterParams]
  : never;

export type NoInfer<Type> = [Type][Type extends any ? 0 : never];

export type StoreAlias<Schemas extends OptionalSchemas> = Store<Schemas>;
