/// persister-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters';
import {OptionalSchemas, Store} from '../store';

/// createSqliteWasmPersister
export function createSqliteWasmPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
): Persister<Schemas>;
