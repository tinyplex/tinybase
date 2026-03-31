<script lang="ts">
  import {getCheckpointsIds} from 'tinybase/ui-svelte';

  const ids = getCheckpointsIds();
</script>

{JSON.stringify(ids.current)}
