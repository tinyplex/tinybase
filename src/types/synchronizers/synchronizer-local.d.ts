/// synchronizer-local

import {MergeableStore} from '../mergeable-store.d';
import {Synchronizer} from '../synchronizers.d';

/// LocalSynchronizer
export interface LocalSynchronizer extends Synchronizer {}

/// createLocalSynchronizer
export function createLocalSynchronizer(
  store: MergeableStore,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer;
