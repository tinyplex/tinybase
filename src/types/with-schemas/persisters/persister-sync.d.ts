/// persister-file

import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Persister} from '../persisters';

/// SyncPersister
export interface SyncPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// SyncPersister.getOtherStore
  getOtherStore(): MergeableStore<Schemas>;
}

/// createSyncPersister
export function createSyncPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  otherStore: MergeableStore<Schemas>,
  onIgnoredError?: (error: any) => void,
): SyncPersister<Schemas>;
