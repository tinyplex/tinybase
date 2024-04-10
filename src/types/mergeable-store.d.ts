/// mergeable-store

import {CellOrUndefined, Store, ValueOrUndefined} from './store.d';
import {Id, Ids} from './common';

/// Hash
export type Hash = number;

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing, Hashed extends boolean = false> = Hashed extends true
  ? [time: Time, thing: Thing, hash: Hash]
  : [time: Time, thing: Thing];

// ContentHashes
export type ContentHashes = [hash: Hash, [tablesHash: Hash, valuesHash: Hash]];

// ContentDelta
export type ContentDelta =
  | [time: Time, [tablesHash: Hash | null, valuesHash: Hash | null]]
  | null;

// TablesStamp
export type TablesStamp<Hashed extends boolean = false> = Stamp<
  {[tableId: Id]: TableStamp<Hashed>},
  Hashed
>;

// TablesHashes
export type TablesHashes = [hash: Hash, {[tableId: Id]: Hash}];

// TablesDelta
export type TablesDelta = [time: Time, deltaTableIds: Ids];

// TableStamp
export type TableStamp<Hashed extends boolean = false> = Stamp<
  {[rowId: Id]: RowStamp<Hashed>},
  Hashed
>;

// TableHashes
export type TableHashes = [hash: Hash, {[rowId: Id]: Hash}];

// TableDelta
export type TableDelta = [time: Time, deltaRowIds: Ids];

// RowStamp
export type RowStamp<Hashed extends boolean = false> = Stamp<
  {[cellId: Id]: CellStamp<Hashed>},
  Hashed
>;

// RowHashes
export type RowHashes = [hash: Hash, {[cellId: Id]: Hash}];

// CellStamp
export type CellStamp<Hashed extends boolean = false> = Stamp<
  CellOrUndefined,
  Hashed
>;

// ValuesStamp
export type ValuesStamp<Hashed extends boolean = false> = Stamp<
  {[valueId: Id]: ValueStamp<Hashed>},
  Hashed
>;

// ValuesHashes
export type ValuesHashes = [hash: Hash, {[valueId: Id]: Hash}];

// ValueStamp
export type ValueStamp<Hashed extends boolean = false> = Stamp<
  ValueOrUndefined,
  Hashed
>;

/// MergeableContent
export type MergeableContent = Stamp<
  [mergeableTables: TablesStamp<true>, mergeableValues: ValuesStamp<true>],
  true
>;

/// MergeableChanges
export type MergeableChanges = Stamp<
  [mergeableTables: TablesStamp, mergeableValues: ValuesStamp, isChanges: 1]
>;

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.getId
  getId(): Id;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.getMergeableContentAsChanges
  getMergeableContentAsChanges(): MergeableChanges;

  /// MergeableStore.getMergeableContentHashes
  getMergeableContentHashes(): ContentHashes;

  /// MergeableStore.getMergeableContentDelta
  getMergeableContentDelta(relativeTo: ContentHashes): ContentDelta;

  /// MergeableStore.getMergeableTablesHashes
  getMergeableTablesHashes(): TablesHashes;

  /// MergeableStore.getMergeableTablesDelta
  getMergeableTablesDelta(relativeTo: TablesHashes): TablesDelta;

  /// MergeableStore.getMergeableTableHashes
  getMergeableTableHashes(tableId: Id): TableHashes;

  /// MergeableStore.getMergeableTableDelta
  getMergeableTableDelta(tableId: Id, relativeTo: TableHashes): TableDelta;

  /// MergeableStore.getMergeableRowHashes
  getMergeableRowHashes(tableId: Id, rowId: Id): RowHashes;

  /// MergeableStore.getMergeableRowDelta
  getMergeableRowDelta(tableId: Id, rowId: Id, relativeTo: RowHashes): RowStamp;

  /// MergeableStore.getMergeableValuesHashes
  getMergeableValuesHashes(): ValuesHashes;

  /// MergeableStore.getMergeableValuesDelta
  getMergeableValuesDelta(relativeTo: ValuesHashes): ValuesStamp;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(): MergeableChanges;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore;

  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore): MergeableStore;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore;
