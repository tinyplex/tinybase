/// persister-libsql

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {OptionalSchemas, Store} from '../store.d';
import {Client} from '@libsql/client';

/// LibSqlPersister
export interface LibSqlPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// LibSqlPersister.getClient
  getClient(): Client;
}

/// createLibSqlPersister
export function createLibSqlPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  client: Client,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): LibSqlPersister<Schemas>;
