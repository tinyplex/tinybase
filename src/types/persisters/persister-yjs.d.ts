/// persister-yjs

import {Persister} from '../persisters.d';
import {Store} from '../store.d';
import {Doc as YDoc} from 'yjs';

/// createYjsPersister
export function createYjsPersister(
  store: Store,
  yDoc: YDoc,
  yMapName?: string,
): Persister;
