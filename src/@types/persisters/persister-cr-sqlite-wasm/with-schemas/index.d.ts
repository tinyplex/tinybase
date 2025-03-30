/// persister-cr-sqlite-wasm
import type {DB} from '@vlcn.io/crsqlite-wasm';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  Persister,
} from '../../with-schemas/index.d.ts';

/// CrSqliteWasmPersister
export interface CrSqliteWasmPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// CrSqliteWasmPersister.getDb
  getDb(): DB;
}

/// createCrSqliteWasmPersister
export function createCrSqliteWasmPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: DB,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CrSqliteWasmPersister<Schemas>;
