/// persister-yjs

import {OptionalSchemas, Store} from '../store.d';
import {Persister} from '../persisters.d';
import {Doc as YDoc} from 'yjs';

/// createYjsPersister
export function createYjsPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  yDoc: YDoc,
  yMapName?: string,
): Persister<Schemas>;
