<script lang="ts">
  import {createCheckpointIds} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase/checkpoints';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const v = createCheckpointIds(() => checkpoints);
</script>

{JSON.stringify(v.current)}
