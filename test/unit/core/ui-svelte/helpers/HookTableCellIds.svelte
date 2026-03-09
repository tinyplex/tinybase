<script lang="ts">
  import {useTableCellIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = useTableCellIds(
    () => tableId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
