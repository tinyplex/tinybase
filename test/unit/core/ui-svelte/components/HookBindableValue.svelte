<script lang="ts">
  import {useBindableValue} from 'tinybase/ui-svelte';
  import type {Id, Store, Value} from 'tinybase';

  let {
    store,
    valueId,
    newValue,
  }: {
    store: Store;
    valueId: Id;
    newValue?: Value;
  } = $props();
  const v = useBindableValue(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue!)}>set</button>
