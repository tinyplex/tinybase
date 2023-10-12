/// persister-browser

import {Persister} from '../persisters';
import {Store} from '../store';

/// SessionPersister
export interface SessionPersister extends Persister {
  /// SessionPersister.getStorageName
  getStorageName: () => string;
}

/// LocalPersister
export interface LocalPersister extends Persister {
  /// LocalPersister.getStorageName
  getStorageName: () => string;
}

/// createSessionPersister
export function createSessionPersister(
  store: Store,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): SessionPersister;

/// createLocalPersister
export function createLocalPersister(
  store: Store,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): LocalPersister;
