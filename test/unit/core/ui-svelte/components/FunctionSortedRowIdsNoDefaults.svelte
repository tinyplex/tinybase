<script lang="ts">
  import {createSortedRowIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId, cellId}: {store: Store; tableId: Id; cellId?: Id} =
    $props();
  // Pass undefined for descending and offset to trigger their default values
  const v = createSortedRowIds(
    () => tableId,
    () => cellId,
    undefined,
    undefined,
    undefined,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
