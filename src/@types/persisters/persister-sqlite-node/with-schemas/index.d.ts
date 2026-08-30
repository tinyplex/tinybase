/// persister-sqlite-node
import type {DatabaseSync} from 'node:sqlite';
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

/// SqliteNodePersister
export interface SqliteNodePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// SqliteNodePersister.getDb
  getDb(): DatabaseSync;
}

/// createSqliteNodePersister
export function createSqliteNodePersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  db: DatabaseSync,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteNodePersister<Schemas>;
export function createSqliteNodePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> & {getMergeableContent?: never},
  db: DatabaseSync,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteNodePersister<Schemas>;
