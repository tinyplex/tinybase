/// persister-durable-object-sql-storage
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';
import type {Persister, Persists} from '../../with-schemas/index.d.ts';

/// DurableObjectSqlStoragePersister
export interface DurableObjectSqlStoragePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.MergeableStoreOnly> {
  /// DurableObjectSqlStoragePersister.getSqlStorage
  getSqlStorage(): SqlStorage;
}

/// createDurableObjectSqlStoragePersister
export function createDurableObjectSqlStoragePersister<
  Schemas extends OptionalSchemas,
>(
  store: MergeableStore<Schemas>,
  sqlStorage: SqlStorage,
  storagePrefix?: string,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister<Schemas>;
