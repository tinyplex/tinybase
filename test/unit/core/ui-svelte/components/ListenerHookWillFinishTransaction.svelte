<script lang="ts">
  import {useWillFinishTransactionListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useWillFinishTransactionListener(
    (...args) => listener(...args),
    () => store,
  );
</script>
