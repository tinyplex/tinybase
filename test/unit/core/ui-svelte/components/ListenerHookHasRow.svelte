<script lang="ts">
  import {onHasRow} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    rowId,
    listener,
  }: {
    store: Store;
    tableId: string;
    rowId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onHasRow(
    () => tableId,
    () => rowId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
