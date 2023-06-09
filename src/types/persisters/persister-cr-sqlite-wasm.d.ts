/// persister-cr-sqlite-wasm

import {DatabasePersisterConfig, Persister} from '../persisters';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {Store} from '../store';

/// createCrSqliteWasmPersister
export function createCrSqliteWasmPersister(
  store: Store,
  db: DB,
  storeTableOrConfig?: string | DatabasePersisterConfig,
): Persister;
