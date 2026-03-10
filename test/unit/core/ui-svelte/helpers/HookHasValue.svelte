<script lang="ts">
  import {useHasValue} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, valueId}: {store: Store; valueId: Id} = $props();
  const v = useHasValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
