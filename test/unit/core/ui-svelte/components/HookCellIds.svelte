<script lang="ts">
  import {createCellIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId, rowId}: {store: Store; tableId: Id; rowId: Id} =
    $props();
  const v = createCellIds(
    () => tableId,
    () => rowId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
