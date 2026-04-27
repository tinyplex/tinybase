<script lang="ts">
  import {CurrentCheckpointView} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase/checkpoints';
  import type {Id} from 'tinybase';

  let {checkpoints}: {checkpoints?: Checkpoints | Id} = $props();
</script>

<CurrentCheckpointView {checkpoints}>
  {#snippet checkpoint(checkpointId)}
    current:{checkpointId}
  {/snippet}
</CurrentCheckpointView>
