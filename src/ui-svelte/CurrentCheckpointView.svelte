<script lang="ts">
  import type {CurrentCheckpointViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCheckpointIds} from './hooks.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import {isUndefined} from '../common/other.ts';

  let {checkpoints, debugIds, checkpoint}: CurrentCheckpointViewProps =
    $props();
  const checkpointIds = useCheckpointIds(() => checkpoints);
  const currentId = $derived(checkpointIds.current[1]);
</script>

{#if !isUndefined(currentId)}{#if checkpoint}{@render checkpoint(
      currentId,
    )}{:else}<CheckpointView
      checkpointId={currentId}
      {checkpoints}
      {debugIds}
    />{/if}{/if}
