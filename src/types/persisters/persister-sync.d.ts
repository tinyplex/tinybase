/// persister-file

import {MergeableStore} from '../mergeable-store';
import {Persister} from '../persisters';

/// SyncPersister
export interface SyncPersister extends Persister<true> {
  /// SyncPersister.getOtherStore
  getOtherStore(): MergeableStore;
}

/// createSyncPersister
export function createSyncPersister(
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister;
