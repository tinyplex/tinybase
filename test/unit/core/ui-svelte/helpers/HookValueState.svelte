<script lang="ts">
  import {useValueState} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';
  import type {Value} from 'tinybase';

  let {
    store,
    valueId,
    newValue,
  }: {
    store: Store;
    valueId: Id;
    newValue?: Value;
  } = $props();
  const v = useValueState(
    () => valueId,
    () => store,
  );
</script>

{JSON.stringify(v.current)}
<button onclick={() => (v.current = newValue!)}>set</button>
