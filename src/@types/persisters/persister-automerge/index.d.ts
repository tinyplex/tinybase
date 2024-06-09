/// persister-automerge

import type {DocHandle} from '@automerge/automerge-repo';
import type {Persister} from '../index.d.ts';
import type {Store} from '../../store/index.d.ts';

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
