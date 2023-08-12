/// persister-file

import {OptionalSchemas, Store} from '../store';
import {Persister} from '../persisters';

/// createFilePersister
export function createFilePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
