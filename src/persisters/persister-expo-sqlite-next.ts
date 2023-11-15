import {Database, addDatabaseChangeListener} from 'expo-sqlite/next';
import {
  ExpoSqliteNextPersister,
  createExpoSqliteNextPersister as createExpoSqliteNextPersisterDecl,
} from '../types/persisters/persister-expo-sqlite-next';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';

type Subscription = {remove: () => void};

export const createExpoSqliteNextPersister = ((
  store: Store,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqliteNextPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await db.allAsync(sql, args),
    (listener: UpdateListener): Subscription =>
      addDatabaseChangeListener(({tableName}) => listener(tableName)),
    (subscription: Subscription) => subscription.remove(),
    onSqlCommand,
    onIgnoredError,
    db,
  ) as ExpoSqliteNextPersister) as typeof createExpoSqliteNextPersisterDecl;
