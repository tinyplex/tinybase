<script lang="ts">
  import {getCell} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {
    store,
    tableId,
    rowId,
    cellId,
  }: {
    store: Store;
    tableId: Id;
    rowId: Id;
    cellId: Id;
  } = $props();
  const v = getCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
