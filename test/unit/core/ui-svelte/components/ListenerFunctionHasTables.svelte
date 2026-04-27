<script lang="ts">
  import {onHasTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onHasTables(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
