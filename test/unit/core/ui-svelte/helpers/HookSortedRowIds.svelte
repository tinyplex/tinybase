<script lang="ts">
  import {useSortedRowIds} from 'tinybase/ui-svelte';
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
  const v = useSortedRowIds(
    () => tableId,
    () => cellId,
    () => descending,
    () => offset,
    () => limit,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
