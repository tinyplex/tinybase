<script lang="ts">
  import type {ForwardCheckpointsViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCheckpointIds} from './hooks.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {
    checkpoints,
    separator,
    debugIds,
    checkpoint,
  }: ForwardCheckpointsViewProps = $props();
  const checkpointIds = useCheckpointIds(() => checkpoints);
  const ids = $derived(checkpointIds.current[2]);
</script>

<ItemsView {ids} {separator} {debugIds} custom={checkpoint}>
  {#snippet children(checkpointId)}
    <CheckpointView {checkpointId} {checkpoints} {debugIds} />
  {/snippet}
</ItemsView>
