/// persister-expo-sqlite

import {DatabasePersisterConfig, Persister} from '../persisters';
import {OptionalSchemas, Store} from '../store';
import {SQLiteDatabase} from 'expo-sqlite';

/// createExpoSqlitePersister
export function createExpoSqlitePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
