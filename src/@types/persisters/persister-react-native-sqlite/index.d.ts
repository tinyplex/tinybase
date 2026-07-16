/// persister-react-native-sqlite
import {type SQLiteDatabase} from 'react-native-sqlite-storage';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// ReactNativeSqlitePersister
export interface ReactNativeSqlitePersister extends Persister<Persists.StoreOrMergeableStore> {
  /// ReactNativeSqlitePersister.getDb
  getDb(): SQLiteDatabase;
}

/// createReactNativeSqlitePersister
export function createReactNativeSqlitePersister<StoreType extends Store>(
  store: StoreType,
  db: SQLiteDatabase,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ReactNativeSqlitePersister;
