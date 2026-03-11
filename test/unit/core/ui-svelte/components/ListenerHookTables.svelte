<script lang="ts">
  import {useTablesListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useTablesListener(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
