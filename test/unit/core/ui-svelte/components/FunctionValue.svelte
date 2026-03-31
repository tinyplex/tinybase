<script lang="ts">
  import {getValue} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, valueId}: {store: Store; valueId: Id} = $props();
  const v = getValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
