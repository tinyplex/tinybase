/// persister-indexed-db

import type {Persister} from '../index.d.ts';
import type {Store} from '../../store/index.d.ts';

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
