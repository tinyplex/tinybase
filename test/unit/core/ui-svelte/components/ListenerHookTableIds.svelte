<script lang="ts">
  import {useTableIdsListener} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  useTableIdsListener(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
