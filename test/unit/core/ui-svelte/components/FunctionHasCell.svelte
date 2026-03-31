<script lang="ts">
  import {hasCell} from 'tinybase/ui-svelte';
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
  const v = hasCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
