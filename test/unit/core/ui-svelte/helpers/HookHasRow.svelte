<script lang="ts">
  import {useHasRow} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId, rowId}: {store: Store; tableId: Id; rowId: Id} =
    $props();
  const v = useHasRow(
    () => tableId,
    () => rowId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
