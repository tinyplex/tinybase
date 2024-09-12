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
import type {AnyPersister} from '../@types/persisters/index.d.ts';
import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
import type {Indexes} from '../@types/indexes/index.d.ts';
import type {Metrics} from '../@types/metrics/index.d.ts';
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
  | AnyPersister
  | Synchronizer;

export type ThingsByOffset = [
  Store,
  Metrics,
  Indexes,
  Relationships,
  Queries,
  Checkpoints,
  AnyPersister,
  Synchronizer,
];

export enum Offsets {
  Store = 0,
  Metrics = 1,
  Indexes = 2,
  Relationships = 3,
  Queries = 4,
  Checkpoints = 5,
  Persister = 6,
  Synchronizer = 7,
}

export type ContextValue = [
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
  persister?: AnyPersister,
  persistersById?: {
    [persisterId: Id]: AnyPersister;
  },
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
  offset: Offsets,
): UsedThing | undefined => {
  const contextValue = useContext(Context);
  return (
    isUndefined(id)
      ? contextValue[offset * 2]
      : isString(id)
        ? objGet((contextValue[offset * 2 + 1] ?? {}) as IdObj<UsedThing>, id)
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
    | AnyPersister
    | Synchronizer,
>(
  thingOrThingId: Thing | Id | undefined,
  offset: Offsets,
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

export const useThingIds = (offset: Offsets): Ids =>
  objIds((useContext(Context)[offset * 2 + 1] ?? {}) as IdObj<unknown>);

export const useStoreIds: typeof useStoreIdsDecl = () =>
  useThingIds(Offsets.Store);

export const useStore: typeof useStoreDecl = (id?: Id): Store | undefined =>
  useThing(id, Offsets.Store);

export const useStoreOrStoreById = (
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined => useThingOrThingById(storeOrStoreId, Offsets.Store);

export const useProvideStore = (storeId: Id, store: Store): void =>
  useProvideThing(storeId, store, Offsets.Store);

export const useMetricsIds: typeof useMetricsIdsDecl = () =>
  useThingIds(Offsets.Metrics);

export const useMetrics: typeof useMetricsDecl = (
  id?: Id,
): Metrics | undefined => useThing(id, Offsets.Metrics);

export const useMetricsOrMetricsById = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined =>
  useThingOrThingById(metricsOrMetricsId, Offsets.Metrics);

export const useProvideMetrics = (metricsId: Id, metrics: Metrics): void =>
  useProvideThing(metricsId, metrics, Offsets.Metrics);

export const useIndexesIds: typeof useIndexesIdsDecl = () =>
  useThingIds(Offsets.Indexes);

export const useIndexes: typeof useIndexesDecl = (
  id?: Id,
): Indexes | undefined => useThing(id, Offsets.Indexes);

export const useIndexesOrIndexesById = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined =>
  useThingOrThingById(indexesOrIndexesId, Offsets.Indexes);

export const useProvideIndexes = (indexesId: Id, indexes: Indexes): void =>
  useProvideThing(indexesId, indexes, Offsets.Indexes);

export const useRelationshipsIds: typeof useRelationshipsIdsDecl = () =>
  useThingIds(Offsets.Relationships);

export const useRelationships: typeof useRelationshipsDecl = (
  id?: Id,
): Relationships | undefined => useThing(id, Offsets.Relationships);

export const useRelationshipsOrRelationshipsById = (
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Relationships | undefined =>
  useThingOrThingById(relationshipsOrRelationshipsId, Offsets.Relationships);

export const useProvideRelationships = (
  relationshipsId: Id,
  relationships: Relationships,
): void =>
  useProvideThing(relationshipsId, relationships, Offsets.Relationships);

export const useQueriesIds: typeof useQueriesIdsDecl = () =>
  useThingIds(Offsets.Queries);

export const useQueries: typeof useQueriesDecl = (
  id?: Id,
): Queries | undefined => useThing(id, Offsets.Queries);

export const useQueriesOrQueriesById = (
  queriesOrQueriesId?: QueriesOrQueriesId,
): Queries | undefined =>
  useThingOrThingById(queriesOrQueriesId, Offsets.Queries);

export const useProvideQueries = (queriesId: Id, queries: Queries): void =>
  useProvideThing(queriesId, queries, Offsets.Queries);

export const useCheckpointsIds: typeof useCheckpointsIdsDecl = () =>
  useThingIds(Offsets.Checkpoints);

export const useCheckpoints: typeof useCheckpointsDecl = (
  id?: Id,
): Checkpoints | undefined => useThing(id, Offsets.Checkpoints);

export const useCheckpointsOrCheckpointsById = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Checkpoints | undefined =>
  useThingOrThingById(checkpointsOrCheckpointsId, Offsets.Checkpoints);

export const useProvideCheckpoints = (
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void => useProvideThing(checkpointsId, checkpoints, Offsets.Checkpoints);

export const usePersisterIds: typeof usePersisterIdsDecl = () =>
  useThingIds(Offsets.Persister);

export const usePersister: typeof usePersisterDecl = (
  id?: Id,
): AnyPersister | undefined => useThing(id, Offsets.Persister);

export const usePersisterOrPersisterById = (
  persisterOrPersisterId?: PersisterOrPersisterId,
): AnyPersister | undefined =>
  useThingOrThingById(persisterOrPersisterId, Offsets.Persister);

export const useProvidePersister = (
  persisterId: Id,
  persister: AnyPersister,
): void => useProvideThing(persisterId, persister, Offsets.Persister);

export const useSynchronizerIds: typeof useSynchronizerIdsDecl = () =>
  useThingIds(Offsets.Synchronizer);

export const useSynchronizer: typeof useSynchronizerDecl = (
  id?: Id,
): Synchronizer | undefined => useThing(id, Offsets.Synchronizer);

export const useSynchronizerOrSynchronizerById = (
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Synchronizer | undefined =>
  useThingOrThingById(synchronizerOrSynchronizerId, Offsets.Synchronizer);

export const useProvideSynchronizer = (
  persisterId: Id,
  persister: Synchronizer,
): void => useProvideThing(persisterId, persister, Offsets.Synchronizer);
