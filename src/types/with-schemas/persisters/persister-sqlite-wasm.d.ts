/// persister-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {OptionalSchemas, Store} from '../store.d';
import {MergeableStore} from '../mergeable-store.d';

/// SqliteWasmPersister
export interface SqliteWasmPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
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
