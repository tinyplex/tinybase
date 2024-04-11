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
export type ContentHashes = [time: Time, [tablesHash: Hash, valuesHash: Hash]];

// TablesStamp
export type TablesStamp<Hashed extends boolean = false> = Stamp<
  {[tableId: Id]: TableStamp<Hashed>},
  Hashed
>;

// TablesHashes
export type TablesHashes = {[tableId: Id]: Hash};

// TablesDelta
export type TablesDelta = Ids;

// TableStamp
export type TableStamp<Hashed extends boolean = false> = Stamp<
  {[rowId: Id]: RowStamp<Hashed>},
  Hashed
>;

// TableHashes
export type TableHashes = {[tableId: Id]: {[rowId: Id]: Hash}};

// TableDelta
export type TableDelta = {[tableId: Id]: Ids};

// RowStamp
export type RowStamp<Hashed extends boolean = false> = Stamp<
  {[cellId: Id]: CellStamp<Hashed>},
  Hashed
>;

// RowHashes
export type RowHashes = {[tableId: Id]: {[rowId: Id]: {[cellId: Id]: Hash}}};

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
export type ValuesHashes = {[valueId: Id]: Hash};

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

  /// MergeableStore.getMergeableContentHashes
  getMergeableContentHashes(): ContentHashes;

  /// MergeableStore.getMergeableTablesHashes
  getMergeableTablesHashes(): TablesHashes;

  /// MergeableStore.getMergeableTablesDelta
  getMergeableTablesDelta(relativeTo: TablesHashes): TablesDelta;

  /// MergeableStore.getMergeableTableHashes
  getMergeableTableHashes(tablesDelta: TablesDelta): TableHashes;

  /// MergeableStore.getMergeableTableDelta
  getMergeableTableDelta(relativeTo: TableHashes): TableDelta;

  /// MergeableStore.getMergeableRowHashes
  getMergeableRowHashes(tableDelta: TableDelta): RowHashes;

  /// MergeableStore.getMergeableRowDelta
  getMergeableRowDelta(relativeTo: RowHashes): TablesStamp;

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
