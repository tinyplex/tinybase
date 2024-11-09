/// persister-durable-object-storage

import type {Persister, Persists} from '../../with-schemas/index.d.ts';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';

/// DurableObjectStoragePersister
export interface DurableObjectStoragePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persists.MergeableStoreOnly> {
  /// DurableObjectStoragePersister.getStorage
  getStorage(): DurableObjectStorage;
}

/// createDurableObjectStoragePersister
export function createDurableObjectStoragePersister<
  Schemas extends OptionalSchemas,
>(
  store: MergeableStore<Schemas>,
  durableObjectStorage: DurableObjectStorage,
  storagePrefix?: string,
  onIgnoredError?: (error: any) => void,
): DurableObjectStoragePersister<Schemas>;
