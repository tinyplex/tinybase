/// persister-file

import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Persister} from '../index.d.ts';
import type {Store} from '../../store/index.d.ts';

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
