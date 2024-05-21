/// persister-sqlite3

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {OptionalSchemas, Store} from '../store.d';
import {Database} from 'sqlite3';
import {MergeableStore} from '../mergeable-store.d';

/// Sqlite3Persister
export interface Sqlite3Persister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
  /// Sqlite3Persister.getDb
  getDb(): Database;
}

/// createSqlite3Persister
export function createSqlite3Persister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Sqlite3Persister<Schemas>;
