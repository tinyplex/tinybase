<script lang="ts">
  import {getMetricsIds} from 'tinybase/ui-svelte';

  const ids = getMetricsIds();
</script>

{JSON.stringify(ids.current)}
