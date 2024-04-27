/// persister-indexed-db

import {Persister} from '../persisters.d';
import {Store} from '../store.d';

/// IndexedDbPersister
export interface IndexedDbPersister extends Persister {
  /// IndexedDbPersister.getDbName
  getDbName(): string;
}

/// createIndexedDbPersister
export function createIndexedDbPersister(
  store: Store,
  dbName: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): IndexedDbPersister;
