import type {
  ExpoSqlitePersister,
  createExpoSqlitePersister as createExpoSqlitePersisterDecl,
} from '../../@types/persisters/persister-expo-sqlite/index.d.ts';
import {
  UpdateListener,
  createSqlitePersister,
} from '../common/sqlite/create.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {ResultSet} from 'expo-sqlite';
import {SQLiteDatabase} from 'expo-sqlite';
import type {Store} from '../../@types/store/index.d.ts';

type Subscription = {remove: () => void};

export const createExpoSqlitePersister = ((
  store: Store | MergeableStore,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqlitePersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      ((await db.execAsync([{sql, args}], false))[0] as ResultSet).rows,
    (listener: UpdateListener): Subscription =>
      db.onDatabaseChange(({tableName}) => listener(tableName)),
    (subscription: Subscription) => subscription.remove(),
    onSqlCommand,
    onIgnoredError,
    3,
    db,
  ) as ExpoSqlitePersister) as typeof createExpoSqlitePersisterDecl;
