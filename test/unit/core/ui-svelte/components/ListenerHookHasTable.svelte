<script lang="ts">
  import {useHasTableListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    listener,
  }: {store: Store; tableId: string; listener: (...args: any[]) => void} =
    $props();
  useHasTableListener(
    () => tableId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
