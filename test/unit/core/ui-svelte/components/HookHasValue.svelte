<script lang="ts">
  import {createHasValue} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, valueId}: {store: Store; valueId: Id} = $props();
  const v = createHasValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
