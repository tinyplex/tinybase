<script lang="ts">
  import {onDidFinishTransaction} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onDidFinishTransaction(
    (...args) => listener(...args),
    () => store,
  );
</script>
