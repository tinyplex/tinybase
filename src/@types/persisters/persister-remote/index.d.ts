/// persister-remote

import type {Persister} from '../index.d.ts';
import type {Store} from '../../store/index.d.ts';

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
