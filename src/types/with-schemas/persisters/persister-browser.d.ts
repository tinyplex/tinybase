/// persister-browser

import {OptionalSchemas, Store} from '../store';
import {MergeableStore} from '../mergeable-store';
import {Persister} from '../persisters';

/// SessionPersister
export interface SessionPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
  /// SessionPersister.getStorageName
  getStorageName(): string;
}

/// LocalPersister
export interface LocalPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 3> {
  /// LocalPersister.getStorageName
  getStorageName(): string;
}

/// createSessionPersister
export function createSessionPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): SessionPersister<Schemas>;

/// createLocalPersister
export function createLocalPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  storageName: string,
  onIgnoredError?: (error: any) => void,
): LocalPersister<Schemas>;
