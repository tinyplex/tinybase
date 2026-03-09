<script lang="ts">
  import {useRowCount} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';

  let {store, tableId}: {store: Store; tableId: Id} = $props();
  const v = useRowCount(
    () => tableId,
    () => store,
  );
</script>

{v.current}
