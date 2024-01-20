/// mergeable-store

import {Store} from './store.d';

/// MergeableStore
export interface MergeableStore extends Store {
  //
  /// MergeableStore.merge
  merge(): MergeableStore;
}

/// createMergeableStore
export function createMergeableStore(): MergeableStore;
