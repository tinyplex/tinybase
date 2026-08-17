/// persister-indexed-db
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Persister, Persists} from '../../with-schemas/index.d.ts';

/// IndexedDbPersister
export interface IndexedDbPersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// IndexedDbPersister.getDbName
  getDbName(): string;
}

/// createIndexedDbPersister
export function createIndexedDbPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  dbName: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): IndexedDbPersister<Schemas>;
