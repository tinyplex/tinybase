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

/// DpcFragmented
export type DpcFragmented = {
  /// DpcFragmented.mode
  mode: 'fragmented';
  /// DpcFragmented.storagePrefix
  storagePrefix?: string;
};

/// DurableObjectSqlDatabasePersisterConfig
export type DurableObjectSqlDatabasePersisterConfig<
  Schemas extends OptionalSchemas,
> = DatabasePersisterConfig<Schemas> | DpcFragmented;

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
  configOrStoreTableName?:
    | DurableObjectSqlDatabasePersisterConfig<Schemas>
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister<Schemas>;
