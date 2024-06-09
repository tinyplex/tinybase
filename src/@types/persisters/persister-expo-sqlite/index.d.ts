/// persister-expo-sqlite

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {SQLiteDatabase} from 'expo-sqlite';
import type {Store} from '../../store/index.d.ts';

/// ExpoSqlitePersister
export interface ExpoSqlitePersister extends Persister<3> {
  /// ExpoSqlitePersister.getDb
  getDb(): SQLiteDatabase;
}

/// createExpoSqlitePersister
export function createExpoSqlitePersister(
  store: Store | MergeableStore,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqlitePersister;
