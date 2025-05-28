/// persister-durable-object-sql-storage
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  Persister,
  Persists,
} from '../../with-schemas/index.d.ts';

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
  store: Store<Schemas> | MergeableStore<Schemas>,
  sqlStorage: SqlStorage,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister<Schemas>;
