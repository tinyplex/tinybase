/// mergeable-store

import {CellOrUndefined, Content, Store, ValueOrUndefined} from './store.d';
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

// TableHashes
export type TableHashes = {[tableId: Id]: Hash};

// TableIdsDiff
export type TableIdsDiff = Ids;

// TableStamp
export type TableStamp<Hashed extends boolean = false> = Stamp<
  {[rowId: Id]: RowStamp<Hashed>},
  Hashed
>;

// RowHashes
export type RowHashes = {[tableId: Id]: {[rowId: Id]: Hash}};

// RowIdsDiff
export type RowIdsDiff = {[tableId: Id]: Ids};

// RowStamp
export type RowStamp<Hashed extends boolean = false> = Stamp<
  {[cellId: Id]: CellStamp<Hashed>},
  Hashed
>;

// CellHashes
export type CellHashes = {[tableId: Id]: {[rowId: Id]: {[cellId: Id]: Hash}}};

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

  /// MergeableStore.getMergeableTableHashes
  getMergeableTableHashes(): TableHashes;

  /// MergeableStore.getMergeableTableIdsDiff
  getMergeableTableIdsDiff(relativeTo: TableHashes): TableIdsDiff;

  /// MergeableStore.getMergeableRowHashes
  getMergeableRowHashes(tablesDelta: TableIdsDiff): RowHashes;

  /// MergeableStore.getMergeableRowIdsDiff
  getMergeableRowIdsDiff(relativeTo: RowHashes): RowIdsDiff;

  /// MergeableStore.getMergeableCellHashes
  getMergeableCellHashes(tableDelta: RowIdsDiff): CellHashes;

  /// MergeableStore.getMergeableTablesChanges
  getMergeableTablesChanges(relativeTo: CellHashes): TablesStamp;

  /// MergeableStore.getMergeableValuesHashes
  getMergeableValuesHashes(): ValuesHashes;

  /// MergeableStore.getMergeableValuesChanges
  getMergeableValuesChanges(relativeTo: ValuesHashes): ValuesStamp;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.setDefaultContent
  setDefaultContent(content: Content): MergeableStore;

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
