<script lang="ts">
  import {hasTable} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = hasTable(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
