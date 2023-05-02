/// persister-yjs

import * as Y from 'yjs';
import {OptionalSchemas, Store} from './store.d';
import {Persister} from './persisters.d';

/// createYjsPersister
export function createYjsPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  yDoc: Y.Doc,
): Persister<Schemas>;
