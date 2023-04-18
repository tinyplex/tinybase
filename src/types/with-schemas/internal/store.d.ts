import {
  NoTablesSchema,
  OptionalTablesSchema,
  OptionalValuesSchema,
} from '../store';
import {Id} from '../common';

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
  | CellFromSchema<Schema, TableId, CellId>
  | CellIsDefaultedFromSchema<Schema, TableId, CellId, never, undefined>;

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
  [ValueId in ValueIdFromSchema<Schema>]: ValueIsDefaultedFromSchema<
    Schema,
    ValueId,
    IsDefaulted extends true ? ValueId : never,
    IsDefaulted extends true ? never : ValueId
  >;
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
  | ValueFromSchema<Schema, ValueId>
  | ValueIsDefaultedFromSchema<Schema, ValueId, never, undefined>;

export type AsId<Key> = Exclude<Key & Id, number>;
