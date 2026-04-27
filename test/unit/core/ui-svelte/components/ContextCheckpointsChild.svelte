<script lang="ts">
  import {getCheckpointIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {checkpointsId}: {checkpointsId?: Id} = $props();

  const checkpointIds = getCheckpointIds(() => checkpointsId);
</script>

{JSON.stringify(checkpointIds.current)}
