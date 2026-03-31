<script lang="ts">
  import {createRowIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = createRowIds(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
