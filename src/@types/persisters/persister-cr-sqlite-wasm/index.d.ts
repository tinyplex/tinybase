/// persister-cr-sqlite-wasm
import type {Store} from '../../store/index.d.ts';
import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {DB} from '@vlcn.io/crsqlite-wasm';

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
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CrSqliteWasmPersister;
