/// persister-sqlite3

import {DatabasePersisterConfig, Persister} from '../persisters';
import {OptionalSchemas, Store} from '../store';
import {Database} from 'sqlite3';

/// createSqlite3Persister
export function createSqlite3Persister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Persister<Schemas>;
