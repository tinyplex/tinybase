/// persister-sqlite3

import type {DatabasePersisterConfig, Persister} from '../';
import type {Database} from 'sqlite3';
import type {MergeableStore} from '../../mergeable-store';
import type {Store} from '../../store';

/// Sqlite3Persister
export interface Sqlite3Persister extends Persister<3> {
  /// Sqlite3Persister.getDb
  getDb(): Database;
}

/// createSqlite3Persister
export function createSqlite3Persister(
  store: Store | MergeableStore,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Sqlite3Persister;
