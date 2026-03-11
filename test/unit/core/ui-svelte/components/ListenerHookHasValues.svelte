<script lang="ts">
  import {useHasValuesListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useHasValuesListener(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
