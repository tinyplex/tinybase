/// indexes

import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  GetCell,
  OptionalSchemas,
  OptionalTablesSchema,
  RowCallback,
  Store,
} from '../../store/with-schemas/index.d.ts';
import type {
  Id,
  IdOrNull,
  Ids,
  SortKey,
} from '../../common/with-schemas/index.d.ts';

/// Index
export type Index = {[sliceId: Id]: Slice};

/// Slice
export type Slice = Ids;

/// IndexCallback
export type IndexCallback<Schema extends OptionalTablesSchema> = (
  indexId: Id,
  forEachSlice: (sliceCallback: SliceCallback<Schema>) => void,
) => void;

/// SliceCallback
export type SliceCallback<Schema extends OptionalTablesSchema> = (
  sliceId: Id,
  forEachRow: (rowCallback: RowCallback<Schema>) => void,
) => void;

/// IndexIdsListener
export type IndexIdsListener<Schemas extends OptionalSchemas> = (
  indexes: Indexes<Schemas>,
) => void;

/// SliceIdsListener
export type SliceIdsListener<Schemas extends OptionalSchemas> = (
  indexes: Indexes<Schemas>,
  indexId: Id,
) => void;

/// SliceRowIdsListener
export type SliceRowIdsListener<Schemas extends OptionalSchemas> = (
  indexes: Indexes<Schemas>,
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
export interface Indexes<in out Schemas extends OptionalSchemas> {
  /// Indexes.setIndexDefinition
  setIndexDefinition<TableId extends TableIdFromSchema<Schemas[0]>>(
    indexId: Id,
    tableId: TableId,
    getSliceIdOrIds?:
      | CellIdFromSchema<Schemas[0], TableId>
      | ((getCell: GetCell<Schemas[0], TableId>, rowId: Id) => Id | Ids),
    getSortKey?:
      | CellIdFromSchema<Schemas[0], TableId>
      | ((getCell: GetCell<Schemas[0], TableId>, rowId: Id) => SortKey),
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
  forEachIndex(indexCallback: IndexCallback<Schemas[0]>): void;

  /// Indexes.forEachSlice
  forEachSlice(indexId: Id, sliceCallback: SliceCallback<Schemas[0]>): void;

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

  /// Indexes.addIndexIdsListener
  addIndexIdsListener(listener: IndexIdsListener<Schemas>): Id;

  /// Indexes.addSliceIdsListener
  addSliceIdsListener(
    indexId: IdOrNull,
    listener: SliceIdsListener<Schemas>,
  ): Id;

  /// Indexes.addSliceRowIdsListener
  addSliceRowIdsListener(
    indexId: IdOrNull,
    sliceId: IdOrNull,
    listener: SliceRowIdsListener<Schemas>,
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
