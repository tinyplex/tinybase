import {
  NotifyListener,
  createPostgreSqlPersister,
} from '../common/database/postgresql.ts';
import {type PGlite, types} from '@electric-sql/pglite';
import type {
  PglitePersister,
  createPglitePersister as createPglitePersisterDecl,
} from '../../@types/persisters/persister-pglite/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';

const OPTIONS = {
  parsers: {[types.JSON]: (value: any) => value},
};

export const createPglitePersister = (async (
  store: Store | MergeableStore,
  pglite: PGlite,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PglitePersister> => {
  return createPostgreSqlPersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      (await pglite.query(sql, args, OPTIONS)).rows as any,
    async (
      channel: string,
      notifyListener: NotifyListener,
    ): Promise<() => Promise<void>> => pglite.listen(channel, notifyListener),
    async (unlisten: () => Promise<void>) => unlisten(),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    3, // StoreOrMergeableStore,
    pglite,
    'getPglite',
  ) as PglitePersister;
}) as typeof createPglitePersisterDecl;
