<script lang="ts">
  import {createRowCount} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = createRowCount(
    () => tableId,
    () => store,
  );
</script>

{v.current}
