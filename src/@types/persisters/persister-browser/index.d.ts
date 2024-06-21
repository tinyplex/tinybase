/// persister-browser

import type {Persistables, Persister} from '../index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';

/// SessionPersister
export interface SessionPersister
  extends Persister<Persistables.StoreOrMergeableStore> {
  /// SessionPersister.getStorageName
  getStorageName(): string;
}

/// LocalPersister
export interface LocalPersister
  extends Persister<Persistables.StoreOrMergeableStore> {
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
