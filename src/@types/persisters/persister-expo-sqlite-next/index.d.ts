/// persister-expo-sqlite-next

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {SQLiteDatabase} from 'expo-sqlite/next.d.ts';
import type {Store} from '../../store/index.d.ts';

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
