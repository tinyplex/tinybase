<script lang="ts">
  import {onHasValue} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    valueId,
    listener,
  }: {store: Store; valueId: string; listener: (...args: any[]) => void} =
    $props();
  onHasValue(
    () => valueId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
