<script lang="ts">
  import {createValue} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, valueId}: {store: Store; valueId: Id} = $props();
  const v = createValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
