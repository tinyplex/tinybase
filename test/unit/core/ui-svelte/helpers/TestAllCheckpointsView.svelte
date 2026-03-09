<script lang="ts">
  import {
    BackwardCheckpointsView,
    CurrentCheckpointView,
    ForwardCheckpointsView,
    CheckpointView,
  } from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase/checkpoints';
  import type {Id} from 'tinybase';

  let {checkpoints}: {checkpoints?: Checkpoints | Id} = $props();
</script>

<BackwardCheckpointsView {checkpoints} />|<CurrentCheckpointView
  {checkpoints}
/>|<ForwardCheckpointsView {checkpoints} />|<CheckpointView
  {checkpoints}
  checkpointId=""
/>|
