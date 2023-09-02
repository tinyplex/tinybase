/// persister-indexed-db

import {OptionalSchemas, Store} from '../store';
import {Persister} from '../persisters';

/// createIndexedDbPersister
export function createIndexedDbPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  dbName: string,
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
