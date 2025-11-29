/// persister-browser
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// SessionPersister
export interface SessionPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// SessionPersister.getStorageName
  getStorageName(): string;
}

/// LocalPersister
export interface LocalPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// LocalPersister.getStorageName
  getStorageName(): string;
}

/// createSessionPersister
export function createSessionPersister(
  store: Store | MergeableStore,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): SessionPersister;

/// createLocalPersister
export function createLocalPersister(
  store: Store | MergeableStore,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): LocalPersister;

/// OpfsPersister
export interface OpfsPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// OpfsPersister.getHandle
  getHandle(): FileSystemFileHandle;
}

/// createOpfsPersister
export function createOpfsPersister(
  store: Store | MergeableStore,
  handle: FileSystemFileHandle,
  onIgnoredError?: (error: any) => void,
): OpfsPersister;
