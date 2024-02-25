/// persister-file

import {Persister} from '../persisters.d';
import {Store} from '../store.d';

/// FilePersister
export interface FilePersister extends Persister<true> {
  /// FilePersister.getFilePath
  getFilePath(): string;
}

/// createFilePersister
export function createFilePersister(
  store: Store,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister;
