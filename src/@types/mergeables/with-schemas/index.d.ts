/// mergeable-store
import {Hlc} from '../../../common/hlc.ts';
import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {Id} from '../../common/with-schemas/index.d.ts';
import type {
  CellOrUndefined,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  ValueOrUndefined,
} from '../../store/with-schemas/index.d.ts';

/// GetNow
export type GetNow = () => number;

/// Hash
export type Hash = number;

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing, Hashed extends boolean = false> = Hashed extends true
  ? [thing: Thing, time: Time, hash: Hash]
  : [thing: Thing, time?: Time];

/// ContentHashes
export type ContentHashes = [tablesHash: Hash, valuesHash: Hash];

/// TablesStamp
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

/// TableHashes
export type TableHashes<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: Hash;
};

/// TableStamp
export type TableStamp<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  Hashed extends boolean = false,
> = Stamp<{[rowId: Id]: RowStamp<Schema, TableId, Hashed>}, Hashed>;

/// RowHashes
export type RowHashes<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: {[rowId: Id]: Hash};
};

/// RowStamp
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

/// CellHashes
export type CellHashes<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: {
    [rowId: Id]: {[CellId in CellIdFromSchema<Schema, TableId>]?: Hash};
  };
};

/// CellStamp
export type CellStamp<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  Hashed extends boolean = false,
> = Stamp<CellOrUndefined<Schema, TableId, CellId>, Hashed>;

/// ValuesStamp
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

/// ValueHashes
export type ValueHashes<Schema extends OptionalValuesSchema> = {
  [ValueId in ValueIdFromSchema<Schema>]?: Hash;
};

/// ValueStamp
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
export type MergeableChanges<
  Schemas extends OptionalSchemas,
  Hashed extends boolean = false,
> = [
  mergeableTables: TablesStamp<Schemas[0], Hashed>,
  mergeableValues: ValuesStamp<Schemas[1], Hashed>,
  isChanges: 1,
];

export type MergeableChangesListener<Schemas extends OptionalSchemas> = (
  changes: MergeableChanges<Schemas, false>,
) => void;

/// Mergeable
export interface Mergeable<Schemas extends OptionalSchemas> {
  addMergeableChangesListener(
    changesListener: MergeableChangesListener<Schemas>,
  ): () => void;

  /// Mergeable.applyMergeableChanges
  applyMergeableChanges(mergeableChanges: MergeableChanges<Schemas>): this;

  loadMyTablesStamp(): TablesStamp<Schemas[0], true>;

  loadMyValuesStamp(): ValuesStamp<Schemas[1], true>;

  saveMyTablesStamp(myTablesStamp: TablesStamp<Schemas[0], true>): void;

  saveMyValuesStamp(myValuesStamp: ValuesStamp<Schemas[1], true>): void;

  seenHlc(remoteHlc: Hlc): void;
}
