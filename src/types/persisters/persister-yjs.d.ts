/// persister-yjs

import {Persister} from '../persisters.d';
import {Store} from '../store.d';
import {Doc as YDoc} from 'yjs';

/// YjsPersister
export interface YjsPersister extends Persister {
  /// YjsPersister.getYDoc
  getYDoc(): YDoc;
}

/// createYjsPersister
export function createYjsPersister(
  store: Store,
  yDoc: YDoc,
  yMapName?: string,
  onIgnoredError?: (error: any) => void,
): YjsPersister;
