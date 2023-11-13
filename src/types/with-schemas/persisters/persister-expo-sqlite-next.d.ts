/// persister-expo-sqlite-next

import {DatabasePersisterConfig, Persister} from '../persisters';
import {OptionalSchemas, Store} from '../store';
import {Database} from 'expo-sqlite/next';

/// ExpoSqliteNextPersister
export interface ExpoSqliteNextPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// ExpoSqliteNextPersister.getDb
  getDb: () => Database;
}

/// createExpoSqliteNextPersister
export function createExpoSqliteNextPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ExpoSqliteNextPersister<Schemas>;
