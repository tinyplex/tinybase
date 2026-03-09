<script lang="ts">
  import {useValue} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';

  let {store, valueId}: {store: Store; valueId: Id} = $props();
  const v = useValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
