<script lang="ts">
  import {useRowIdsListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    listener,
  }: {store: Store; tableId: string; listener: (...args: any[]) => void} =
    $props();
  useRowIdsListener(
    () => tableId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
