/// persister-file

import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {MergeableStore} from '../../../mergeable-store/with-schemas';
import type {Persister} from '../../with-schemas';

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
