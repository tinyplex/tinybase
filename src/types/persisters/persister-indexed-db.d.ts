/// persister-indexed-db

import {Persister} from '../persisters';
import {Store} from '../store';

/// createIndexedDbPersister
export function createIndexedDbPersister(
  store: Store,
  dbName: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Persister;
