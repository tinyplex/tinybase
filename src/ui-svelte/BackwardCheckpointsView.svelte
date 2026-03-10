<script lang="ts">
  import type {BackwardCheckpointsViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCheckpointIds} from './hooks.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    checkpoints,
    separator,
    debugIds,
    checkpoint,
  }: BackwardCheckpointsViewProps = $props();
  const checkpointIds = useCheckpointIds(() => checkpoints);
  const ids = $derived(checkpointIds.current[0]);
</script>

<Wrap {ids} {separator} {debugIds} custom={checkpoint}>
  {#snippet children(checkpointId)}
    <CheckpointView {checkpointId} {checkpoints} {debugIds} />
  {/snippet}
</Wrap>
