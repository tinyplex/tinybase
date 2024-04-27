/// synchronizer-local

import {MergeableStore} from '../mergeable-store.d';
import {OptionalSchemas} from '../store.d';
import {Synchronizer} from '../synchronizers.d';

/// LocalSynchronizer
export interface LocalSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {}

/// createLocalSynchronizer
export function createLocalSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer<Schemas>;
