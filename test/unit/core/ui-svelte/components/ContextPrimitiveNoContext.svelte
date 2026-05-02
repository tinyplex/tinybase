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
  } from 'tinybase/ui-svelte';

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
])}
