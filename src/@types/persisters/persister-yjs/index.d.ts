/// persister-yjs

import type {Persister} from '../';
import type {Store} from '../../store';
import type {Doc as YDoc} from 'yjs';

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
