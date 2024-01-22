/// mergeable-store

import {Store} from './store.d';

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(): MergeableStore;

  /// MergeableStore.getMergeableChanges
  getMergeableChanges(): any[];
}

/// createMergeableStore
export function createMergeableStore(): MergeableStore;
