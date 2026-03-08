<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
  import {useCheckpoint} from './hooks.svelte.ts';

  type Props = {
    checkpointId: Id;
    checkpoints?: Checkpoints | Id;
    debugIds?: boolean;
  };

  let {checkpointId, checkpoints, debugIds}: Props = $props();
  const checkpoint = useCheckpoint(
    () => checkpointId,
    () => checkpoints,
  );
  const display = $derived('' + (checkpoint.current ?? ''));
  const output = $derived(debugIds ? `${checkpointId}:{${display}}` : display);
</script>

{output}
