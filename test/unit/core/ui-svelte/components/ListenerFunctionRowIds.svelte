<script lang="ts">
  import {onRowIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    listener,
  }: {store: Store; tableId: string; listener: (...args: any[]) => void} =
    $props();
  onRowIds(
    () => tableId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
