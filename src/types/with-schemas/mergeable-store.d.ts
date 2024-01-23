/// mergeable-store

import {OptionalSchemas, Store} from './store.d';

export type Timestamp = string;
export type Timestamped<Thing> = [timestamp: Timestamp, thing: Thing];

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.merge
  merge(): MergeableStore<Schemas>;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): any[];
}

/// createMergeableStore
export function createMergeableStore<
  Schemas extends OptionalSchemas,
>(): MergeableStore<Schemas>;
