<script lang="ts">
  import {onWillFinishTransaction} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onWillFinishTransaction(
    (...args) => listener(...args),
    () => store,
  );
</script>
