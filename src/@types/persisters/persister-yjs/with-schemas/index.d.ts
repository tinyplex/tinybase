/// persister-yjs

import type {OptionalSchemas, Store} from '../../../store/with-schemas';
import type {Persister} from '../../with-schemas';
import type {Doc as YDoc} from 'yjs';

/// YjsPersister
export interface YjsPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// YjsPersister.getYDoc
  getYDoc(): YDoc;
}

/// createYjsPersister
export function createYjsPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  yDoc: YDoc,
  yMapName?: string,
  onIgnoredError?: (error: any) => void,
): YjsPersister<Schemas>;
