/// persister-sqlite-bun
import type {Database} from 'bun:sqlite';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.js';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.js';
import type {
  DatabasePersisterConfig,
  Persister,
  Persists,
} from '../../with-schemas/index.js';

/// SqliteBunPersister
export interface SqliteBunPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// SqliteBunPersister.getDb
  getDb(): Database;
}

/// createSqliteBunPersister
export function createSqliteBunPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteBunPersister<Schemas>;
