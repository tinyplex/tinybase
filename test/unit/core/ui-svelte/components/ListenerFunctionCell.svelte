<script lang="ts">
  import {onCell} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    rowId,
    cellId,
    listener,
  }: {
    store: Store;
    tableId: string;
    rowId: string;
    cellId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onCell(
    () => tableId,
    () => rowId,
    () => cellId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
