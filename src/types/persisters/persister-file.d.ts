/// persister-file

import {Persister} from '../persisters';
import {Store} from '../store';

/// FilePersister
export interface FilePersister extends Persister {
  /// FilePersister.getFilePath
  getFilePath: () => string;
}

/// createFilePersister
export function createFilePersister(
  store: Store,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister;
