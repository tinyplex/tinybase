<script lang="ts">
  import {useTableCellIdsListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    listener,
  }: {store: Store; tableId: string; listener: (...args: any[]) => void} =
    $props();
  useTableCellIdsListener(
    () => tableId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
