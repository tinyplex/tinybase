/// persister-tinyjoin
import type {Client} from 'tinyjoin';
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

/// TinyJoinPersister
export interface TinyJoinPersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// TinyJoinPersister.getTinyJoin
  getTinyJoin(): Client;
}

/// createTinyJoinPersister
export function createTinyJoinPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  tinyJoin: Client,
  configOrStoreTableName?: DpcJson | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): TinyJoinPersister<Schemas>;
export function createTinyJoinPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> & {getMergeableContent?: never},
  tinyJoin: Client,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): TinyJoinPersister<Schemas>;
