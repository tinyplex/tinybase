<script lang="ts">
  import {useBindableCell} from 'tinybase/ui-svelte';
  import type {Id, Store, Cell} from 'tinybase';

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
    newValue?: Cell;
  } = $props();
  const v = useBindableCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue!)}>set</button>
