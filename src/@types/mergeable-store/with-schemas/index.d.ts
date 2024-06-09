/// mergeable-store

import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  CellOrUndefined,
  Content,
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
} from '../../store/with-schemas/index.d.ts';
import type {Id} from '../../common/with-schemas/index.d.ts';

/// Hash
export type Hash = number;

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing, Hashed extends boolean = false> = Hashed extends true
  ? [thing: Thing, time: Time, hash: Hash]
  : [thing: Thing, time?: Time];

// ContentHashes
export type ContentHashes = [tablesHash: Hash, valuesHash: Hash];

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

// TableHashes
export type TableHashes<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: Hash;
};

// TableStamp
export type TableStamp<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  Hashed extends boolean = false,
> = Stamp<{[rowId: Id]: RowStamp<Schema, TableId, Hashed>}, Hashed>;

// RowHashes
export type RowHashes<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: {[rowId: Id]: Hash};
};

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

// CellHashes
export type CellHashes<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: {
    [rowId: Id]: {[CellId in CellIdFromSchema<Schema, TableId>]?: Hash};
  };
};

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

// ValuesHashes
export type ValuesHashes<Schema extends OptionalValuesSchema> = {
  [ValueId in ValueIdFromSchema<Schema>]?: Hash;
};

// ValueStamp
export type ValueStamp<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  Hashed extends boolean = false,
> = Stamp<ValueOrUndefined<Schema, ValueId>, Hashed>;

/// MergeableContent
export type MergeableContent<Schemas extends OptionalSchemas> = [
  mergeableTables: TablesStamp<Schemas[0], true>,
  mergeableValues: ValuesStamp<Schemas[1], true>,
];

/// MergeableChanges
export type MergeableChanges<Schemas extends OptionalSchemas> = [
  mergeableTables: TablesStamp<Schemas[0]>,
  mergeableValues: ValuesStamp<Schemas[1]>,
  isChanges: 1,
];

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent<Schemas>;

  /// MergeableStore.getMergeableContentHashes
  getMergeableContentHashes(): ContentHashes;

  /// MergeableStore.getMergeableTableHashes
  getMergeableTableHashes(): TableHashes<Schemas[0]>;

  /// MergeableStore.getMergeableTableDiff
  getMergeableTableDiff(
    relativeTo: TableHashes<Schemas[0]>,
  ): [
    newTables: TablesStamp<Schemas[0]>,
    differentTableHashes: TableHashes<Schemas[0]>,
  ];

  /// MergeableStore.getMergeableRowHashes
  getMergeableRowHashes(
    otherTableHashes: TableHashes<Schemas[0]>,
  ): RowHashes<Schemas[0]>;

  /// MergeableStore.getMergeableRowDiff
  getMergeableRowDiff(
    otherTableRowHashes: RowHashes<Schemas[0]>,
  ): [
    newRows: TablesStamp<Schemas[0]>,
    differentRowHashes: RowHashes<Schemas[0]>,
  ];

  /// MergeableStore.getMergeableCellHashes
  getMergeableCellHashes(
    otherTableRowHashes: RowHashes<Schemas[0]>,
  ): CellHashes<Schemas[0]>;

  /// MergeableStore.getMergeableCellDiff
  getMergeableCellDiff(
    otherTableRowCellHashes: CellHashes<Schemas[0]>,
  ): TablesStamp<Schemas[0]>;

  /// MergeableStore.getMergeableValuesHashes
  getMergeableValuesHashes(): ValuesHashes<Schemas[1]>;

  /// MergeableStore.getMergeableValueDiff
  getMergeableValueDiff(
    relativeTo: ValuesHashes<Schemas[1]>,
  ): ValuesStamp<Schemas[1]>;

  /// MergeableStore.setMergeableContent
  setMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.setDefaultContent
  setDefaultContent(content: Content<Schemas>): MergeableStore<Schemas>;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(): MergeableChanges<Schemas>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges<Schemas> | MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore<Schemas>): MergeableStore<Schemas>;

  /// Store.isMergeable
  isMergeable: () => boolean;

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
export function createMergeableStore(uniqueId?: Id): MergeableStore<NoSchemas>;
