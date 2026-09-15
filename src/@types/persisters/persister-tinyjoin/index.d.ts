/// persister-tinyjoin
import type {Client} from 'tinyjoin';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {
  DatabasePersisterConfig,
  DpcJson,
  Persister,
  Persists,
} from '../index.d.ts';

/// TinyJoinPersister
export interface TinyJoinPersister extends Persister<Persists.StoreOrMergeableStore> {
  /// TinyJoinPersister.getTinyJoin
  getTinyJoin(): Client;
}

/// createTinyJoinPersister
export function createTinyJoinPersister<StoreType extends Store>(
  store: StoreType,
  tinyJoin: Client,
  configOrStoreTableName?:
    | (NoInfer<StoreType> extends MergeableStore
        ? DpcJson
        : DatabasePersisterConfig)
    | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): TinyJoinPersister;
