/// persister-expo-sqlite-next

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {MergeableStore} from '../mergeable-store.d';
import {SQLiteDatabase} from 'expo-sqlite/next';
import {Store} from '../store.d';

/// ExpoSqliteNextPersister
export interface ExpoSqliteNextPersister extends Persister<3> {
  /// ExpoSqliteNextPersister.getDb
  getDb(): SQLiteDatabase;
}

/// createExpoSqliteNextPersister
export function createExpoSqliteNextPersister(
  store: Store | MergeableStore,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqliteNextPersister;
