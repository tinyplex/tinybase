/// persister-sqlite-node
import type {DatabaseSync} from 'node:sqlite';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// SqliteNodePersister
export interface SqliteNodePersister extends Persister<Persists.StoreOrMergeableStore> {
  /// SqliteNodePersister.getDb
  getDb(): DatabaseSync;
}

/// createSqliteNodePersister
export function createSqliteNodePersister<StoreType extends Store>(
  store: StoreType,
  db: DatabaseSync,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteNodePersister;
