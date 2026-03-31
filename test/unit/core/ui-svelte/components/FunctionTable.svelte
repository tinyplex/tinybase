<script lang="ts">
  import {getTable} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = getTable(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
