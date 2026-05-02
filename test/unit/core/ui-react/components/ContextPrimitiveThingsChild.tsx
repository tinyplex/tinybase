import type {
  Checkpoints,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {
  useCheckpoints,
  useCheckpointsIds,
  useIndexes,
  useIndexesIds,
  useMetrics,
  useMetricsIds,
  usePersister,
  usePersisterIds,
  useQueries,
  useQueriesIds,
  useRelationships,
  useRelationshipsIds,
  useStore,
  useStoreIds,
  useStores,
  useSynchronizer,
  useSynchronizerIds,
} from 'tinybase/ui-react';

export interface ContextPrimitiveThingsChildProps {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}

export const ContextPrimitiveThingsChild = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: ContextPrimitiveThingsChildProps) => {
  const storeIds = useStoreIds();
  const metricsIds = useMetricsIds();
  const indexesIds = useIndexesIds();
  const relationshipsIds = useRelationshipsIds();
  const queriesIds = useQueriesIds();
  const checkpointsIds = useCheckpointsIds();
  const persisterIds = usePersisterIds();
  const synchronizerIds = useSynchronizerIds();

  return (
    <>
      {JSON.stringify([
        storeIds,
        metricsIds,
        indexesIds,
        relationshipsIds,
        queriesIds,
        checkpointsIds,
        persisterIds,
        synchronizerIds,
        useStores().store1 === store,
        useStore('store1') === store,
        useMetrics('metrics1') === metrics,
        useIndexes('indexes1') === indexes,
        useRelationships('relationships1') === relationships,
        useQueries('queries1') === queries,
        useCheckpoints('checkpoints1') === checkpoints,
        usePersister('persister1') === persister,
        useSynchronizer('synchronizer1') === synchronizer,
      ])}
    </>
  );
};
