<script lang="ts">
  import {useCheckpointIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {checkpointsId}: {checkpointsId?: Id} = $props();

  const checkpointIds = useCheckpointIds(() => checkpointsId);
</script>

{JSON.stringify(checkpointIds.current)}
