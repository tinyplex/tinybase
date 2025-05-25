/// mergeables
import type {Id} from '../common/index.d.ts';
import type {CellOrUndefined, ValueOrUndefined} from '../store/index.d.ts';

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
export type TablesStamp<Hashed extends boolean = false> = Stamp<
  {[tableId: Id]: TableStamp<Hashed>},
  Hashed
>;

/// TableHashes
export type TableHashes = {[tableId: Id]: Hash};

/// TableStamp
export type TableStamp<Hashed extends boolean = false> = Stamp<
  {[rowId: Id]: RowStamp<Hashed>},
  Hashed
>;

/// RowHashes
export type RowHashes = {[tableId: Id]: {[rowId: Id]: Hash}};

/// RowStamp
export type RowStamp<Hashed extends boolean = false> = Stamp<
  {[cellId: Id]: CellStamp<Hashed>},
  Hashed
>;

/// CellHashes
export type CellHashes = {[tableId: Id]: {[rowId: Id]: {[cellId: Id]: Hash}}};

/// CellStamp
export type CellStamp<Hashed extends boolean = false> = Stamp<
  CellOrUndefined,
  Hashed
>;

/// ValuesStamp
export type ValuesStamp<Hashed extends boolean = false> = Stamp<
  {[valueId: Id]: ValueStamp<Hashed>},
  Hashed
>;

/// ValueHashes
export type ValueHashes = {[valueId: Id]: Hash};

/// ValueStamp
export type ValueStamp<Hashed extends boolean = false> = Stamp<
  ValueOrUndefined,
  Hashed
>;

/// Mergeable
export interface Mergeable {
  //
  /// Mergeable.getMergeableContentHashes
  getMergeableContentHashes(): ContentHashes;

  /// Mergeable.getMergeableTableHashes
  getMergeableTableHashes(): TableHashes;

  /// Mergeable.getMergeableTableDiff
  getMergeableTableDiff(
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes];

  /// Mergeable.getMergeableRowHashes
  getMergeableRowHashes(otherTableHashes: TableHashes): RowHashes;

  /// Mergeable.getMergeableRowDiff
  getMergeableRowDiff(
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes];

  /// Mergeable.getMergeableCellHashes
  getMergeableCellHashes(otherTableRowHashes: RowHashes): CellHashes;

  /// Mergeable.getMergeableCellDiff
  getMergeableCellDiff(otherTableRowCellHashes: CellHashes): TablesStamp;

  /// Mergeable.getMergeableValueHashes
  getMergeableValueHashes(): ValueHashes;

  /// Mergeable.getMergeableValueDiff
  getMergeableValueDiff(otherValueHashes: ValueHashes): ValuesStamp;
}
