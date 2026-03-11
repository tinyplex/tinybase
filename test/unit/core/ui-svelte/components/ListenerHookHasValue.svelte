<script lang="ts">
  import {useHasValueListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    valueId,
    listener,
  }: {store: Store; valueId: string; listener: (...args: any[]) => void} =
    $props();
  useHasValueListener(
    () => valueId,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
