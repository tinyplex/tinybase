/// persister-mssql
import type {ConnectionPool} from 'mssql';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {DpcJson, Persister, Persists} from '../index.d.ts';

/// MsSqlPersister
export interface MsSqlPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// MsSqlPersister.getMsSql
  getMsSql(): ConnectionPool;
}

/// createMsSqlPersister
export function createMsSqlPersister(
  store: Store | MergeableStore,
  mssql: ConnectionPool,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<MsSqlPersister>;
