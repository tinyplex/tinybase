/// mergeable-store

import {CellOrUndefined, Store, ValueOrUndefined} from './store.d';
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
export type TablesStamp<Hashed extends boolean = false> = Stamp<
  {[tableId: Id]: TableStamp<Hashed>},
  Hashed
>;

// TableStamp
export type TableStamp<Hashed extends boolean = false> = Stamp<
  {[rowId: Id]: RowStamp<Hashed>},
  Hashed
>;

// RowStamp
export type RowStamp<Hashed extends boolean = false> = Stamp<
  {[cellId: Id]: CellStamp<Hashed>},
  Hashed
>;

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
  [mergeableTables: TablesStamp, mergeableValues: ValuesStamp]
>;

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore): MergeableStore;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.getMergeableContentDelta
  getMergeableContentDelta(relativeTo: MergeableContent): MergeableChanges;

  /// MergeableStore.getMergeableTablesDelta
  getMergeableTablesDelta(relativeTo: TablesStamp<true>): TablesStamp;

  /// MergeableStore.getMergeableTableDelta
  getMergeableTableDelta(tableId: Id, relativeTo: TableStamp<true>): TableStamp;

  /// MergeableStore.getMergeableRowDelta
  getMergeableRowDelta(
    tableId: Id,
    rowId: Id,
    relativeTo: RowStamp<true>,
  ): RowStamp;

  /// MergeableStore.getMergeableValuesDelta
  getMergeableValuesDelta(relativeTo: ValuesStamp<true>): ValuesStamp;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(): MergeableChanges;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore;

  /// MergeableStore.getContentHash
  getContentHash(): Hash;

  /// MergeableStore.getTablesHash
  getTablesHash(): Hash;

  /// MergeableStore.getTableHash
  getTableHash(tableId: Id): Hash;

  /// MergeableStore.getRowHash
  getRowHash(tableId: Id, rowId: Id): Hash;

  /// MergeableStore.getCellHash
  getCellHash(tableId: Id, rowId: Id, cellId: Id): Hash;

  /// MergeableStore.getValuesHash
  getValuesHash(): Hash;

  /// MergeableStore.getValueHash
  getValueHash(valueId: Id): Hash;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore;
