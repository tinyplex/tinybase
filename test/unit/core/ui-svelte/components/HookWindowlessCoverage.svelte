<script lang="ts">
  import {createStore} from 'tinybase';
  import {
    provideStore,
    createCell,
    createCheckpointsIds,
    createIndexesIds,
    createMetricsIds,
    createPersisterIds,
    createQueriesIds,
    createRelationshipsIds,
    createStoreIds,
    createSynchronizerIds,
    createTableIds,
    useTablesListener,
    createValue,
  } from 'tinybase/ui-svelte';

  const store = createStore().setCell('t1', 'r1', 'c1', 1).setValue('v1', 1);

  const tableIds = createTableIds(() => store);
  useTablesListener(
    () => undefined,
    false,
    () => store,
  );

  const cell = createCell(
    () => 't1',
    () => 'r1',
    () => 'c1',
    () => store,
  );
  const value = createValue(
    () => 'v1',
    () => store,
  );

  const storeIds = createStoreIds();
  const metricsIds = createMetricsIds();
  const indexesIds = createIndexesIds();
  const queriesIds = createQueriesIds();
  const relationshipsIds = createRelationshipsIds();
  const checkpointsIds = createCheckpointsIds();
  const persisterIds = createPersisterIds();
  const synchronizerIds = createSynchronizerIds();

  provideStore('s1', store);
</script>

{JSON.stringify([
  tableIds.current,
  cell.current,
  value.current,
  storeIds.current,
  metricsIds.current,
  indexesIds.current,
  queriesIds.current,
  relationshipsIds.current,
  checkpointsIds.current,
  persisterIds.current,
  synchronizerIds.current,
])}
