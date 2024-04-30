import {
  ExpoSqlitePersister,
  createExpoSqlitePersister as createExpoSqlitePersisterDecl,
} from '../types/persisters/persister-expo-sqlite';
import {ResultSet, SQLiteDatabase} from 'expo-sqlite';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';

type Subscription = {remove: () => void};

export const createExpoSqlitePersister = ((
  store: Store,
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
