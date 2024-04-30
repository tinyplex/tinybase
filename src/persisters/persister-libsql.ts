import {
  LibSqlPersister,
  createLibSqlPersister as createLibSqlPersisterDecl,
} from '../types/persisters/persister-libsql';
import {Client} from '@libsql/client';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {UnsubscribeFunction} from 'electric-sql/dist/notifiers';
import {createSqlitePersister} from './sqlite/create';

export const createLibSqlPersister = ((
  store: Store,
  client: Client,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): LibSqlPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      (await client.execute({sql, args})).rows,
    (): UnsubscribeFunction => () => 0,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    1,
    client,
    'getClient',
  ) as LibSqlPersister) as typeof createLibSqlPersisterDecl;
