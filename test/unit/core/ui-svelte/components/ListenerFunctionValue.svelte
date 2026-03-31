<script lang="ts">
  import {onValue} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    valueId,
    listener,
  }: {store: Store; valueId: string; listener: (...args: any[]) => void} =
    $props();
  onValue(
    () => valueId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
