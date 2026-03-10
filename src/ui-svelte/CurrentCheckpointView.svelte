<script lang="ts">
  import type {CurrentCheckpointViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCheckpointIds} from './hooks.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';

  let {checkpoints, debugIds, checkpoint}: CurrentCheckpointViewProps =
    $props();
  const checkpointIds = useCheckpointIds(() => checkpoints);
  const currentId = $derived(checkpointIds.current[1]);
</script>

{#if currentId !== undefined}{#if checkpoint}{@render checkpoint(
      currentId,
    )}{:else}<CheckpointView
      checkpointId={currentId}
      {checkpoints}
      {debugIds}
    />{/if}{/if}
