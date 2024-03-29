import {
  ElectricSqlPersister,
  createElectricSqlPersister as createElectricSqlPersisterDecl,
} from '../types/persisters/persister-electric-sql';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {DatabasePersisterConfig} from '../types/persisters';
import {ElectricClient} from 'electric-sql/client/model';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {UnsubscribeFunction} from 'electric-sql/dist/notifiers';
import {arrayForEach} from '../common/array';

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
    electricClient,
    'getElectricClient',
  ) as ElectricSqlPersister) as typeof createElectricSqlPersisterDecl;
