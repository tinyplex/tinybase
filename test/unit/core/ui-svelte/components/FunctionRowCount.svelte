<script lang="ts">
  import {getRowCount} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = getRowCount(
    () => tableId,
    () => store,
  );
</script>

{v.current}
