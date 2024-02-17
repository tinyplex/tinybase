/// mergeable-store

import {CellOrUndefined, Store, ValueOrUndefined} from './store.d';
import {Id} from './common';
import {IdObj} from '../common/obj';

export type Stamp = string;
export type Stamped<Thing> = [stamp: Stamp, thing: Thing];

type MergeableCell = Stamped<CellOrUndefined>;
type MergeableRow = Stamped<IdObj<MergeableCell>>;
type MergeableTable = Stamped<IdObj<MergeableRow>>;
type MergeableTables = Stamped<IdObj<MergeableTable>>;
type MergeableValue = Stamped<ValueOrUndefined>;
type MergeableValues = Stamped<IdObj<MergeableValue>>;
export type MergeableContent = Stamped<
  [mergeableTables: MergeableTables, mergeableValues: MergeableValues]
>;

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
