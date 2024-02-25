/// persister-file

import {OptionalSchemas, Store} from '../store';
import {Persister} from '../persisters';

/// FilePersister
export interface FilePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// FilePersister.getFilePath
  getFilePath(): string;
}

/// createFilePersister
export function createFilePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister<Schemas>;
