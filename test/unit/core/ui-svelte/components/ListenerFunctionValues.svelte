<script lang="ts">
  import {onValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onValues(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
