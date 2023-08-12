/// persister-expo-sqlite

import {DatabasePersisterConfig, Persister} from '../persisters';
import {SQLiteDatabase} from 'expo-sqlite';
import {Store} from '../store';

/// createExpoSqlitePersister
export function createExpoSqlitePersister(
  store: Store,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Persister;
