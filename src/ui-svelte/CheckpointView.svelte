<script lang="ts">
  import type {CheckpointViewProps} from '../@types/ui-svelte/index.d.ts';
  import {getCheckpoint} from './functions.svelte.ts';

  let {checkpointId, checkpoints, debugIds}: CheckpointViewProps = $props();
  const checkpoint = getCheckpoint(
    () => checkpointId,
    () => checkpoints,
  );
  const display = $derived('' + (checkpoint.current ?? ''));
  const output = $derived(debugIds ? `${checkpointId}:{${display}}` : display);
</script>

{output}
