/// persister-cr-sqlite-wasm

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {DB} from '@vlcn.io/crsqlite-wasm';
import type {Store} from '../../store/index.d.ts';

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
