/// persister-sqlite3

import type {DatabasePersisterConfig, Persister} from '../../with-schemas';
import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {Database} from 'sqlite3';
import type {MergeableStore} from '../../../mergeable-store/with-schemas';

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
