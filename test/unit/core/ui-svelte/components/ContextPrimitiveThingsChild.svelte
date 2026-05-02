<script lang="ts">
  import {
    getStoreIds,
    getMetricsIds,
    getIndexesIds,
    getRelationshipsIds,
    getQueriesIds,
    getCheckpointsIds,
    getPersisterIds,
    getSynchronizerIds,
    getStore,
    getMetrics,
    getIndexes,
    getRelationships,
    getQueries,
    getCheckpoints,
    getPersister,
    getSynchronizer,
  } from 'tinybase/ui-svelte';
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

  let {
    store,
    metrics,
    indexes,
    relationships,
    queries,
    checkpoints,
    persister,
    synchronizer,
  }: {
    store: Store;
    metrics: Metrics;
    indexes: Indexes;
    relationships: Relationships;
    queries: Queries;
    checkpoints: Checkpoints;
    persister: AnyPersister;
    synchronizer: Synchronizer;
  } = $props();

  const storeIds = getStoreIds();
  const metricsIds = getMetricsIds();
  const indexesIds = getIndexesIds();
  const relationshipsIds = getRelationshipsIds();
  const queriesIds = getQueriesIds();
  const checkpointsIds = getCheckpointsIds();
  const persisterIds = getPersisterIds();
  const synchronizerIds = getSynchronizerIds();
</script>

{JSON.stringify([
  storeIds.current,
  metricsIds.current,
  indexesIds.current,
  relationshipsIds.current,
  queriesIds.current,
  checkpointsIds.current,
  persisterIds.current,
  synchronizerIds.current,
  getStore('store1') == store,
  getMetrics('metrics1') == metrics,
  getIndexes('indexes1') == indexes,
  getRelationships('relationships1') == relationships,
  getQueries('queries1') == queries,
  getCheckpoints('checkpoints1') == checkpoints,
  getPersister('persister1') == persister,
  getSynchronizer('synchronizer1') == synchronizer,
])}
