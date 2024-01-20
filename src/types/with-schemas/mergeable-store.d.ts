/// mergeable-store

import {OptionalSchemas, Store} from './store.d';

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.merge
  merge(): MergeableStore<Schemas>;
}

/// createMergeableStore
export function createMergeableStore<
  Schemas extends OptionalSchemas,
>(): MergeableStore<Schemas>;
