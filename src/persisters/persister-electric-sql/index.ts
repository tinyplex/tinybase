import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  ElectricSqlPersister,
  createElectricSqlPersister as createElectricSqlPersisterDecl,
} from '../../@types/persisters/persister-electric-sql/index.d.ts';
import type {ElectricClient} from 'electric-sql/client/model';
import {IdObj} from '../../common/obj.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {UnsubscribeFunction} from 'electric-sql/notifiers';
import {arrayForEach} from '../../common/array.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

export const createElectricSqlPersister = ((
  store: Store,
  electricClient: ElectricClient<any>,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ElectricSqlPersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await electricClient.db.raw({sql, args}),
    (listener: DatabaseChangeListener): UnsubscribeFunction =>
      electricClient.notifier.subscribeToDataChanges((notification) =>
        arrayForEach(
          electricClient.notifier.alias(notification),
          ({tablename}) => listener(tablename),
        ),
      ),
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    1, // StoreOnly,
    electricClient,
    'getElectricClient',
  ) as ElectricSqlPersister) as typeof createElectricSqlPersisterDecl;
