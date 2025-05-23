/// persister-yjs
import type {Doc as YDoc} from 'yjs';
import type {Store} from '../../store/index.d.ts';
import type {Persister} from '../index.d.ts';

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
