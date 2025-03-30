/// persister-pglite
import type {PGlite} from '@electric-sql/pglite';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {DatabasePersisterConfig, Persister, Persists} from '../index.d.ts';

/// PglitePersister
export interface PglitePersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// PglitePersister.getPglite
  getPglite(): PGlite;
}

/// createPglitePersister
export function createPglitePersister(
  store: Store | MergeableStore,
  pglite: PGlite,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PglitePersister>;
