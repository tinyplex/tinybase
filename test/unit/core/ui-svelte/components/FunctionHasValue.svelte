<script lang="ts">
  import {hasValue} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {store, valueId}: {store: Store; valueId: Id} = $props();
  const v = hasValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
