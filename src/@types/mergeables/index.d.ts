/// mergeables
import {Hlc} from '../../common/hlc.ts';
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

export type MergeableChangesListener = (
  changes: MergeableChanges<false>,
) => void;

/// Mergeable
export interface Mergeable {
  addMergeableChangesListener(
    changesListener: MergeableChangesListener,
  ): () => void;

  /// Mergeable.applyMergeableChanges
  applyMergeableChanges(mergeableChanges: MergeableChanges): this;

  loadMyTablesStamp(
    relevants?: MergeableChanges[0] | MergeableContent[0],
  ): TablesStamp<true>;

  loadMyValuesStamp(
    relevants?: MergeableChanges[1] | MergeableContent[1],
  ): ValuesStamp<true>;

  saveMyTablesStamp(myTablesStamp: TablesStamp<true>): void;

  saveMyValuesStamp(myValuesStamp: ValuesStamp<true>): void;

  seenHlc(remoteHlc: Hlc): void;
}
