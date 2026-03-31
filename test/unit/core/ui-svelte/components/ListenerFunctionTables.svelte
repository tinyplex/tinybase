<script lang="ts">
  import {onTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onTables(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
