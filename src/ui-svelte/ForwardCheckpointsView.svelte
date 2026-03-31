<script lang="ts">
  import type {ForwardCheckpointsViewProps} from '../@types/ui-svelte/index.d.ts';
  import {createCheckpointIds} from './functions.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    checkpoints,
    separator,
    debugIds,
    checkpoint,
  }: ForwardCheckpointsViewProps = $props();
  const checkpointIds = createCheckpointIds(() => checkpoints);
  const ids = $derived(checkpointIds.current[2]);
</script>

<Wrap {ids} {separator} {debugIds} custom={checkpoint}>
  {#snippet children(checkpointId)}
    <CheckpointView {checkpointId} {checkpoints} {debugIds} />
  {/snippet}
</Wrap>
