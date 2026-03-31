<script lang="ts">
  import {onSynchronizerStatus} from 'tinybase/ui-svelte';
  import type {Synchronizer} from 'tinybase/synchronizers';

  let {
    synchronizer,
    listener,
  }: {synchronizer: Synchronizer; listener: (...args: any[]) => void} =
    $props();
  onSynchronizerStatus(
    (...args) => listener(...args),
    () => synchronizer,
  );
</script>
