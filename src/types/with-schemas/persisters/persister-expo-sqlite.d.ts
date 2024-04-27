/// persister-expo-sqlite

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {OptionalSchemas, Store} from '../store.d';
import {SQLiteDatabase} from 'expo-sqlite';

/// ExpoSqlitePersister
export interface ExpoSqlitePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// ExpoSqlitePersister.getDb
  getDb(): SQLiteDatabase;
}

/// createExpoSqlitePersister
export function createExpoSqlitePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqlitePersister<Schemas>;
