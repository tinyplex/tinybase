/// persister-sqlite-wasm

import type {
  DatabasePersisterConfig,
  Persister,
  Persists,
} from '../../with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';

/// SqliteWasmPersister
export interface SqliteWasmPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// SqliteWasmPersister.getDb
  getDb(): any;
}

/// createSqliteWasmPersister
export function createSqliteWasmPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteWasmPersister<Schemas>;
