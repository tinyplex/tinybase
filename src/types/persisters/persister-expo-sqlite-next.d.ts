/// persister-expo-sqlite-next

import {DatabasePersisterConfig, Persister} from '../persisters';
import {Database} from 'expo-sqlite/next';
import {Store} from '../store';

/// ExpoSqliteNextPersister
export interface ExpoSqliteNextPersister extends Persister {
  /// ExpoSqliteNextPersister.getDb
  getDb: () => Database;
}

/// createExpoSqliteNextPersister
export function createExpoSqliteNextPersister(
  store: Store,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqliteNextPersister;
