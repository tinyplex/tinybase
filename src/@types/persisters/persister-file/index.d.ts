/// persister-file

import type {MergeableStore} from '../../mergeable-store';
import type {Persister} from '../';
import type {Store} from '../../store';

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
