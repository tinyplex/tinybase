/// persister-indexed-db
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// IndexedDbPersister
export interface IndexedDbPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// IndexedDbPersister.getDbName
  getDbName(): string;
}

/// createIndexedDbPersister
export function createIndexedDbPersister(
  store: Store | MergeableStore,
  dbName: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): IndexedDbPersister;
