/// persister-yjs

import * as Y from 'yjs';
import {Persister} from './persisters.d';
import {Store} from './store.d';

/// createYjsPersister
export function createYjsPersister(store: Store, yDoc: Y.Doc): Persister;
