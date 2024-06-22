import type {
  ElectricSqlPersister,
  createElectricSqlPersister as createElectricSqlPersisterDecl,
} from '../../@types/persisters/persister-electric-sql/index.d.ts';
import {
  UpdateListener,
  createSqlitePersister,
} from '../common/sqlite/create.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {ElectricClient} from 'electric-sql/client/model';
import {IdObj} from '../../common/obj.ts';
import {Persists} from '../index.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {UnsubscribeFunction} from 'electric-sql/notifiers';
import {arrayForEach} from '../../common/array.ts';

export const createElectricSqlPersister = ((
  store: Store,
  electricClient: ElectricClient<any>,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ElectricSqlPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await electricClient.db.raw({sql, args}),
    (listener: UpdateListener): UnsubscribeFunction =>
      electricClient.notifier.subscribeToDataChanges((notification) =>
        arrayForEach(
          electricClient.notifier.alias(notification),
          ({tablename}) => listener(tablename),
        ),
      ),
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    Persists.StoreOnly,
    electricClient,
    'getElectricClient',
  ) as ElectricSqlPersister) as typeof createElectricSqlPersisterDecl;
