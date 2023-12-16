/// persister-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters';
import {Store} from '../store';

/// SqliteWasmPersister
export interface SqliteWasmPersister extends Persister {
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
