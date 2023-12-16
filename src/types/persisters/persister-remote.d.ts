/// persister-remote

import {Persister} from '../persisters';
import {Store} from '../store';

/// RemotePersister
export interface RemotePersister extends Persister {
  /// RemotePersister.getUrls
  getUrls(): [string, string];
}

/// createRemotePersister
export function createRemotePersister(
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): RemotePersister;
