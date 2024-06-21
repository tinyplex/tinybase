/// persister-sqlite3

import type {
  DatabasePersisterConfig,
  Persistables,
  Persister,
} from '../../with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Database} from 'sqlite3';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';

/// Sqlite3Persister
export interface Sqlite3Persister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persistables.StoreOrMergeableStore> {
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
