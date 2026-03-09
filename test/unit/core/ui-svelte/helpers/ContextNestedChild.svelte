<script lang="ts">
  import {useStoreIds, useStore} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store1, store2}: {store1: Store; store2: Store} = $props();

  const storeIds = useStoreIds();
  const storeA = useStore('a');
  const storeB = useStore('b');
</script>

{JSON.stringify(storeIds.current)}{storeA === store1 ? 1 : 0}{storeA === store2
  ? 1
  : 0}{storeB === store1 ? 1 : 0}{storeB === store2 ? 1 : 0}
