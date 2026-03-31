<script lang="ts">
  import {createTableCellIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = createTableCellIds(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
