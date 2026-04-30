<script lang="ts">
  import type {CurrentCheckpointViewProps} from '../@types/ui-svelte/index.d.ts';
  import {getCheckpointIds} from './functions.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import {isNullish} from '../common/other.ts';

  let {checkpoints, debugIds, checkpoint}: CurrentCheckpointViewProps =
    $props();
  const checkpointIds = getCheckpointIds(() => checkpoints);
  const currentId = $derived(checkpointIds.current[1]);
</script>

{#if !isNullish(currentId)}{#if checkpoint}{@render checkpoint(
      currentId,
    )}{:else}<CheckpointView
      checkpointId={currentId}
      {checkpoints}
      {debugIds}
    />{/if}{/if}
