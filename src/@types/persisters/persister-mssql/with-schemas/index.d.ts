/// persister-mssql
import type {ConnectionPool} from 'mssql';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {DpcJson, Persister, Persists} from '../../with-schemas/index.d.ts';

/// MsSqlPersister
export interface MsSqlPersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// MsSqlPersister.getMsSql
  getMsSql(): ConnectionPool;
}

/// createMsSqlPersister
export function createMsSqlPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas> | Store<Schemas>,
  mssql: ConnectionPool,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<MsSqlPersister<Schemas>>;
