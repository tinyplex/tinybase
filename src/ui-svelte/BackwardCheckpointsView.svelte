<script lang="ts">
  import type {BackwardCheckpointsViewProps} from '../@types/ui-svelte/index.d.ts';
  import {getCheckpointIds} from './functions.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    checkpoints,
    separator,
    debugIds,
    checkpoint,
  }: BackwardCheckpointsViewProps = $props();
  const checkpointIds = getCheckpointIds(() => checkpoints);
  const ids = $derived(checkpointIds.current[0]);
</script>

<Wrap {ids} {separator} {debugIds} custom={checkpoint}>
  {#snippet children(checkpointId)}
    <CheckpointView {checkpointId} {checkpoints} {debugIds} />
  {/snippet}
</Wrap>
