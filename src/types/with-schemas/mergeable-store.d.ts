/// mergeable-store

import {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from './internal/store';
import {
  CellOrUndefined,
  NoSchemas,
  NoTablesSchema,
  NoValuesSchema,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Store,
  TablesSchema,
  ValueOrUndefined,
  ValuesSchema,
} from './store.d';
import {Id} from './common';

/// Hash
export type Hash = number;

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing, Hashed extends boolean = false> = Hashed extends true
  ? [time: Time, thing: Thing, hash: Hash]
  : [time: Time, thing: Thing];

// TablesStamp
export type TablesStamp<
  Schema extends OptionalTablesSchema,
  Hashed extends boolean = false,
> = Stamp<
  {
    [TableId in TableIdFromSchema<Schema>]?: TableStamp<
      Schema,
      TableId,
      Hashed
    >;
  },
  Hashed
>;

// TableStamp
export type TableStamp<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  Hashed extends boolean = false,
> = Stamp<{[rowId: Id]: RowStamp<Schema, TableId, Hashed>}, Hashed>;

// RowStamp
export type RowStamp<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  Hashed extends boolean = false,
> = Stamp<
  {
    [CellId in CellIdFromSchema<Schema, TableId>]?: CellStamp<
      Schema,
      TableId,
      CellId,
      Hashed
    >;
  },
  Hashed
>;

// CellStamp
export type CellStamp<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  Hashed extends boolean = false,
> = Stamp<CellOrUndefined<Schema, TableId, CellId>, Hashed>;

// ValuesStamp
export type ValuesStamp<
  Schema extends OptionalValuesSchema,
  Hashed extends boolean = false,
> = Stamp<
  {
    [ValueId in ValueIdFromSchema<Schema>]?: ValueStamp<
      Schema,
      ValueId,
      Hashed
    >;
  },
  Hashed
>;

// ValueStamp
export type ValueStamp<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  Hashed extends boolean = false,
> = Stamp<ValueOrUndefined<Schema, ValueId>, Hashed>;

/// MergeableContent
export type MergeableContent<Schemas extends OptionalSchemas> = Stamp<
  [
    mergeableTables: TablesStamp<Schemas[0], true>,
    mergeableValues: ValuesStamp<Schemas[1], true>,
  ],
  true
>;

/// MergeableChanges
export type MergeableChanges<Schemas extends OptionalSchemas> = Stamp<
  [
    mergeableTables: TablesStamp<Schemas[0]>,
    mergeableValues: ValuesStamp<Schemas[1]>,
  ]
>;

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent<Schemas>;

  /// MergeableStore.getMergeableContentDelta
  getMergeableContentDelta(
    relativeTo: MergeableContent<Schemas>,
  ): MergeableChanges<Schemas>;

  /// MergeableStore.getMergeableTablesDelta
  getMergeableTablesDelta(
    relativeTo: TablesStamp<Schemas[0], true>,
  ): TablesStamp<Schemas[0]>;

  /// MergeableStore.getMergeableTableDelta
  getMergeableTableDelta<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    relativeTo: TableStamp<Schemas[0], TableId, true>,
  ): TableStamp<Schemas[0], TableId>;

  /// MergeableStore.getMergeableRowDelta
  getMergeableRowDelta<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    relativeTo: RowStamp<Schemas[0], TableId, true>,
  ): RowStamp<Schemas[0], TableId>;

  /// MergeableStore.getMergeableValuesDelta
  getMergeableValuesDelta(
    relativeTo: ValuesStamp<Schemas[1], true>,
  ): ValuesStamp<Schemas[1]>;

  /// MergeableStore.setMergeableContent
  setMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(): MergeableChanges<Schemas>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges<Schemas> | MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore<Schemas>): MergeableStore<Schemas>;

  /// Store.setTablesSchema
  setTablesSchema<TS extends TablesSchema>(
    tablesSchema: TS,
  ): MergeableStore<[typeof tablesSchema, Schemas[1]]>;

  /// Store.setValuesSchema
  setValuesSchema<VS extends ValuesSchema>(
    valuesSchema: VS,
  ): MergeableStore<[Schemas[0], typeof valuesSchema]>;

  /// Store.setSchema
  setSchema<TS extends TablesSchema, VS extends ValuesSchema>(
    tablesSchema: TS,
    valuesSchema?: VS,
  ): MergeableStore<
    [
      typeof tablesSchema,
      Exclude<ValuesSchema, typeof valuesSchema> extends never
        ? NoValuesSchema
        : NonNullable<typeof valuesSchema>,
    ]
  >;

  /// Store.delTablesSchema
  delTablesSchema<
    ValuesSchema extends OptionalValuesSchema = Schemas[1],
  >(): MergeableStore<[NoTablesSchema, ValuesSchema]>;

  /// Store.delValuesSchema
  delValuesSchema<
    TablesSchema extends OptionalTablesSchema = Schemas[0],
  >(): MergeableStore<[TablesSchema, NoValuesSchema]>;

  /// Store.delSchema
  delSchema(): MergeableStore<NoSchemas>;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore<NoSchemas>;
