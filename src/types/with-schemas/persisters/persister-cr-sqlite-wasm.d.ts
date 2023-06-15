/// persister-cr-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters';
import {OptionalSchemas, Store} from '../store';
import {DB} from '@vlcn.io/crsqlite-wasm';

/// createCrSqliteWasmPersister
export function createCrSqliteWasmPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: DB,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
): Persister<Schemas>;
