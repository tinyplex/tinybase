<script lang="ts">
  import {useSortedRowIdsListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    cellId,
    listener,
  }: {
    store: Store;
    tableId: string;
    cellId: string;
    listener: (...args: any[]) => void;
  } = $props();
  useSortedRowIdsListener(
    () => tableId,
    () => cellId,
    () => false,
    () => 0,
    () => undefined,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
