/// persister-browser

import {Persister} from '../persisters';
import {Store} from '../store';

/// createSessionPersister
export function createSessionPersister(
  store: Store,
  storageName: string,
): Persister;

/// createLocalPersister
export function createLocalPersister(
  store: Store,
  storageName: string,
): Persister;
