/// persister-libsql

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {Client} from '@libsql/client';
import type {Store} from '../../store/index.d.ts';

/// LibSqlPersister
export interface LibSqlPersister extends Persister {
  /// LibSqlPersister.getClient
  getClient(): Client;
}

/// createLibSqlPersister
export function createLibSqlPersister(
  store: Store,
  client: Client,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): LibSqlPersister;
