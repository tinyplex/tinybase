/// persister-better-sqlite3
import type {Database} from 'better-sqlite3';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// BetterSqlite3Persister
export interface BetterSqlite3Persister extends Persister<Persists.StoreOrMergeableStore> {
  /// BetterSqlite3Persister.getDb
  getDb(): Database;
}

/// createBetterSqlite3Persister
export function createBetterSqlite3Persister<StoreType extends Store>(
  store: StoreType,
  db: Database,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): BetterSqlite3Persister;
