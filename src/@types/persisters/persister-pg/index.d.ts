/// persister-pg
import type {Client, Pool} from 'pg';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// PgPersister
export interface PgPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// PgPersister.getPg
  getPg(): Pool | Client;
}

/// createPgPersister
export function createPgPersister<StoreType extends Store>(
  store: StoreType,
  pg: Pool | Client,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PgPersister>;
