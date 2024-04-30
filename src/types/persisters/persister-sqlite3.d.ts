/// persister-sqlite3

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {Database} from 'sqlite3';
import {Store} from '../store.d';

/// Sqlite3Persister
export interface Sqlite3Persister extends Persister<3> {
  /// Sqlite3Persister.getDb
  getDb(): Database;
}

/// createSqlite3Persister
export function createSqlite3Persister(
  store: Store,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Sqlite3Persister;
