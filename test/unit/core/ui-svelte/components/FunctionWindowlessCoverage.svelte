<script lang="ts">
  import {createStore} from 'tinybase';
  import {
    provideStore,
    getCell,
    getCheckpointsIds,
    getIndexesIds,
    getMetricsIds,
    getPersisterIds,
    getQueriesIds,
    getRelationshipsIds,
    getStoreIds,
    getSynchronizerIds,
    getTableIds,
    onTables,
    getValue,
  } from 'tinybase/ui-svelte';

  const store = createStore().setCell('t1', 'r1', 'c1', 1).setValue('v1', 1);

  const tableIds = getTableIds(() => store);
  onTables(
    () => undefined,
    false,
    () => store,
  );

  const cell = getCell(
    () => 't1',
    () => 'r1',
    () => 'c1',
    () => store,
  );
  const value = getValue(
    () => 'v1',
    () => store,
  );

  const storeIds = getStoreIds();
  const metricsIds = getMetricsIds();
  const indexesIds = getIndexesIds();
  const queriesIds = getQueriesIds();
  const relationshipsIds = getRelationshipsIds();
  const checkpointsIds = getCheckpointsIds();
  const persisterIds = getPersisterIds();
  const synchronizerIds = getSynchronizerIds();

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
