<script lang="ts">
  import {useValuesListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useValuesListener(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
