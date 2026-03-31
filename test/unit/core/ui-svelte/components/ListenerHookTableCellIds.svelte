<script lang="ts">
  import {onTableCellIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    listener,
  }: {store: Store; tableId: string; listener: (...args: any[]) => void} =
    $props();
  onTableCellIds(
    () => tableId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
