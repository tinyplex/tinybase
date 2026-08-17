import type {Client, Notification, Pool, PoolClient} from 'pg';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  PgPersister,
  createPgPersister as createPgPersisterDecl,
} from '../../@types/persisters/persister-pg/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {tryCatch} from '../../common/error.ts';
import {IdObj} from '../../common/obj.ts';
import {isUndefined, noop, promiseResolve} from '../../common/other.ts';
import {escapeId} from '../common/database/common.ts';
import {createCustomPostgreSqlPersister} from '../common/database/postgresql.ts';

type ReservedClient = [
  client: Client | PoolClient,
  release: (discard?: boolean) => void,
];
type ListenerHandle = () => void | Promise<void>;

const isPool = (pg: Pool | Client): pg is Pool =>
  !isUndefined((pg as Pool)?.idleCount);

const reserveClient = async (
  pg: Pool | Client,
  onIgnoredError?: (error: any) => void,
): Promise<ReservedClient> => {
  if (isPool(pg)) {
    const client = await pg.connect();
    client.on('error', onIgnoredError ?? noop);
    return [client, (discard?: boolean) => client.release(discard)];
  }
  return [pg, noop];
};

const getSerializer = () => {
  let chain: Promise<any> = promiseResolve();
  return <Return>(action: () => Promise<Return>): Promise<Return> =>
    (chain = chain.then(action, action));
};

export const createPgPersister = (async (
  store: Store | MergeableStore,
  pg: Pool | Client,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PgPersister> => {
  const [commandClient, releaseCommandClient] = await reserveClient(
    pg,
    onIgnoredError,
  );
  const serialize = getSerializer();
  try {
    return createCustomPostgreSqlPersister(
      store,
      configOrStoreTableName,
      (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
        serialize(async () => (await commandClient.query(sql, params)).rows),
      async (
        channel: string,
        listener: DatabaseChangeListener,
      ): Promise<ListenerHandle> => {
        const handler = (notification: Notification) =>
          notification.channel == channel
            ? listener(notification.payload as string)
            : 0;
        const listenSql = escapeId(channel);
        const [client, release] = await reserveClient(pg, onIgnoredError);
        client.on('notification', handler);
        await client.query('LISTEN ' + listenSql);
        return async () => {
          client.off('notification', handler);
          if (isPool(pg)) {
            release(true);
          } else {
            await client.query('UNLISTEN ' + listenSql);
          }
        };
      },
      (unlisten: ListenerHandle) => tryCatch(unlisten, onIgnoredError),
      onSqlCommand,
      onIgnoredError,
      releaseCommandClient,
      3, // StoreOrMergeableStore,
      pg,
      'getPg',
    ) as PgPersister;
  } catch (error) {
    releaseCommandClient();
    throw error;
  }
}) as typeof createPgPersisterDecl;
