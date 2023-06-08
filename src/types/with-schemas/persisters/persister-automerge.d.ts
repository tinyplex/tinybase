/// persister-automerge

import {OptionalSchemas, Store} from '../store';
import {DocHandle} from 'automerge-repo';
import {Persister} from '../persisters';

/// createAutomergePersister
export function createAutomergePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  docHandle: DocHandle<any>,
  docMapName?: string,
): Persister<Schemas>;
