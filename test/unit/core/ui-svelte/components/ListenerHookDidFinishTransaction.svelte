<script lang="ts">
  import {useDidFinishTransactionListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useDidFinishTransactionListener(
    (...args) => listener(...args),
    () => store,
  );
</script>
