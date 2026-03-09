<script lang="ts">
  import {useHasTableCell} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';

  let {store, tableId, cellId}: {store: Store; tableId: Id; cellId: Id} =
    $props();
  const v = useHasTableCell(
    () => tableId,
    () => cellId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
