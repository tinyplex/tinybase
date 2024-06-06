/// persister-sqlite-wasm

import type {DatabasePersisterConfig, Persister} from '../';
import type {MergeableStore} from '../../mergeable-store';
import type {Store} from '../../store';

/// SqliteWasmPersister
export interface SqliteWasmPersister extends Persister<3> {
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
