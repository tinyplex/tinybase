/// persister-durable-object-sql-storage
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {DpcJson, Persister, Persists} from '../index.d.ts';

/// DpcKeyValue
export type DpcKeyValue = {
  /// DpcKeyValue.mode
  mode: 'key-value';
  /// DpcKeyValue.storagePrefix
  storagePrefix?: string;
};

/// DurableObjectSqlDatabasePersisterConfig
export type DurableObjectSqlDatabasePersisterConfig = DpcJson | DpcKeyValue;

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
  configOrStoreTableName?: DurableObjectSqlDatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister;
