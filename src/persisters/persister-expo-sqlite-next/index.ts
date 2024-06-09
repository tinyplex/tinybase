import type {
  ExpoSqliteNextPersister,
  createExpoSqliteNextPersister as createExpoSqliteNextPersisterDecl,
} from '../../@types/persisters/persister-expo-sqlite-next/index.d.ts';
import {
  UpdateListener,
  createSqlitePersister,
} from '../common/sqlite/create.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {SQLiteDatabase} from 'expo-sqlite/next.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {addDatabaseChangeListener} from 'expo-sqlite/next.js';

type Subscription = {remove: () => void};

export const createExpoSqliteNextPersister = ((
  store: Store | MergeableStore,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqliteNextPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await db.getAllAsync(sql, args),
    (listener: UpdateListener): Subscription =>
      addDatabaseChangeListener(({tableName}) => listener(tableName)),
    (subscription: Subscription) => subscription.remove(),
    onSqlCommand,
    onIgnoredError,
    3,
    db,
  ) as ExpoSqliteNextPersister) as typeof createExpoSqliteNextPersisterDecl;
