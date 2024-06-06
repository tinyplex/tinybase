/// persister-expo-sqlite-next

import type {DatabasePersisterConfig, Persister} from '../';
import type {MergeableStore} from '../../mergeable-store';
import type {SQLiteDatabase} from 'expo-sqlite/next';
import type {Store} from '../../store';

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
