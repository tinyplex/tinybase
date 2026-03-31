<script lang="ts">
  import {onValueIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store, listener}: {store: Store; listener: (...args: any[]) => void} =
    $props();
  onValueIds(
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>
