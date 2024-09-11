import type {
  CheckpointsOrCheckpointsId,
  IndexesOrIndexesId,
  MetricsOrMetricsId,
  PersisterOrPersisterId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
  SynchronizerOrSynchronizerId,
  useCheckpoints as useCheckpointsDecl,
  useCheckpointsIds as useCheckpointsIdsDecl,
  useIndexes as useIndexesDecl,
  useIndexesIds as useIndexesIdsDecl,
  useMetrics as useMetricsDecl,
  useMetricsIds as useMetricsIdsDecl,
  usePersister as usePersisterDecl,
  usePersisterIds as usePersisterIdsDecl,
  useQueries as useQueriesDecl,
  useQueriesIds as useQueriesIdsDecl,
  useRelationships as useRelationshipsDecl,
  useRelationshipsIds as useRelationshipsIdsDecl,
  useStore as useStoreDecl,
  useStoreIds as useStoreIdsDecl,
  useSynchronizer as useSynchronizerDecl,
  useSynchronizerIds as useSynchronizerIdsDecl,
} from '../@types/ui-react/index.d.ts';
import {GLOBAL, isString, isUndefined} from '../common/other.ts';
import type {Id, Ids} from '../@types/common/index.d.ts';
import {IdObj, objEnsure, objGet, objIds} from '../common/obj.ts';
import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
import type {Indexes} from '../@types/indexes/index.d.ts';
import type {Metrics} from '../@types/metrics/index.d.ts';
import type {Persister} from '../@types/persisters/index.d.ts';
import type {Queries} from '../@types/queries/index.d.ts';
import React from 'react';
import type {Relationships} from '../@types/relationships/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
import {TINYBASE} from '../common/strings.ts';

const {createContext, useContext, useEffect} = React;

export type Thing =
  | Store
  | Metrics
  | Indexes
  | Relationships
  | Queries
  | Checkpoints
  | Persister
  | Synchronizer;

export type ThingsByOffset = [
  Store,
  Metrics,
  Indexes,
  Relationships,
  Queries,
  Checkpoints,
  Persister,
  Synchronizer,
];
export type Offsets = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ContextValue = [
  store?: Store,
  storesById?: {[storeId: Id]: Store},
  metrics?: Metrics,
  metricsById?: {[metricsId: Id]: Metrics},
  indexes?: Indexes,
  indexesById?: {[indexesId: Id]: Indexes},
  relationships?: Relationships,
  relationshipsById?: {[relationshipsId: Id]: Relationships},
  queries?: Queries,
  queriesById?: {[queriesId: Id]: Queries},
  checkpoints?: Checkpoints,
  checkpointsById?: {[checkpointsId: Id]: Checkpoints},
  persister?: Persister,
  persistersById?: {[persisterId: Id]: Persister},
  synchronizer?: Synchronizer,
  synchronizersById?: {[synchronizerId: Id]: Synchronizer},
  addExtraThingById?: <Offset extends Offsets>(
    offset: Offset,
    id: string,
    thing: ThingsByOffset[Offset],
  ) => void,
  delExtraThingById?: (offset: Offsets, id: string) => void,
];

export const Context: React.Context<ContextValue> = objEnsure(
  GLOBAL,
  TINYBASE + '_uirc',
  () => createContext<ContextValue>([]),
);

const useThing = <UsedThing extends Thing>(
  id: Id | undefined,
  offset: number,
): UsedThing | undefined => {
  const contextValue = useContext(Context);
  return (
    isUndefined(id)
      ? contextValue[offset]
      : isString(id)
        ? objGet((contextValue[offset + 1] ?? {}) as IdObj<UsedThing>, id)
        : id
  ) as UsedThing;
};

const useThingOrThingById = <
  Thing extends
    | Store
    | Metrics
    | Indexes
    | Relationships
    | Queries
    | Checkpoints
    | Persister
    | Synchronizer,
>(
  thingOrThingId: Thing | Id | undefined,
  offset: number,
): Thing | undefined => {
  const thing = useThing(thingOrThingId as Id, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId)
    ? (thing as Thing | undefined)
    : (thingOrThingId as Thing);
};

