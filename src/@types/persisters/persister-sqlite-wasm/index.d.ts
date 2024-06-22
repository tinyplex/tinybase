/// persister-sqlite-wasm

import type {DatabasePersisterConfig, Persister, Persists} from '../index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';

/// SqliteWasmPersister
export interface SqliteWasmPersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// SqliteWasmPersister.getDb
  getDb(): any;
}

/// createSqliteWasmPersister
export function createSqliteWasmPersister(
  store: Store | MergeableStore,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteWasmPersister;
