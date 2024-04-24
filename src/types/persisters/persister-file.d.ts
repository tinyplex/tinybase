/// persister-file

import {MergeableStore} from '../mergeable-store';
import {Persister} from '../persisters';
import {Store} from '../store';

/// FilePersister
export interface FilePersister extends Persister<3> {
  /// FilePersister.getFilePath
  getFilePath(): string;
}

/// createFilePersister
export function createFilePersister(
  store: Store | MergeableStore,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister;
