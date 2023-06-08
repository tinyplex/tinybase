/// persister-remote

import {Persister} from '../persisters';
import {Store} from '../store';

/// createRemotePersister
export function createRemotePersister(
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds: number,
): Persister;
