/// persister-cr-sqlite-wasm

import type {DatabasePersisterConfig, Persister} from '../../with-schemas';
import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {DB} from '@vlcn.io/crsqlite-wasm';

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
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CrSqliteWasmPersister<Schemas>;
