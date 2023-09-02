/// persister-indexed-db

import {Persister} from '../persisters';
import {Store} from '../store';

/// createIndexedDbPersister
export function createIndexedDbPersister(
  store: Store,
  dbName: string,
  onIgnoredError?: (error: any) => void,
): Persister;
