<script lang="ts">
  import {useStartTransactionListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useStartTransactionListener(
    (...args) => listener(...args),
    () => store,
  );
</script>
