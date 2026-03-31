<script lang="ts">
  import {createCheckpointIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {checkpointsId}: {checkpointsId?: Id} = $props();

  const checkpointIds = createCheckpointIds(() => checkpointsId);
</script>

{JSON.stringify(checkpointIds.current)}
