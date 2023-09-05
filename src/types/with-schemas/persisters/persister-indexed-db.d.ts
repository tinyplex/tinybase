/// persister-indexed-db

import {OptionalSchemas, Store} from '../store';
import {Persister} from '../persisters';

/// createIndexedDbPersister
export function createIndexedDbPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  dbName: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
