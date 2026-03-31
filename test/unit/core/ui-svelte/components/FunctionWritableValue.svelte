<script lang="ts">
  import {createValue} from 'tinybase/ui-svelte';
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
  const v = createValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue)}>set</button>
