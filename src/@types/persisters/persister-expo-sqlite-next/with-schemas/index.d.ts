/// persister-expo-sqlite-next

import type {DatabasePersisterConfig, Persister} from '../../with-schemas';
import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {MergeableStore} from '../../../mergeable-store/with-schemas';
import type {SQLiteDatabase} from 'expo-sqlite/next';

/// ExpoSqliteNextPersister
export interface ExpoSqliteNextPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
  /// ExpoSqliteNextPersister.getDb
  getDb(): SQLiteDatabase;
}

/// createExpoSqliteNextPersister
export function createExpoSqliteNextPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqliteNextPersister<Schemas>;
