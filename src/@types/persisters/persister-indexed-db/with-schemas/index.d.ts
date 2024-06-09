/// persister-indexed-db

import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Persister} from '../../with-schemas/index.d.ts';

/// IndexedDbPersister
export interface IndexedDbPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// IndexedDbPersister.getDbName
  getDbName(): string;
}

/// createIndexedDbPersister
export function createIndexedDbPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  dbName: string,
  autoLoadIntervalSeconds?: number,
  onIgnoredError?: (error: any) => void,
): IndexedDbPersister<Schemas>;
