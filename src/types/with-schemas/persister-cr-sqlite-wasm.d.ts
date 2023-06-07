/// persister-cr-sqlite-wasm

import {OptionalSchemas, Store} from './store';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {Persister} from './persisters';

/// createCrSqliteWasmPersister
export function createCrSqliteWasmPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: DB,
): Persister<Schemas>;
