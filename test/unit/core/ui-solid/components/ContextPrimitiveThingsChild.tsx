/* @jsxImportSource solid-js */
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
} from 'tinybase/ui-solid';

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

export const ContextPrimitiveThingsChild = (
  props: ContextPrimitiveThingsChildProps,
) => {
  const storeIds = useStoreIds();
  const metricsIds = useMetricsIds();
  const indexesIds = useIndexesIds();
  const relationshipsIds = useRelationshipsIds();
  const queriesIds = useQueriesIds();
  const checkpointsIds = useCheckpointsIds();
  const persisterIds = usePersisterIds();
  const synchronizerIds = useSynchronizerIds();
  const stores = useStores();
  const store = useStore('store1');
  const metrics = useMetrics('metrics1');
  const indexes = useIndexes('indexes1');
  const relationships = useRelationships('relationships1');
  const queries = useQueries('queries1');
  const checkpoints = useCheckpoints('checkpoints1');
  const persister = usePersister('persister1');
  const synchronizer = useSynchronizer('synchronizer1');

  return (
    <>
      {JSON.stringify([
        storeIds(),
        metricsIds(),
        indexesIds(),
        relationshipsIds(),
        queriesIds(),
        checkpointsIds(),
        persisterIds(),
        synchronizerIds(),
        stores().store1 === props.store,
        store() === props.store,
        metrics() === props.metrics,
        indexes() === props.indexes,
        relationships() === props.relationships,
        queries() === props.queries,
        checkpoints() === props.checkpoints,
        persister() === props.persister,
        synchronizer() === props.synchronizer,
      ])}
    </>
  );
};
