/// persister-opfs
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// OpfsPersister
export interface OpfsPersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// OpfsPersister.getHandle
  getHandle(): FileSystemFileHandle;
}

/// createOpfsPersister
export function createOpfsPersister(
  store: Store | MergeableStore,
  handle: FileSystemFileHandle,
  onIgnoredError?: (error: any) => void,
): OpfsPersister;
