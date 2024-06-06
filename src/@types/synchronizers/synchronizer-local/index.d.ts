/// synchronizer-local

import type {MergeableStore} from '../../mergeable-store';
import type {Synchronizer} from '../';

/// LocalSynchronizer
export interface LocalSynchronizer extends Synchronizer {}

/// createLocalSynchronizer
export function createLocalSynchronizer(
  store: MergeableStore,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer;
