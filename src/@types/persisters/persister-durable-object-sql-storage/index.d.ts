/// persister-durable-object-sql-storage
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// DurableObjectSqlStoragePersister
export interface DurableObjectSqlStoragePersister
  extends Persister<Persists.MergeableStoreOnly> {
  /// DurableObjectSqlStoragePersister.getSqlStorage
  getSqlStorage(): SqlStorage;
}

/// createDurableObjectSqlStoragePersister
export function createDurableObjectSqlStoragePersister(
  store: MergeableStore,
  sqlStorage: SqlStorage,
  storagePrefix?: string,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister;
