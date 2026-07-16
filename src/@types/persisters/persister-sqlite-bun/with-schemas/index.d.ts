/// persister-sqlite-bun
import type {Database} from 'bun:sqlite';
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

/// SqliteBunPersister
export interface SqliteBunPersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// SqliteBunPersister.getDb
  getDb(): Database;
}

/// createSqliteBunPersister
export function createSqliteBunPersister<
  Schemas extends OptionalSchemas,
  StoreType extends Store<Schemas>,
>(
  store: StoreType,
  db: Database,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore<Schemas>
        ? DpcJson
        : DatabasePersisterConfig<Schemas>)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteBunPersister<Schemas>;
