/// persister-cr-sqlite-wasm

import {DB} from '@vlcn.io/crsqlite-wasm';
import {Persister} from './persisters';
import {Store} from './store';

/// createCrSqliteWasmPersister
export function createCrSqliteWasmPersister(store: Store, db: DB): Persister;
