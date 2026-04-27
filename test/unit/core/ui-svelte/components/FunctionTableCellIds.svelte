<script lang="ts">
  import {getTableCellIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = getTableCellIds(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
