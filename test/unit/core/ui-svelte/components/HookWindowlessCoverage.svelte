<script lang="ts">
  import {createStore} from 'tinybase';
  import {
    provideStore,
    useBindableCell,
    useBindableValue,
    useCheckpointsIds,
    useIndexesIds,
    useMetricsIds,
    usePersisterIds,
    useQueriesIds,
    useRelationshipsIds,
    useStoreIds,
    useSynchronizerIds,
    useTableIds,
    useTablesListener,
  } from 'tinybase/ui-svelte';

  const store = createStore().setCell('t1', 'r1', 'c1', 1).setValue('v1', 1);

  const tableIds = useTableIds(() => store);
  useTablesListener(
    () => undefined,
    false,
    () => store,
  );

  const cell = useBindableCell(
    () => 't1',
    () => 'r1',
    () => 'c1',
    () => store,
  );
  const value = useBindableValue(
    () => 'v1',
    () => store,
  );

  const storeIds = useStoreIds();
  const metricsIds = useMetricsIds();
  const indexesIds = useIndexesIds();
  const queriesIds = useQueriesIds();
  const relationshipsIds = useRelationshipsIds();
  const checkpointsIds = useCheckpointsIds();
  const persisterIds = usePersisterIds();
  const synchronizerIds = useSynchronizerIds();

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
