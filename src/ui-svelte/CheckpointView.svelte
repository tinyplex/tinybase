<script lang="ts">
  import type {CheckpointViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCheckpoint} from './hooks.svelte.ts';

  let {checkpointId, checkpoints, debugIds}: CheckpointViewProps = $props();
  const checkpoint = useCheckpoint(
    () => checkpointId,
    () => checkpoints,
  );
  const display = $derived('' + (checkpoint.current ?? ''));
  const output = $derived(debugIds ? `${checkpointId}:{${display}}` : display);
</script>

{output}
