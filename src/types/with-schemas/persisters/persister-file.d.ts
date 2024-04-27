/// persister-file

import {OptionalSchemas, Store} from '../store.d';
import {Persister} from '../persisters.d';

/// FilePersister
export interface FilePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// FilePersister.getFilePath
  getFilePath(): string;
}

/// createFilePersister
export function createFilePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister<Schemas>;
