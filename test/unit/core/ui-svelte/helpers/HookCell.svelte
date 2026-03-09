<script lang="ts">
  import {useCell} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';

  let {
    store,
    tableId,
    rowId,
    cellId,
  }: {
    store: Store;
    tableId: Id;
    rowId: Id;
    cellId: Id;
  } = $props();
  const v = useCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
