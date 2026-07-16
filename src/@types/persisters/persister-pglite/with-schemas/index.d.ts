/// persister-pglite
import type {PGlite} from '@electric-sql/pglite';
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

/// PglitePersister
export interface PglitePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// PglitePersister.getPglite
  getPglite(): PGlite;
}

/// createPglitePersister
export function createPglitePersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  pglite: PGlite,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PglitePersister<Schemas>>;
export function createPglitePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> & {getMergeableContent?: never},
  pglite: PGlite,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PglitePersister<Schemas>>;
