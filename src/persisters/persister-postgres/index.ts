import type {ListenMeta, Sql} from 'postgres';
import {
  NotifyListener,
  createPostgreSqlPersister,
} from '../common/database/postgresql.ts';
import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';

export const createPostgresPersister = (async (
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister> => {
  const cmdSql = await sql.reserve?.();

  return createPostgreSqlPersister(
    store,
    configOrStoreTableName,
    cmdSql?.unsafe,
    async (
      channel: string,
      notifyListener: NotifyListener,
    ): Promise<ListenMeta> => sql.listen(channel, notifyListener),
    (notifyListener: ListenMeta) =>
      notifyListener.unlisten().catch(onIgnoredError),
    onSqlCommand,
    onIgnoredError,
    () => cmdSql?.release?.(),
    3, // StoreOrMergeableStore,
    sql,

    'getSql',
  ) as PostgresPersister;
}) as typeof createPostgresPersisterDecl;
