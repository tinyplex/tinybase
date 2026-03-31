<script lang="ts">
  import {onTable} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    listener,
  }: {store: Store; tableId: string; listener: (...args: any[]) => void} =
    $props();
  onTable(
    () => tableId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
