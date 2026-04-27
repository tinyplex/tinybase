<script lang="ts">
  import {getCheckpointIds} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase/checkpoints';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const v = getCheckpointIds(() => checkpoints);
</script>

{JSON.stringify(v.current)}
