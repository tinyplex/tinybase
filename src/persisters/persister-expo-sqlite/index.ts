import type {
  ExpoSqlitePersister,
  createExpoSqlitePersister as createExpoSqlitePersisterDecl,
} from '../../@types/persisters/persister-expo-sqlite';
import {UpdateListener, createSqlitePersister} from '../common/sqlite/create';
import type {DatabasePersisterConfig} from '../../@types/persisters';
import {IdObj} from '../../common/obj';
import type {MergeableStore} from '../../@types/mergeable-store';
import type {ResultSet} from 'expo-sqlite';
import {SQLiteDatabase} from 'expo-sqlite';
import type {Store} from '../../@types/store';

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
