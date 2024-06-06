/// mergeable-store

import type {CellOrUndefined, Content, Store, ValueOrUndefined} from '../store';
import type {Id} from '../common';

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
export type TablesStamp<Hashed extends boolean = false> = Stamp<
  {[tableId: Id]: TableStamp<Hashed>},
  Hashed
>;

// TableHashes
export type TableHashes = {[tableId: Id]: Hash};

// TableStamp
export type TableStamp<Hashed extends boolean = false> = Stamp<
  {[rowId: Id]: RowStamp<Hashed>},
  Hashed
>;

// RowHashes
export type RowHashes = {[tableId: Id]: {[rowId: Id]: Hash}};

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
export type MergeableContent = [
  mergeableTables: TablesStamp<true>,
  mergeableValues: ValuesStamp<true>,
];

/// MergeableChanges
export type MergeableChanges = [
  mergeableTables: TablesStamp,
  mergeableValues: ValuesStamp,
  isChanges: 1,
];

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.getMergeableContentHashes
  getMergeableContentHashes(): ContentHashes;

  /// MergeableStore.getMergeableTableHashes
  getMergeableTableHashes(): TableHashes;

  /// MergeableStore.getMergeableTableDiff
  getMergeableTableDiff(
    relativeTo: TableHashes,
  ): [newTables: TablesStamp, differentTableHashes: TableHashes];

  /// MergeableStore.getMergeableRowHashes
  getMergeableRowHashes(otherTableHashes: TableHashes): RowHashes;

  /// MergeableStore.getMergeableRowDiff
  getMergeableRowDiff(
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differentRowHashes: RowHashes];

  /// MergeableStore.getMergeableCellHashes
  getMergeableCellHashes(otherTableRowHashes: RowHashes): CellHashes;

  /// MergeableStore.getMergeableCellDiff
  getMergeableCellDiff(otherTableRowCellHashes: CellHashes): TablesStamp;

  /// MergeableStore.getMergeableValuesHashes
  getMergeableValuesHashes(): ValuesHashes;

  /// MergeableStore.getMergeableValueDiff
  getMergeableValueDiff(relativeTo: ValuesHashes): ValuesStamp;

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

  /// Store.isMergeable
  isMergeable: () => boolean;
}

/// createMergeableStore
export function createMergeableStore(uniqueId?: Id): MergeableStore;
