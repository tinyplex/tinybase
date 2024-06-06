/// persister-expo-sqlite

import type {DatabasePersisterConfig, Persister} from '../../with-schemas';
import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {MergeableStore} from '../../../mergeable-store/with-schemas';
import type {SQLiteDatabase} from 'expo-sqlite';

/// ExpoSqlitePersister
export interface ExpoSqlitePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
  /// ExpoSqlitePersister.getDb
  getDb(): SQLiteDatabase;
}

/// createExpoSqlitePersister
export function createExpoSqlitePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqlitePersister<Schemas>;
