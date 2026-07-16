/// persister-postgres
import type {Sql} from 'postgres';
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

/// PostgresPersister
export interface PostgresPersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// PostgresPersister.getSql
  getSql(): Sql;
}

/// createPostgresPersister
export function createPostgresPersister<
  Schemas extends OptionalSchemas,
  StoreType extends Store<Schemas>,
>(
  store: StoreType,
  sql: Sql,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore<Schemas>
        ? DpcJson
        : DatabasePersisterConfig<Schemas>)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister<Schemas>>;
