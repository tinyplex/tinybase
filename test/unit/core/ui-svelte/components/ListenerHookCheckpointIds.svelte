<script lang="ts">
  import {onCheckpointIds} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {
    checkpoints,
    listener,
  }: {checkpoints: Checkpoints; listener: (...args: any[]) => void} = $props();
  onCheckpointIds(
    (...args) => listener(...args),
    () => checkpoints,
  );
</script>
