<script lang="ts">
  import {useCell} from 'tinybase/ui-svelte';
  import type {Cell, Id, Store} from 'tinybase';

  let {
    store,
    tableId,
    rowId,
    cellId,
    newValue,
  }: {
    store: Store;
    tableId: Id;
    rowId: Id;
    cellId: Id;
    newValue: Cell;
  } = $props();
  const v = useCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue)}>set</button>
