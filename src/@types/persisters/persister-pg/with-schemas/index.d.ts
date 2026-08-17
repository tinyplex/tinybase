/// persister-pg
import type {Client, Pool} from 'pg';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../../with-schemas/index.d.ts';

/// PgPersister
export interface PgPersister<Schemas extends OptionalSchemas> extends Persister<
  Schemas,
  Persists.StoreOrMergeableStore
> {
  /// PgPersister.getPg
  getPg(): Pool | Client;
}

/// createPgPersister
export function createPgPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  pg: Pool | Client,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PgPersister<Schemas>>;
export function createPgPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> & {getMergeableContent?: never},
  pg: Pool | Client,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PgPersister<Schemas>>;
