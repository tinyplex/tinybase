<script lang="ts">
  import {useRowIds} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = useRowIds(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
