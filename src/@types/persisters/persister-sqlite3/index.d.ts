/// persister-sqlite3
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {DatabasePersisterConfig, Persister, Persists} from '../index.d.ts';
import type {Database} from 'sqlite3';

/// Sqlite3Persister
export interface Sqlite3Persister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// Sqlite3Persister.getDb
  getDb(): Database;
}

/// createSqlite3Persister
export function createSqlite3Persister(
  store: Store | MergeableStore,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Sqlite3Persister;
