import {
  NotifyListener,
  createPostgreSqlPersister,
} from '../common/database/postgresql.ts';
import type {
  PglitePersister,
  createPglitePersister as createPglitePersisterDecl,
} from '../../@types/persisters/persister-pglite/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {PGlite} from '@electric-sql/pglite';
import type {Store} from '../../@types/store/index.d.ts';

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
      (await pglite.query(sql, args)).rows as any,
    async (
      channel: string,
      notifyListener: NotifyListener,
    ): Promise<() => Promise<void>> => pglite.listen(channel, notifyListener),
    async (unlisten: () => Promise<void>) => {
      try {
        await unlisten();
      } catch (e) {
        onIgnoredError?.(e);
      }
    },
    onSqlCommand,
    onIgnoredError,
    () => 0,
    3, // StoreOrMergeableStore,
    pglite,
    'getPglite',
  ) as PglitePersister;
}) as typeof createPglitePersisterDecl;
