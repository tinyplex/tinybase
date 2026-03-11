<script lang="ts">
  import {useHasTablesListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useHasTablesListener(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
