<script lang="ts">
  import {useCheckpointIds} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase/checkpoints';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const v = useCheckpointIds(() => checkpoints);
</script>

{JSON.stringify(v.current)}
