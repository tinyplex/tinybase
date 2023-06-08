/// persister-automerge

import {DocHandle} from 'automerge-repo';
import {Persister} from '../persisters';
import {Store} from '../store';

/// createAutomergePersister
export function createAutomergePersister(
  store: Store,
  docHandle: DocHandle<any>,
  docMapName?: string,
): Persister;
