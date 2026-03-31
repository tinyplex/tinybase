<script lang="ts">
  import {createCheckpoint} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Checkpoints} from 'tinybase/checkpoints';

  let {
    checkpoints,
    checkpointId,
  }: {
    checkpoints: Checkpoints;
    checkpointId: Id;
  } = $props();
  const v = createCheckpoint(
    () => checkpointId,
    () => checkpoints,
  );
</script>

{JSON.stringify(v.current)}
