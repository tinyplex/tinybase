<script lang="ts">
  import {getRowIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = getRowIds(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
