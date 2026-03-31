<script lang="ts">
  import {createHasTable} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = createHasTable(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
