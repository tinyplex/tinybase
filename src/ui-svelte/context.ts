import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
import type {Id} from '../@types/common/index.d.ts';
import type {Indexes} from '../@types/indexes/index.d.ts';
import type {Metrics} from '../@types/metrics/index.d.ts';
import type {AnyPersister} from '../@types/persisters/index.d.ts';
import type {Queries} from '../@types/queries/index.d.ts';
import type {Relationships} from '../@types/relationships/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
import {TINYBASE} from '../common/strings.ts';

export const TINYBASE_CONTEXT_KEY = TINYBASE + '_uisc';

export type ContextValue = [
  store?: Store,
  storesById?: {[id: Id]: Store},
  metrics?: Metrics,
  metricsById?: {[id: Id]: Metrics},
  indexes?: Indexes,
  indexesById?: {[id: Id]: Indexes},
  relationships?: Relationships,
  relationshipsById?: {[id: Id]: Relationships},
  queries?: Queries,
  queriesById?: {[id: Id]: Queries},
  checkpoints?: Checkpoints,
  checkpointsById?: {[id: Id]: Checkpoints},
  persister?: AnyPersister,
  persistersById?: {[id: Id]: AnyPersister},
  synchronizer?: Synchronizer,
  synchronizersById?: {[id: Id]: Synchronizer},
  addThing?: (offset: number, id: Id, thing: any) => void,
  delThing?: (offset: number, id: Id) => void,
];
