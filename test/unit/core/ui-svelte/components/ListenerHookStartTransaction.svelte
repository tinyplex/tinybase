<script lang="ts">
  import {onStartTransaction} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onStartTransaction(
    (...args) => listener(...args),
    () => store,
  );
</script>
