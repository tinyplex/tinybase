<script lang="ts">
  import {useValueIdsListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useValueIdsListener(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
