/// persister-sqlite3

import {DatabasePersisterConfig, Persister} from '../persisters';
import {Database} from 'sqlite3';
import {Store} from '../store';

/// createSqlite3Persister
export function createSqlite3Persister(
  store: Store,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
): Persister;
