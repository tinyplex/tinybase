/// mergeable-store

import {CellOrUndefined, Store, ValueOrUndefined} from './store.d';
import {Id} from './common';
import {IdObj} from '../common/obj';

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing> = [time: Time, thing: Thing];

type MergeableCell = Stamp<CellOrUndefined>;
type MergeableRow = Stamp<IdObj<MergeableCell>>;
type MergeableTable = Stamp<IdObj<MergeableRow>>;
type MergeableTables = Stamp<IdObj<MergeableTable>>;
type MergeableValue = Stamp<ValueOrUndefined>;
type MergeableValues = Stamp<IdObj<MergeableValue>>;

/// MergeableContent
export type MergeableContent = Stamp<
  [mergeableTables: MergeableTables, mergeableValues: MergeableValues]
>;

/// MergeableChanges
export type MergeableChanges = MergeableContent;

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore): MergeableStore;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(mergeableChanges: MergeableChanges): MergeableStore;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore;
