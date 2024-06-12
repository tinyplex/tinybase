/// indexes

import type {GetCell, RowCallback, Store} from '../store/index.d.ts';
import type {Id, IdOrNull, Ids, SortKey} from '../common/index.d.ts';

/// Index
export type Index = {[sliceId: Id]: Slice};

/// Slice
export type Slice = Ids;

/// IndexCallback
export type IndexCallback = (
  indexId: Id,
  forEachSlice: (sliceCallback: SliceCallback) => void,
) => void;

/// SliceCallback
export type SliceCallback = (
  sliceId: Id,
  forEachRow: (rowCallback: RowCallback) => void,
) => void;

/// IndexIdsListener
export type IndexIdsListener = (indexes: Indexes) => void;

/// SliceIdsListener
export type SliceIdsListener = (indexes: Indexes, indexId: Id) => void;

/// SliceRowIdsListener
export type SliceRowIdsListener = (
  indexes: Indexes,
  indexId: Id,
  sliceId: Id,
) => void;

/// IndexesListenerStats
export type IndexesListenerStats = {
  /// IndexesListenerStats.sliceIds
  sliceIds: number;
  /// IndexesListenerStats.sliceRowIds
  sliceRowIds: number;
};

/// Indexes
export interface Indexes {
  //
  /// Indexes.setIndexDefinition
  setIndexDefinition(
    indexId: Id,
    tableId: Id,
    getSliceIdOrIds?: Id | ((getCell: GetCell, rowId: Id) => Id | Ids),
    getSortKey?: Id | ((getCell: GetCell, rowId: Id) => SortKey),
    sliceIdSorter?: (sliceId1: Id, sliceId2: Id) => number,
    rowIdSorter?: (sortKey1: SortKey, sortKey2: SortKey, sliceId: Id) => number,
  ): Indexes;

  /// Indexes.delIndexDefinition
  delIndexDefinition(indexId: Id): Indexes;

  /// Indexes.getStore
  getStore(): Store;

  /// Indexes.getIndexIds
  getIndexIds(): Ids;

  /// Indexes.forEachIndex
  forEachIndex(indexCallback: IndexCallback): void;

  /// Indexes.forEachSlice
  forEachSlice(indexId: Id, sliceCallback: SliceCallback): void;

  /// Indexes.hasIndex
  hasIndex(indexId: Id): boolean;

  /// Indexes.hasSlice
  hasSlice(indexId: Id, sliceId: Id): boolean;

  /// Indexes.getTableId
  getTableId(indexId: Id): Id | undefined;

  /// Indexes.getSliceIds
  getSliceIds(indexId: Id): Ids;

  /// Indexes.getSliceRowIds
  getSliceRowIds(indexId: Id, sliceId: Id): Ids;

  /// Indexes.addSliceIdsListener
  addSliceIdsListener(indexId: IdOrNull, listener: SliceIdsListener): Id;

  /// Indexes.addIndexIdsListener
  addIndexIdsListener(listener: IndexIdsListener): Id;

  /// Indexes.addSliceRowIdsListener
  addSliceRowIdsListener(
    indexId: IdOrNull,
    sliceId: IdOrNull,
    listener: SliceRowIdsListener,
  ): Id;

  /// Indexes.delListener
  delListener(listenerId: Id): Indexes;

  /// Indexes.destroy
  destroy(): void;

  /// Indexes.getListenerStats
  getListenerStats(): IndexesListenerStats;
  //
}

/// createIndexes
export function createIndexes(store: Store): Indexes;
