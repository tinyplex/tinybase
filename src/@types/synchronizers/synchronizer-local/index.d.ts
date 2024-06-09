/// synchronizer-local

import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Synchronizer} from '../index.d.ts';

/// LocalSynchronizer
export interface LocalSynchronizer extends Synchronizer {}

/// createLocalSynchronizer
export function createLocalSynchronizer(
  store: MergeableStore,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer;
