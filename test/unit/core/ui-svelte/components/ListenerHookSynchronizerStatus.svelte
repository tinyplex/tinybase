<script lang="ts">
  import {useSynchronizerStatusListener} from 'tinybase/ui-svelte';
  import type {Synchronizer} from 'tinybase/synchronizers';

  let {
    synchronizer,
    listener,
  }: {synchronizer: Synchronizer; listener: (...args: any[]) => void} =
    $props();
  useSynchronizerStatusListener(
    (...args) => listener(...args),
    () => synchronizer,
  );
</script>
