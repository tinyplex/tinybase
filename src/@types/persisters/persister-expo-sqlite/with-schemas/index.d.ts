/// persister-expo-sqlite
import type {SQLiteDatabase} from 'expo-sqlite';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../../with-schemas/index.d.ts';

/// ExpoSqlitePersister
export interface ExpoSqlitePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// ExpoSqlitePersister.getDb
  getDb(): SQLiteDatabase;
}

/// createExpoSqlitePersister
export function createExpoSqlitePersister<
  Schemas extends OptionalSchemas,
  StoreType extends Store<Schemas>,
>(
  store: StoreType,
  db: SQLiteDatabase,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore<Schemas>
        ? DpcJson
        : DatabasePersisterConfig<Schemas>)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqlitePersister<Schemas>;
