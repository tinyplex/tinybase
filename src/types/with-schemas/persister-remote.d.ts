/// persister-remote

import {OptionalSchemas, Store} from './store';
import {Persister} from './persisters';

/// createRemotePersister
export function createRemotePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds: number,
): Persister<Schemas>;
