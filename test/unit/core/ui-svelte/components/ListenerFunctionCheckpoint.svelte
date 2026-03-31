<script lang="ts">
  import {onCheckpoint} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {
    checkpoints,
    checkpointId,
    listener,
  }: {
    checkpoints: Checkpoints;
    checkpointId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onCheckpoint(
    () => checkpointId,
    (...args) => listener(...args),
    () => checkpoints,
  );
</script>
