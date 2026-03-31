<script lang="ts">
  import {onTableIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onTableIds(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
