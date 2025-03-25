/// persister-durable-object-storage
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// DurableObjectStoragePersister
export interface DurableObjectStoragePersister
  extends Persister<Persists.MergeableStoreOnly> {
  /// DurableObjectStoragePersister.getStorage
  getStorage(): DurableObjectStorage;
}

/// createDurableObjectStoragePersister
export function createDurableObjectStoragePersister(
  store: MergeableStore,
  storage: DurableObjectStorage,
  storagePrefix?: string,
  onIgnoredError?: (error: any) => void,
): DurableObjectStoragePersister;
