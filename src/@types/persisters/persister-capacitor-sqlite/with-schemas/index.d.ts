/// persister-capacitor-sqlite
import type {SQLiteDBConnection} from '@capacitor-community/sqlite';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../../with-schemas/index.d.ts';

/// CapacitorSqlitePersister
export interface CapacitorSqlitePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// CapacitorSqlitePersister.getDb
  getDb(): SQLiteDBConnection;
}

/// createCapacitorSqlitePersister
export function createCapacitorSqlitePersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  db: SQLiteDBConnection,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CapacitorSqlitePersister<Schemas>;
export function createCapacitorSqlitePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> & {getMergeableContent?: never},
  db: SQLiteDBConnection,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CapacitorSqlitePersister<Schemas>;
