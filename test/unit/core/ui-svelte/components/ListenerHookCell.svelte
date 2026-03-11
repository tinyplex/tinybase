<script lang="ts">
  import {useCellListener} from 'tinybase/ui-svelte';
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
  useCellListener(
    () => tableId,
    () => rowId,
    () => cellId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
