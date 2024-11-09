/// persister-durable-object-storage

import type {Persister, Persists} from '../index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';

/// DurableObjectStoragePersister
export interface DurableObjectStoragePersister
  extends Persister<Persists.MergeableStoreOnly> {
  /// DurableObjectStoragePersister.getStorage
  getStorage(): DurableObjectStorage;
}

/// createDurableObjectStoragePersister
export function createDurableObjectStoragePersister(
  store: MergeableStore,
  durableObjectStorage: DurableObjectStorage,
  storagePrefix?: string,
  onIgnoredError?: (error: any) => void,
): DurableObjectStoragePersister;
