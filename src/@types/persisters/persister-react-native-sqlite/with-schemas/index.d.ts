/// persister-react-native-sqlite
import type {SQLiteDatabase} from 'react-native-sqlite-storage';
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

/// ReactNativeSqlitePersister
export interface ReactNativeSqlitePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// ReactNativeSqlitePersister.getDb
  getDb(): SQLiteDatabase;
}

/// createReactNativeSqlitePersister
export function createReactNativeSqlitePersister<
  Schemas extends OptionalSchemas,
>(
  store: MergeableStore<Schemas>,
  db: SQLiteDatabase,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ReactNativeSqlitePersister<Schemas>;
export function createReactNativeSqlitePersister<
  Schemas extends OptionalSchemas,
>(
  store: Store<Schemas> & {getMergeableContent?: never},
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ReactNativeSqlitePersister<Schemas>;
