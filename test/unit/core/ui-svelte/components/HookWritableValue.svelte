<script lang="ts">
  import {useValue} from 'tinybase/ui-svelte';
  import type {Id, Store, Value} from 'tinybase';

  let {
    store,
    valueId,
    newValue,
  }: {
    store: Store;
    valueId: Id;
    newValue: Value;
  } = $props();
  const v = useValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue)}>set</button>
