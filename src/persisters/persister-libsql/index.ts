import type {
  LibSqlPersister,
  createLibSqlPersister as createLibSqlPersisterDecl,
} from '../../@types/persisters/persister-libsql/index.d.ts';
import {Client} from '@libsql/client';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {Persists} from '../index.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {UnsubscribeFunction} from 'electric-sql/notifiers';
import {createSqlitePersister} from '../common/sqlite/create.ts';

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
    Persists.StoreOnly,
    client,
    'getClient',
  ) as LibSqlPersister) as typeof createLibSqlPersisterDecl;
