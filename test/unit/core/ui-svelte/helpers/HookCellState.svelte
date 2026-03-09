<script lang="ts">
  import {useCellState} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';
  import type {Cell} from 'tinybase';

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
  const v = useCellState(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue!)}>set</button>
