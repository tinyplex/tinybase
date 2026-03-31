<script lang="ts">
  import {createCheckpointsIds} from 'tinybase/ui-svelte';

  const ids = createCheckpointsIds();
</script>

{JSON.stringify(ids.current)}
