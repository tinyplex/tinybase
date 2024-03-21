/// persister-yjs

import {OptionalSchemas, Store} from '../store.d';
import {Persister} from '../persisters.d';
import {Doc as YDoc} from 'yjs';

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
