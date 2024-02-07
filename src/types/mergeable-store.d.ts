/// mergeable-store

import {Cell, Store, Value} from './store.d';
import {Id} from './common';
import {IdObj} from '../common/obj';

export type Stamp = string;
export type Stamped<Thing> = [stamp: Stamp, thing: Thing];

type MergeableCell = Stamped<Cell | null>;
type MergeableRow = Stamped<IdObj<MergeableCell> | null>;
type MergeableTable = Stamped<IdObj<MergeableRow> | null>;
type MergeableTables = Stamped<IdObj<MergeableTable>>;

type MergeableValue = Stamped<Value | null>;
type MergeableValues = Stamped<IdObj<MergeableValue>>;

export type MergeableContent = Stamped<
  [mergeableTables: MergeableTables, mergeableValues: MergeableValues]
>;

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore): MergeableStore;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.applyMergeableContent
  applyMergeableContent(mergeableContent: MergeableContent): MergeableStore;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore;
