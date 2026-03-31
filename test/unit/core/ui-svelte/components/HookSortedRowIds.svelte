<script lang="ts">
  import {createSortedRowIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {
    store,
    tableId,
    cellId,
    descending = false,
    offset = 0,
    limit,
  }: {
    store: Store;
    tableId: Id;
    cellId?: Id;
    descending?: boolean;
    offset?: number;
    limit?: number;
  } = $props();
  const v = createSortedRowIds(
    () => tableId,
    () => cellId,
    () => descending,
    () => offset,
    () => limit,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
