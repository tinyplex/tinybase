import type {PGlite} from '@electric-sql/pglite';
import type {MergeableStore} from '../../@types/mergeables/mergeable-store/index.d.ts';
import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  PglitePersister,
  createPglitePersister as createPglitePersisterDecl,
} from '../../@types/persisters/persister-pglite/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {noop, tryCatch} from '../../common/other.ts';
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
    (
      channel: string,
      listener: DatabaseChangeListener,
    ): Promise<() => Promise<void>> => pglite.listen(channel, listener),
    (unlisten: () => Promise<void>) => tryCatch(unlisten, onIgnoredError),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    pglite,
    'getPglite',
  ) as PglitePersister;
}) as typeof createPglitePersisterDecl;
