/// persister-automerge

import {DocHandle} from '@automerge/automerge-repo';
import {Persister} from '../persisters.d';
import {Store} from '../store.d';

/// AutomergePersister
export interface AutomergePersister extends Persister {
  /// AutomergePersister.getDocHandle
  getDocHandle(): DocHandle<any>;
}

/// createAutomergePersister
export function createAutomergePersister(
  store: Store,
  docHandle: DocHandle<any>,
  docMapName?: string,
  onIgnoredError?: (error: any) => void,
): AutomergePersister;
