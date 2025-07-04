/// mergeable-store
import type {GetNow, Hash, Hlc, Id} from '../common/index.d.ts';
import type {
  CellOrUndefined,
  Content,
  Store,
  ValueOrUndefined,
} from '../store/index.d.ts';

/// Stamp
export type Stamp<Thing, Hashed extends boolean = false> = Hashed extends true
  ? [thing: Thing, hlc: Hlc, hash: Hash]
  : [thing: Thing, hlc?: Hlc];

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

/// MergeableContent
export type MergeableContent = [
  mergeableTables: TablesStamp<true>,
  mergeableValues: ValuesStamp<true>,
];

/// MergeableChanges
export type MergeableChanges<Hashed extends boolean = false> = [
  mergeableTables: TablesStamp<Hashed>,
  mergeableValues: ValuesStamp<Hashed>,
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
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes];

  /// MergeableStore.getMergeableRowHashes
  getMergeableRowHashes(otherTableHashes: TableHashes): RowHashes;

  /// MergeableStore.getMergeableRowDiff
  getMergeableRowDiff(
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes];

  /// MergeableStore.getMergeableCellHashes
  getMergeableCellHashes(otherTableRowHashes: RowHashes): CellHashes;

  /// MergeableStore.getMergeableCellDiff
  getMergeableCellDiff(otherTableRowCellHashes: CellHashes): TablesStamp;

  /// MergeableStore.getMergeableValueHashes
  getMergeableValueHashes(): ValueHashes;

  /// MergeableStore.getMergeableValueDiff
  getMergeableValueDiff(otherValueHashes: ValueHashes): ValuesStamp;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.setDefaultContent
  setDefaultContent(content: Content | (() => Content)): MergeableStore;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(withHashes?: boolean): MergeableChanges<true>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore;

  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore): MergeableStore;

  /// Store.isMergeable
  isMergeable(): boolean;
}

/// createMergeableStore
export function createMergeableStore(
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore;
