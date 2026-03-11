import type {Checkpoints} from '../../../checkpoints/with-schemas/index.js';
import type {Id} from '../../../common/with-schemas/index.js';
import type {Indexes} from '../../../indexes/with-schemas/index.js';
import type {Metrics} from '../../../metrics/with-schemas/index.js';
import type {
  Persister,
  Persists,
} from '../../../persisters/with-schemas/index.js';
import type {Queries} from '../../../queries/with-schemas/index.js';
import type {Relationships} from '../../../relationships/with-schemas/index.js';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.js';
import type {Synchronizer} from '../../../synchronizers/with-schemas/index.js';

export type StoreOrStoreId<Schemas extends OptionalSchemas> =
  | Store<Schemas>
  | Id;

export type MetricsOrMetricsId<Schemas extends OptionalSchemas> =
  | Metrics<Schemas>
  | Id;

export type IndexesOrIndexesId<Schemas extends OptionalSchemas> =
  | Indexes<Schemas>
  | Id;

export type RelationshipsOrRelationshipsId<Schemas extends OptionalSchemas> =
  | Relationships<Schemas>
  | Id;

export type QueriesOrQueriesId<Schemas extends OptionalSchemas> =
  | Queries<Schemas>
  | Id;

export type CheckpointsOrCheckpointsId<Schemas extends OptionalSchemas> =
  | Checkpoints<Schemas>
  | Id;

export type PersisterOrPersisterId<Schemas extends OptionalSchemas> =
  | Persister<Schemas, Persists.StoreOrMergeableStore>
  | Id;

export type SynchronizerOrSynchronizerId<Schemas extends OptionalSchemas> =
  | Synchronizer<Schemas>
  | Id;
