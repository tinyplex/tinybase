import {Client} from '@libsql/client';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {
  LibSqlPersister,
  createLibSqlPersister as createLibSqlPersisterDecl,
} from '../../@types/persisters/persister-libsql/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {tryCatch} from '../../common/error.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

export const createLibSqlPersister = ((
  store: Store,
  client: Client,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): LibSqlPersister =>
  createCustomSqlitePersister<UnsubscribeFunction>(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      (await client.execute({sql, args})).rows,
    (): UnsubscribeFunction => noop,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    1, // StoreOnly,
    client,
    'getClient',
    undefined,
    (client as Client & {protocol?: string}).protocol == 'file'
      ? undefined
      : async (actions) => {
          onSqlCommand?.('BEGIN');
          const transaction = await client.transaction('write');
          try {
            const result = await actions(
              async (sql: string, args: any[] = []): Promise<IdObj<any>[]> => {
                onSqlCommand?.(sql, args);
                return (await transaction.execute({sql, args})).rows;
              },
            );
            await transaction.commit();
            onSqlCommand?.('END');
            return result;
          } catch (error) {
            await tryCatch(() => transaction.rollback());
            onSqlCommand?.('ROLLBACK');
            throw error;
          } finally {
            transaction.close();
          }
        },
  ) as LibSqlPersister) as typeof createLibSqlPersisterDecl;
