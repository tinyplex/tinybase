/// synchronizer-local

import {MergeableStore} from '../mergeable-store';
import {Synchronizer} from '../synchronizers';

/// LocalSynchronizer
export interface LocalSynchronizer extends Synchronizer {}

/// createLocalSynchronizer
export function createLocalSynchronizer(
  store: MergeableStore,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer;
