/// persister-automerge

import {DocHandle} from 'automerge-repo';
import {Persister} from '../persisters';
import {Store} from '../store';

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
