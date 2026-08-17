/// persister-capacitor-sqlite
import type {SQLiteDBConnection} from '@capacitor-community/sqlite';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// CapacitorSqlitePersister
export interface CapacitorSqlitePersister extends Persister<Persists.StoreOrMergeableStore> {
  /// CapacitorSqlitePersister.getDb
  getDb(): SQLiteDBConnection;
}

/// createCapacitorSqlitePersister
export function createCapacitorSqlitePersister<StoreType extends Store>(
  store: StoreType,
  db: SQLiteDBConnection,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CapacitorSqlitePersister;
