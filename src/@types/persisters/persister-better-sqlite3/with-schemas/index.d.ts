/// persister-better-sqlite3
import type {Database} from 'better-sqlite3';
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

/// BetterSqlite3Persister
export interface BetterSqlite3Persister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// BetterSqlite3Persister.getDb
  getDb(): Database;
}

/// createBetterSqlite3Persister
export function createBetterSqlite3Persister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  db: Database,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): BetterSqlite3Persister<Schemas>;
export function createBetterSqlite3Persister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> & {getMergeableContent?: never},
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): BetterSqlite3Persister<Schemas>;
