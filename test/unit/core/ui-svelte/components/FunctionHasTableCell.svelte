<script lang="ts">
  import {hasTableCell} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId, cellId}: {store: Store; tableId: Id; cellId: Id} =
    $props();
  const v = hasTableCell(
    () => tableId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
