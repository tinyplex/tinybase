/// persister-sqlite-bun
import type {Database} from 'bun:sqlite';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// SqliteBunPersister
export interface SqliteBunPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// SqliteBunPersister.getDb
  getDb(): Database;
}

/// createSqliteBunPersister
export function createSqliteBunPersister<StoreType extends Store>(
  store: StoreType,
  db: Database,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteBunPersister;
