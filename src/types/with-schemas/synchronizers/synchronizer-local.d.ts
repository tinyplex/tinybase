/// synchronizer-local

import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Synchronizer} from '../synchronizers';

/// LocalSynchronizer
export interface LocalSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {}

/// createLocalSynchronizer
export function createLocalSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer<Schemas>;
