/// mergeable-store

import {OptionalSchemas, Store} from './store.d';

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.merge
  merge(): MergeableStore<Schemas>;

  /// MergeableStore.getMergeableChanges
  getMergeableChanges(): any[];
}

/// createMergeableStore
export function createMergeableStore<
  Schemas extends OptionalSchemas,
>(): MergeableStore<Schemas>;
