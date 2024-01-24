/// mergeable-store

import {Cell, Store, Value} from './store.d';
import {Id} from './common';
import {IdObj} from '../common/obj';

export type Timestamp = string;
export type Timestamped<Thing> = [timestamp: Timestamp, thing: Thing];

type MergeableCell = Timestamped<Cell | null>;
type MergeableRow = Timestamped<IdObj<MergeableCell> | null>;
type MergeableTable = Timestamped<IdObj<MergeableRow> | null>;
type MergeableTables = Timestamped<IdObj<MergeableTable>>;

type MergeableValue = Timestamped<Value | null>;
type MergeableValues = Timestamped<IdObj<MergeableValue>>;

export type MergeableContent = Timestamped<
  [mergeableTables: MergeableTables, mergeableValues: MergeableValues]
>;

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(): MergeableStore;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.applyMergeableContent
  applyMergeableContent(mergeableContent: MergeableContent): MergeableStore;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore;
