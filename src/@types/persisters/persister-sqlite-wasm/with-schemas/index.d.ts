/// persister-sqlite-wasm
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

/// SqliteWasmPersister
export interface SqliteWasmPersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// SqliteWasmPersister.getDb
  getDb(): any;
}

/// createSqliteWasmPersister
export function createSqliteWasmPersister<
  Schemas extends OptionalSchemas,
  StoreType extends Store<Schemas>,
>(
  store: StoreType,
  sqlite3: any,
  db: any,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore<Schemas>
        ? DpcJson
        : DatabasePersisterConfig<Schemas>)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteWasmPersister<Schemas>;
