/// persister-automerge

import {OptionalSchemas, Store} from '../store.d';
import {DocHandle} from '@automerge/automerge-repo';
import {Persister} from '../persisters.d';

/// AutomergePersister
export interface AutomergePersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// AutomergePersister.getDocHandle
  getDocHandle(): DocHandle<any>;
}

/// createAutomergePersister
export function createAutomergePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  docHandle: DocHandle<any>,
  docMapName?: string,
  onIgnoredError?: (error: any) => void,
): AutomergePersister<Schemas>;
