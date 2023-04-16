import {
  CellCallback,
  CellIdsListener,
  CellListener,
  DoRollback,
  GetCell,
  InvalidCellListener,
  InvalidValueListener,
  NoTablesSchema,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  RowCallback,
  RowIdsListener,
  RowListener,
  SortedRowIdsListener,
  TableCallback,
  TableIdsListener,
  TableListener,
  TablesListener,
  TablesSchema,
  TransactionListener,
  ValueCallback,
  ValueIdsListener,
  ValueListener,
  ValuesListener,
  ValuesSchema,
} from '../store';
import {Id, IdOrNull} from '../common';

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
    [CellId in CellIdFromSchema<
      Schema,
      TableId
    >]: Schema[TableId][CellId] extends {
      default: string | number | boolean;
    }
      ? IsDefaulted extends true
        ? CellId
        : never
      : IsDefaulted extends true
      ? never
      : CellId;
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
  [ValueId in ValueIdFromSchema<Schema>]: Schema[ValueId] extends {
    default: string | number | boolean;
  }
    ? IsDefaulted extends true
      ? ValueId
      : never
    : IsDefaulted extends true
    ? never
    : ValueId;
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

export type AsId<Key> = Exclude<Key & Id, number>;

// ---

export type TablesSchemaAlias = TablesSchema;

export type ValuesSchemaAlias = ValuesSchema;

export type TableCallbackAlias<Schema extends OptionalTablesSchema> =
  TableCallback<Schema>;

export type RowCallbackAlias<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = RowCallback<Schema, TableId>;

export type CellCallbackAlias<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = CellCallback<Schema, TableId>;

export type ValueCallbackAlias<Schema extends OptionalValuesSchema> =
  ValueCallback<Schema>;

export type GetCellAlias<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = GetCell<Schema, TableId>;

export type DoRollbackAlias<Schemas extends OptionalSchemas> =
  DoRollback<Schemas>;

export type TransactionListenerAlias<Schemas extends OptionalSchemas> =
  TransactionListener<Schemas>;

export type TablesListenerAlias<Schemas extends OptionalSchemas> =
  TablesListener<Schemas>;

export type TableIdsListenerAlias<Schemas extends OptionalSchemas> =
  TableIdsListener<Schemas>;

export type TableListenerAlias<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
> = TableListener<Schemas, TableIdOrNull>;

export type RowIdsListenerAlias<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
> = RowIdsListener<Schemas, TableIdOrNull>;

export type SortedRowIdsListenerAlias<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  CellIdOrUndefined extends CellIdFromSchema<Schemas[0], TableId> | undefined,
  Descending extends boolean,
  Offset extends number,
  Limit extends number | undefined,
> = SortedRowIdsListener<
  Schemas,
  TableId,
  CellIdOrUndefined,
  Descending,
  Offset,
  Limit
>;

export type RowListenerAlias<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull,
> = RowListener<Schemas, TableIdOrNull, RowIdOrNull>;

export type CellIdsListenerAlias<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull,
> = CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>;

export type CellListenerAlias<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull,
  CellIdOrNull extends
    | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
        ? CellIdFromSchema<Schemas[0], TableIdOrNull>
        : AllCellIdFromSchema<Schemas[0]>)
    | null,
> = CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>;

export type ValuesListenerAlias<Schemas extends OptionalSchemas> =
  ValuesListener<Schemas>;

export type ValueIdsListenerAlias<Schemas extends OptionalSchemas> =
  ValueIdsListener<Schemas>;

export type ValueListenerAlias<
  Schemas extends OptionalSchemas,
  ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
> = ValueListener<Schemas, ValueIdOrNull>;

export type InvalidCellListenerAlias<Schemas extends OptionalSchemas> =
  InvalidCellListener<Schemas>;

export type InvalidValueListenerAlias<Schemas extends OptionalSchemas> =
  InvalidValueListener<Schemas>;
