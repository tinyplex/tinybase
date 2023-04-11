/// indexes

import {
  CellIdFromSchema,
  GetCellAlias,
  NoSchemas,
  OptionalSchemas,
  RowCallback,
  Store,
  TableIdFromSchema,
} from './store.d';
import {Id, IdOrNull, Ids, SortKey} from './common.d';

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
  sliceIds?: number;
  /// IndexesListenerStats.sliceRowIds
  sliceRowIds?: number;
};

/// Indexes
export interface Indexes<Schemas extends OptionalSchemas = NoSchemas> {
  /// Indexes.setIndexDefinition
  setIndexDefinition<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    GetCell = GetCellAlias<Schemas[0], TableId>,
  >(
    indexId: Id,
    tableId: TableId,
    getSliceIdOrIds?: CellId | ((getCell: GetCell, rowId: Id) => Id | Ids),
    getSortKey?: CellId | ((getCell: GetCell, rowId: Id) => SortKey),
    sliceIdSorter?: (sliceId1: Id, sliceId2: Id) => number,
    rowIdSorter?: (sortKey1: SortKey, sortKey2: SortKey, sliceId: Id) => number,
  ): Indexes<Schemas>;

  /// Indexes.delIndexDefinition
  delIndexDefinition(indexId: Id): Indexes<Schemas>;

  /// Indexes.getStore
  getStore(): Store<Schemas>;

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
  getTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    indexId: Id,
  ): TableId | undefined;

  /// Indexes.getSliceIds
  getSliceIds(indexId: Id): Ids;

  /// Indexes.getSliceRowIds
  getSliceRowIds(indexId: Id, sliceId: Id): Ids;

  /// Indexes.addSliceIdsListener
  addSliceIdsListener(indexId: IdOrNull, listener: SliceIdsListener): Id;

  /// Indexes.addSliceRowIdsListener
  addSliceRowIdsListener(
    indexId: IdOrNull,
    sliceId: IdOrNull,
    listener: SliceRowIdsListener,
  ): Id;

  /// Indexes.delListener
  delListener(listenerId: Id): Indexes<Schemas>;

  /// Indexes.destroy
  destroy(): void;

  /// Indexes.getListenerStats
  getListenerStats(): IndexesListenerStats;
}

/// createIndexes
export function createIndexes<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Indexes<Schemas>;
