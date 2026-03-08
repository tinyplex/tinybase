<script lang="ts">
  import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
  import type {Id} from '../@types/common/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useCheckpointIds} from './hooks.svelte.ts';
  import CheckpointView from './CheckpointView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    checkpoints?: Checkpoints | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    checkpoint?: Snippet<[checkpointId: Id]>;
  };

  let {checkpoints, separator, debugIds, checkpoint}: Props = $props();
  const checkpointIds = useCheckpointIds(() => checkpoints);
  const ids = $derived(checkpointIds.current[2]);
</script>

<ItemsView {ids} {separator} {debugIds} custom={checkpoint}>
  {#snippet children(checkpointId)}
    <CheckpointView {checkpointId} {checkpoints} {debugIds} />
  {/snippet}
</ItemsView>
