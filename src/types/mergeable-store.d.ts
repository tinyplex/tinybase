/// mergeable-store

import {Store} from './store.d';

export type Timestamp = string;
export type Timestamped<Thing> = [timestamp: Timestamp, thing: Thing];

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(): MergeableStore;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): any[];
}

/// createMergeableStore
export function createMergeableStore(): MergeableStore;
