import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {ListenMeta, Sql} from 'postgres';
import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomPostgreSqlPersister} from '../common/database/postgresql.ts';

export const createPostgresPersister = (async (
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister> => {
  const commandSql = await sql.reserve?.();

  return createCustomPostgreSqlPersister(
    store,
    configOrStoreTableName,
    commandSql?.unsafe,
    async (
      channel: string,
      listener: DatabaseChangeListener,
    ): Promise<ListenMeta> => sql.listen(channel, listener),
    async (notifyListener: ListenMeta) => {
      try {
        await notifyListener.unlisten();
      } catch (e) {
        onIgnoredError?.(e);
      }
    },
    onSqlCommand,
    onIgnoredError,
    () => commandSql?.release?.(),
    3, // StoreOrMergeableStore,
    sql,
    'getSql',
  ) as PostgresPersister;
}) as typeof createPostgresPersisterDecl;
