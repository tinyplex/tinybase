/// persister-expo-sqlite-next

import type {
  DatabasePersisterConfig,
  Persister,
} from '../../with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {SQLiteDatabase} from 'expo-sqlite/next.d.ts';

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