const useProvideThing = <Offset extends Offsets>(
  thingId: Id,
  thing: ThingsByOffset[Offset],
  offset: Offset,
): void => {
  const {16: addExtraThingById, 17: delExtraThingById} = useContext(Context);
  useEffect(() => {
    addExtraThingById?.(offset, thingId, thing);
    return () => delExtraThingById?.(offset, thingId);
  }, [addExtraThingById, thingId, thing, offset, delExtraThingById]);
};

export const useThingIds = (offset: number): Ids =>
  objIds((useContext(Context)[offset] ?? {}) as IdObj<unknown>);

export const useStoreIds: typeof useStoreIdsDecl = () => useThingIds(1);

export const useStore: typeof useStoreDecl = (id?: Id): Store | undefined =>
  useThing(id, 0);

export const useStoreOrStoreById = (
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined => useThingOrThingById(storeOrStoreId, 0);

export const useProvideStore = (storeId: Id, store: Store): void =>
  useProvideThing(storeId, store, 0);

export const useMetricsIds: typeof useMetricsIdsDecl = () => useThingIds(3);

export const useMetrics: typeof useMetricsDecl = (
  id?: Id,
): Metrics | undefined => useThing(id, 2);

export const useMetricsOrMetricsById = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined => useThingOrThingById(metricsOrMetricsId, 2);

export const useProvideMetrics = (metricsId: Id, metrics: Metrics): void =>
  useProvideThing(metricsId, metrics, 1);

export const useIndexesIds: typeof useIndexesIdsDecl = () => useThingIds(5);

export const useIndexes: typeof useIndexesDecl = (
  id?: Id,
): Indexes | undefined => useThing(id, 4);

export const useIndexesOrIndexesById = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined => useThingOrThingById(indexesOrIndexesId, 4);

export const useProvideIndexes = (indexesId: Id, indexes: Indexes): void =>
  useProvideThing(indexesId, indexes, 2);

export const useRelationshipsIds: typeof useRelationshipsIdsDecl = () =>
  useThingIds(7);

export const useRelationships: typeof useRelationshipsDecl = (
  id?: Id,
): Relationships | undefined => useThing(id, 6);

export const useRelationshipsOrRelationshipsById = (
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Relationships | undefined =>
  useThingOrThingById(relationshipsOrRelationshipsId, 6);

export const useProvideRelationships = (
  relationshipsId: Id,
  relationships: Relationships,
): void => useProvideThing(relationshipsId, relationships, 3);

export const useQueriesIds: typeof useQueriesIdsDecl = () => useThingIds(9);

export const useQueries: typeof useQueriesDecl = (
  id?: Id,
): Queries | undefined => useThing(id, 8);

export const useQueriesOrQueriesById = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Queries | undefined => useThingOrThingById(queriesOrQueriesId, 8);

export const useProvideQueries = (queriesId: Id, queries: Queries): void =>
  useProvideThing(queriesId, queries, 4);

export const useCheckpointsIds: typeof useCheckpointsIdsDecl = () =>
  useThingIds(11);

export const useCheckpoints: typeof useCheckpointsDecl = (
  id?: Id,
): Checkpoints | undefined => useThing(id, 10);

export const useCheckpointsOrCheckpointsById = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Checkpoints | undefined =>
  useThingOrThingById(checkpointsOrCheckpointsId, 10);

export const useProvideCheckpoints = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => useProvideThing(checkpointsId, checkpoints, 5);

export const usePersisterIds: typeof usePersisterIdsDecl = () =>
  useThingIds(13);

export const usePersister: typeof usePersisterDecl = (
  id?: Id,
): Persister | undefined => useThing(id, 12);

export const usePersisterOrPersisterById = (
  persisterOrPersisterId?: PersisterOrPersisterId,
): Persister | undefined => useThingOrThingById(persisterOrPersisterId, 12);

export const useProvidePersister = (
  persisterId: Id,
  persister: Persister,
): void => useProvideThing(persisterId, persister, 6);

export const useSynchronizerIds: typeof useSynchronizerIdsDecl = () =>
  useThingIds(15);

export const useSynchronizer: typeof useSynchronizerDecl = (
  id?: Id,
): Synchronizer | undefined => useThing(id, 14);

export const useSynchronizerOrSynchronizerById = (
  persisterOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Synchronizer | undefined =>
  useThingOrThingById(persisterOrSynchronizerId, 14);

export const useProvideSynchronizer = (
  persisterId: Id,
  persister: Synchronizer,
): void => useProvideThing(persisterId, persister, 7);
