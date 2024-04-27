/// persister-cr-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {Store} from '../store.d';

/// CrSqliteWasmPersister
export interface CrSqliteWasmPersister extends Persister {
  /// CrSqliteWasmPersister.getDb
  getDb(): DB;
}

/// createCrSqliteWasmPersister
export function createCrSqliteWasmPersister(
  store: Store,
  db: DB,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CrSqliteWasmPersister;
