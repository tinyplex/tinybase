/// persister-sqlite-wasm

import {OptionalSchemas, Store} from '../store';
import {Persister} from '../persisters';

/// createSqliteWasmPersister
export function createSqliteWasmPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  sqlite3: any,
  db: any,
): Persister<Schemas>;
