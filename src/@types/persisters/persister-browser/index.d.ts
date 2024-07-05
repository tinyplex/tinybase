/// persister-browser

import type {MergeableStore} from '../../mergeable-store';
import type {Persister} from '../';
import type {Store} from '../../store';

/// SessionPersister
export interface SessionPersister extends Persister<3> {
  /// SessionPersister.getStorageName
  getStorageName(): string;
}

/// LocalPersister
export interface LocalPersister extends Persister<3> {
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
