<script lang="ts">
  import type {Id, Store} from 'tinybase';
  import {
    getTable,
    getTableIds,
    getTables,
    hasTable,
    hasTables,
  } from 'tinybase/ui-svelte';

  let {mode, store, tableId}: {mode: string; store: Store; tableId?: Id} =
    $props();

  const getMode = () => mode;
  const value =
    getMode() == 'hasTables'
      ? hasTables(() => store)
      : getMode() == 'tables'
        ? getTables(() => store)
        : getMode() == 'tableIds'
          ? getTableIds(() => store)
          : getMode() == 'hasTable'
            ? hasTable(
                () => tableId,
                () => store,
              )
            : getMode() == 'table'
              ? getTable(
                  () => tableId,
                  () => store,
                )
              : {current: undefined};
</script>

{JSON.stringify(value.current)}
