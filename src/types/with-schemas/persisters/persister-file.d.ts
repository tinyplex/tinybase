/// persister-file

import {OptionalSchemas, Store} from '../store';
import {MergeableStore} from '../mergeable-store';
import {Persister} from '../persisters';

/// FilePersister
export interface FilePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
  /// FilePersister.getFilePath
  getFilePath(): string;
}

/// createFilePersister
export function createFilePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  filePath: string,
  onIgnoredError?: (error: any) => void,
): FilePersister<Schemas>;
