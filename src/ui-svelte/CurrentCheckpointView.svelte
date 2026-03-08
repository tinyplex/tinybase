<script lang="ts">
  import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
  import type {Id} from '../@types/common/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useCheckpointIds} from './hooks.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';

  type Props = {
    checkpoints?: Checkpoints | Id;
    debugIds?: boolean;
    checkpoint?: Snippet<[checkpointId: Id]>;
  };

  let {checkpoints, debugIds, checkpoint}: Props = $props();
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
