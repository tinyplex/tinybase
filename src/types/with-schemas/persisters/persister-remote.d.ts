/// persister-remote

import {OptionalSchemas, Store} from '../store.d';
import {Persister} from '../persisters.d';

/// RemotePersister
export interface RemotePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// RemotePersister.getUrls
  getUrls(): [string, string];
}

/// createRemotePersister
export function createRemotePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): RemotePersister<Schemas>;
