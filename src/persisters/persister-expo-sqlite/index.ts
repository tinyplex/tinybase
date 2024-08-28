import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  ExpoSqlitePersister,
  createExpoSqlitePersister as createExpoSqlitePersisterDecl,
} from '../../@types/persisters/persister-expo-sqlite/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {SQLiteDatabase} from 'expo-sqlite';
import type {Store} from '../../@types/store/index.d.ts';
import {addDatabaseChangeListener} from 'expo-sqlite';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type Subscription = {remove: () => void};

export const createExpoSqlitePersister = ((
  store: Store | MergeableStore,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqlitePersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      await db.getAllAsync(sql, params),
    (listener: DatabaseChangeListener): Subscription =>
      addDatabaseChangeListener(({tableName}) => listener(tableName)),
    (subscription: Subscription) => subscription.remove(),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    3, // StoreOrMergeableStore,
    db,
  ) as ExpoSqlitePersister) as typeof createExpoSqlitePersisterDecl;
