<script lang="ts">
  import {getCheckpoint} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Checkpoints} from 'tinybase/checkpoints';

  let {
    checkpoints,
    checkpointId,
  }: {
    checkpoints: Checkpoints;
    checkpointId: Id;
  } = $props();
  const v = getCheckpoint(
    () => checkpointId,
    () => checkpoints,
  );
</script>

{JSON.stringify(v.current)}
