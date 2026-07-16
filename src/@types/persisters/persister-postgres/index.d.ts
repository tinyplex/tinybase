/// persister-postgres
import type {Sql} from 'postgres';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// PostgresPersister
export interface PostgresPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// PostgresPersister.getSql
  getSql(): Sql;
}

/// createPostgresPersister
export function createPostgresPersister<StoreType extends Store>(
  store: StoreType,
  sql: Sql,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister>;
