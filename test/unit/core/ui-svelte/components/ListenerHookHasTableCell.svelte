<script lang="ts">
  import {onHasTableCell} from 'tinybase/ui-svelte';
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
  onHasTableCell(
    () => tableId,
    () => cellId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
