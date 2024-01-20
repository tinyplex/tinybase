/// mergeable-store

import {OptionalSchemas, Store} from './store.d';

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {}

/// createMergeableStore
export function createMergeableStore<
  Schemas extends OptionalSchemas,
>(): MergeableStore<Schemas>;
