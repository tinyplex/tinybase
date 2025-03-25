/// persister-postgres
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {DatabasePersisterConfig, Persister, Persists} from '../index.d.ts';
import type {Sql} from 'postgres';

/// PostgresPersister
export interface PostgresPersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// PostgresPersister.getSql
  getSql(): Sql;
}

/// createPostgresPersister
export function createPostgresPersister(
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister>;
