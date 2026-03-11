<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase/checkpoints';
  import type {Id} from 'tinybase';
  import ContextCheckpointsChild from './ContextCheckpointsChild.svelte';

  let {
    checkpoints,
    checkpointsById,
    checkpointsId,
  }: {
    checkpoints?: Checkpoints;
    checkpointsById?: Record<Id, Checkpoints>;
    checkpointsId?: Id;
  } = $props();
</script>

<Provider {checkpoints} {checkpointsById}>
  <ContextCheckpointsChild {checkpointsId} />
</Provider>
