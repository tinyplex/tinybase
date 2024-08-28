import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  PglitePersister,
  createPglitePersister as createPglitePersisterDecl,
} from '../../@types/persisters/persister-pglite/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {PGlite} from '@electric-sql/pglite';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomPostgreSqlPersister} from '../common/database/postgresql.ts';

export const createPglitePersister = (async (
  store: Store | MergeableStore,
  pglite: PGlite,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PglitePersister> => {
  return createCustomPostgreSqlPersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      (await pglite.query(sql, params)).rows as any,
    async (
      channel: string,
      listener: DatabaseChangeListener,
    ): Promise<() => Promise<void>> => pglite.listen(channel, listener),
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
