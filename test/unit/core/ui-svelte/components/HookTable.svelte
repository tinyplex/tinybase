<script lang="ts">
  import {useTable} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = useTable(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
