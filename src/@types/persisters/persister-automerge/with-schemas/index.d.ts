/// persister-automerge

import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {DocHandle} from '@automerge/automerge-repo';
import type {Persister} from '../../with-schemas';

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
