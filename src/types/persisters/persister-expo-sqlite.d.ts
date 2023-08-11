/// persister-expo-sqlite

import {DatabasePersisterConfig, Persister} from '../persisters';
import {SQLiteDatabase} from 'expo-sqlite';
import {Store} from '../store';

/// createExpoSqlitePersister
export function createExpoSqlitePersister(
  store: Store,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
): Persister;
