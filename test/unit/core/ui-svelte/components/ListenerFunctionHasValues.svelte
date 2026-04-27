<script lang="ts">
  import {onHasValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onHasValues(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
