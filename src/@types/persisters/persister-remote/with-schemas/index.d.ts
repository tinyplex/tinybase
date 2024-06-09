/// persister-remote

import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Persister} from '../../with-schemas/index.d.ts';

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
