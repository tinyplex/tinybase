/// persister-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {Store} from '../store.d';

/// SqliteWasmPersister
export interface SqliteWasmPersister extends Persister<3> {
  /// SqliteWasmPersister.getDb
  getDb(): any;
}

/// createSqliteWasmPersister
export function createSqliteWasmPersister(
  store: Store,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteWasmPersister;
