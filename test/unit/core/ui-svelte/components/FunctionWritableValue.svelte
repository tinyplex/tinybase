<script lang="ts">
  import {getValue} from 'tinybase/ui-svelte';
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
  const v = getValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue)}>set</button>
