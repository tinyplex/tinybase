<script lang="ts">
  import {useCheckpointListener} from 'tinybase/ui-svelte';
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
  useCheckpointListener(
    () => checkpointId,
    (...args) => listener(...args),
    () => checkpoints,
  );
</script>
