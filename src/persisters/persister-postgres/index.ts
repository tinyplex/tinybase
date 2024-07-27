import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Sql} from 'postgres';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomPersister} from '../index.ts';

export const createPostgresPersister = ((
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PostgresPersister =>
  createCustomPersister(
    store,
    async () => undefined,
    async () => {},
    () => 0,
    () => 0,
    onIgnoredError,
    3, // StoreOrMergeableStore,
    {getSql: () => sql},
  ) as PostgresPersister) as typeof createPostgresPersisterDecl;
