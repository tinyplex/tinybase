/// persister-sqlite-bun
import type {Database} from 'bun:sqlite';
import type {MergeableStore} from '../../mergeable-store/index.js';
import type {Store} from '../../store/index.js';
import type {DatabasePersisterConfig, Persister, Persists} from '../index.js';

/// SqliteBunPersister
export interface SqliteBunPersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// SqliteBunPersister.getDb
  getDb(): Database;
}

/// createSqliteBunPersister
export function createSqliteBunPersister(
  store: Store | MergeableStore,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteBunPersister;
